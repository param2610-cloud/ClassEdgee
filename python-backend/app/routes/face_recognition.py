import os
import requests
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks, Form
from typing import List, Optional
import cv2 
import numpy as np
import cloudinary
import cloudinary.uploader
from datetime import date, datetime
import base64
import psycopg2
from psycopg2.extras import RealDictCursor
from routes.dependencies import get_db_connection
from routes.attendance import (
    FaceRegistrationRequest,
    AttendanceResponse,
    AttendanceRecord
)
from typing import Dict
import asyncio
import json

face_router = APIRouter(
    prefix="/api/face-recognition",
    tags=["Face Recognition"]
)

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)
HAAR_CASCADE_URL = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
HAAR_CASCADE_PATH = "haarcascade_frontalface_default.xml"

if not os.path.exists(HAAR_CASCADE_PATH):
    response = requests.get(HAAR_CASCADE_URL)
    with open(HAAR_CASCADE_PATH, "wb") as f:
        f.write(response.content)
# Define paths
TEMP_FOLDER = "temp_images"
TRAINING_FOLDER = "training_images"
TRAINING_LABEL_FOLDER = "training_labels"

# Ensure directories exist
os.makedirs(TEMP_FOLDER, exist_ok=True)
os.makedirs(TRAINING_FOLDER, exist_ok=True)
os.makedirs(TRAINING_LABEL_FOLDER, exist_ok=True)

class AttendanceStart(BaseModel):
    duration_minutes: int = 1  

class FaceRegistrationRequest(BaseModel):
    user_id: int
    imageUrls: List[str]


async def upload_to_cloudinary(file_path: str, folder: str) -> str:
    try:
        response = cloudinary.uploader.upload(
            file_path,
            resource_type="raw",
            folder=folder,
            upload_preset=os.getenv('CLOUDINARY_UPLOAD_PRESET')
        )
        return response['secure_url']
    except Exception as e:
        print(f"Error uploading to Cloudinary: {str(e)}")
        raise

import face_recognition
import numpy as np
import pickle
import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import cloudinary
import cloudinary.uploader
from datetime import datetime

class AttendanceSystem:
    def process_images(self, image_paths, enrollment):
        all_encodings = []
        
        for image_path in image_paths:
            # Load image
            image = face_recognition.load_image_file(image_path)
            
            # Find face locations
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                continue
                
            # Get face encodings
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if face_encodings:
                all_encodings.append({
                    'enrollment': enrollment,
                    'encoding': face_encodings[0]
                })
                
        return all_encodings

    async def load_section_model(self, model_url):
        if not model_url:
            return {}
            
        try:
            response = requests.get(model_url)
            response.raise_for_status()
            return pickle.loads(response.content)
        except:
            return {}

    def save_model(self, model_path, encodings):
        with open(model_path, 'wb') as f:
            pickle.dump(encodings, f)


@face_router.post("/register-face")
async def register_face(request: FaceRegistrationRequest):
    image_paths = []
    temp_model_path = None
    
    with get_db_connection() as conn:
        try:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # Get student details and section
            cur.execute("""
                SELECT s.*, sec.section_id, sec.face_recognition_model 
                FROM students s
                LEFT JOIN sections sec ON s.section_id = sec.section_id
                WHERE s.user_id = %s
            """, (request.user_id,))
            
            student_data = cur.fetchone()
            
            if not student_data:
                raise HTTPException(status_code=404, detail="Student not found")
            
            # Download and save images
            for idx, url in enumerate(request.imageUrls):
                try:
                    print(f"Downloading image {url}")
                    response = requests.get(url)
                    response.raise_for_status()
                    
                    temp_path = os.path.join(TEMP_FOLDER, f"{student_data['enrollment_number']}_face_{idx}.jpg")
                    os.makedirs(os.path.dirname(temp_path), exist_ok=True)  # Ensure directory exists
                    with open(temp_path, "wb") as f:
                        f.write(response.content)
                    image_paths.append(temp_path)
                except Exception as e:
                    print(f"Error downloading image {idx}: {str(e)}")
                    continue
            
            if not image_paths:
                raise HTTPException(status_code=400, detail="No valid images provided")
                
            # Initialize face recognition system and process faces
            face_system = AttendanceSystem()
            new_encodings = face_system.process_images(image_paths, student_data['enrollment_number'])
            
            if not new_encodings:
                raise HTTPException(status_code=400, detail="No faces detected in the images")
            
            # Load existing model if it exists
            existing_encodings = await face_system.load_section_model(student_data['face_recognition_model'])
            
            # Combine existing and new encodings
            section_encodings = existing_encodings.copy()
            section_encodings[student_data['enrollment_number']] = new_encodings
            
            # Save combined model
            model_filename = f"section_{student_data['section_id']}_model.pkl"
            model_path = os.path.join(TRAINING_LABEL_FOLDER, model_filename)
            face_system.save_model(model_path, section_encodings)
            
            # Upload to Cloudinary
            model_url = await upload_to_cloudinary(
                model_path,
                f"face_recognition/section_{student_data['section_id']}"
            )
            
            # Update section
            cur.execute("""
                UPDATE sections 
                SET face_recognition_model = %s
                WHERE section_id = %s
            """, (model_url, student_data['section_id']))
            
            conn.commit()
            
            return {
                "message": "Face registration successful",
                "model_url": model_url
            }
            
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
            
        finally:
            # Cleanup
            for path in image_paths:
                try:
                    os.remove(path)
                except:
                    pass
    

attendance_states: Dict[str, datetime] = {}
active_streams: Dict[int, bool] = {}

   
@face_router.post("/stop-attendance/{class_id}")
async def stop_attendance(class_id: int):
    """
    Stop an active attendance monitoring session for a specific class.
    
    Args:
        class_id (int): The ID of the class to stop attendance monitoring for
        
    Returns:
        dict: A message indicating the attendance monitoring has been stopped
        
    Raises:
        HTTPException: If no active session is found or if the class doesn't exist
    """
    try:
        # First verify if the class exists
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT class_id 
                FROM classes 
                WHERE class_id = %s
            """, (class_id,))
            
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=404,
                    detail="Class not found"
                )

        # Check if there's an active stream for this class
        if class_id not in active_streams:
            raise HTTPException(
                status_code=404,
                detail="No active attendance session found for this class"
            )
        
        # Stop the stream and remove from active streams
        active_streams[class_id] = False
        
        # Wait a short time to ensure the stream has stopped
        await asyncio.sleep(0.5)
        
        # Remove from active streams if it hasn't been removed by the process
        active_streams.pop(class_id, None)
        
        return {
            "message": "Attendance monitoring stopped successfully",
            "class_id": class_id,
            "status": "stopped"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error stopping attendance: {str(e)}")
        # Clean up the active streams entry in case of error
        active_streams.pop(class_id, None)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to stop attendance monitoring: {str(e)}"
        )
class AttendanceStart(BaseModel):
    duration_minutes: int = 60
async def process_video_stream(section_id: int, class_id: int, duration_minutes: int):
    try:
        # Initial database connection to get section and model data
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # Updated query removing non-existent class_name column
            cursor.execute("""
                SELECT s.*, c.class_id, s.face_recognition_model
                FROM sections s
                JOIN classes c ON s.section_id = c.section_id
                WHERE s.section_id = %s AND c.class_id = %s
            """, (section_id, class_id))
            
            section_data = cursor.fetchone()
            
            if not section_data:
                raise HTTPException(status_code=404, detail="Section or class not found")
                
            if not section_data['face_recognition_model']:
                raise HTTPException(
                    status_code=400, 
                    detail="Face recognition model not found for this section. Please register student faces first."
                )

        # Load face recognition model from URL
        try:
            response = requests.get(section_data['face_recognition_model'])
            response.raise_for_status()
            known_faces = pickle.loads(response.content)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error loading face recognition model: {str(e)}"
            )

        # Initialize video capture
        # cap = cv2.VideoCapture("./sample_video.mp4")
        cap = cv2.VideoCapture("http://192.168.137.209:4747/video")
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Unable to access video source")

        start_time = datetime.now()
        active_streams[class_id] = True
        
        while (datetime.now() - start_time).seconds < (duration_minutes * 60) and active_streams[class_id]:
            ret, frame = cap.read()
            if not ret:
                continue

            # Process every 30th frame
            if cap.get(cv2.CAP_PROP_POS_FRAMES) % 30 != 0:
                continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            current_date = date.today()

            # Process each detected face
            for encoding in face_encodings:
                for enrollment, student_encodings in known_faces.items():
                    matches = []
                    for stored_encoding in student_encodings:
                        match = face_recognition.compare_faces(
                            [stored_encoding['encoding']], 
                            encoding,
                            tolerance=0.6
                        )[0]
                        matches.append(match)

                    if any(matches):
                        state_key = f"{enrollment}_{class_id}_{current_date}"
                        
                        if state_key in attendance_states:
                            if (datetime.now() - attendance_states[state_key]).seconds < 300:
                                continue

                        with get_db_connection() as conn:
                            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                            
                            try:
                                # Updated query to include section_id check
                                cursor.execute("""
                                    SELECT student_id 
                                    FROM students 
                                    WHERE enrollment_number = %s 
                                    AND section_id = %s
                                """, (enrollment, section_id))
                                
                                student = cursor.fetchone()

                                if student:
                                    cursor.execute("""
                                        SELECT * FROM attendance 
                                        WHERE class_id = %s 
                                        AND student_id = %s 
                                        AND date = %s
                                    """, (class_id, student['student_id'], current_date))

                                    if not cursor.fetchone():
                                        device_info = json.dumps({
                                            "device_type": "Laptop Camera",
                                            "recognition_confidence": float(max(matches))
                                        })

                                        cursor.execute("""
                                            INSERT INTO attendance (
                                                class_id, student_id, date, status,
                                                verification_method, device_info, created_at
                                            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                                        """, (
                                            class_id,
                                            student['student_id'],
                                            current_date,
                                            'present',
                                            'facial',
                                            device_info,
                                            datetime.now()
                                        ))
                                        conn.commit()
                                        attendance_states[state_key] = datetime.now()
                            except Exception as e:
                                print(f"Error recording attendance: {str(e)}")
                                conn.rollback()

            await asyncio.sleep(0.1)

    except Exception as e:
        print(f"Error in process_video_stream: {str(e)}")
        raise
    finally:
        if 'cap' in locals():
            cap.release()
        active_streams.pop(class_id, None)

@face_router.post("/start-attendance/{section_id}/{class_id}")
async def start_attendance(
    section_id: int,
    class_id: int,
    request: AttendanceStart,
    background_tasks: BackgroundTasks
):
    try:
        if class_id in active_streams:
            raise HTTPException(status_code=400, detail="Attendance already in progress")
            
        # Updated query to match schema
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT s.section_id, s.face_recognition_model 
                FROM sections s
                JOIN classes c ON s.section_id = c.section_id
                WHERE s.section_id = %s AND c.class_id = %s
            """, (section_id, class_id))
            
            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=404, detail="Invalid section or class ID")
            
            if not result['face_recognition_model']:
                raise HTTPException(
                    status_code=400, 
                    detail="Face recognition model not found. Please register student faces first."
                )
        
        background_tasks.add_task(
            process_video_stream,
            section_id,
            class_id,
            request.duration_minutes
        )
        
        return {
            "message": "Attendance monitoring started",
            "duration_minutes": request.duration_minutes,
            "section_id": section_id,
            "class_id": class_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting attendance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start attendance monitoring: {str(e)}")
        
        
@face_router.get("/class-attendance/{class_id}")
async def get_class_attendance(
    class_id: int,
    date_str: Optional[str] = None,
    conn = Depends(get_db_connection)
):
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()

        cursor.execute("""
            SELECT 
                s.enrollment_number,
                u.first_name,
                u.last_name,
                a.status,
                a.verification_method,
                a.device_info,
                a.created_at as marked_time
            FROM students s
            JOIN classes c ON s.section_id = c.section_id
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN attendance a ON 
                a.student_id = s.student_id AND 
                a.class_id = c.class_id AND
                a.date = %s
            WHERE c.class_id = %s
            ORDER BY s.enrollment_number
        """, (attendance_date, class_id))

        records = cursor.fetchall()
        return {
            "date": attendance_date,
            "attendance": records
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@face_router.post("/process-video-attendance/{section_id}/{class_id}")
async def process_video_attendance(
    section_id: int,
    class_id: int,
    video: UploadFile = File(...),
    duration_minutes: int = Form(default=60),
    attendance_date: str = Form(default=None),
    skip_frames: int = Form(default=30),
    confidence_threshold: float = Form(default=0.6)
):
    try:
        # Validate video file
        if not video.content_type.startswith('video/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a video file."
            )

        # Save uploaded video temporarily
        temp_video_path = os.path.join(TEMP_FOLDER, f"temp_video_{class_id}.mp4")
        try:
            with open(temp_video_path, "wb") as buffer:
                content = await video.read()
                buffer.write(content)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error saving video file: {str(e)}"
            )

        # Get section and model data
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT s.*, c.class_id, s.face_recognition_model
                FROM sections s
                JOIN classes c ON s.section_id = c.section_id
                WHERE s.section_id = %s AND c.class_id = %s
            """, (section_id, class_id))
            
            section_data = cursor.fetchone()
            
            if not section_data:
                raise HTTPException(status_code=404, detail="Section or class not found")
                
            if not section_data['face_recognition_model']:
                raise HTTPException(
                    status_code=400, 
                    detail="Face recognition model not found for this section. Please register student faces first."
                )

        # Load face recognition model
        try:
            response = requests.get(section_data['face_recognition_model'])
            response.raise_for_status()
            known_faces = pickle.loads(response.content)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error loading face recognition model: {str(e)}"
            )

        # Process video
        attendance_records = []
        cap = cv2.VideoCapture(temp_video_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Unable to process video file")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        video_duration = total_frames / fps  # in seconds

        # Process frames
        processed_students = set()  # Track processed students
        current_date = date.today()

        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Process every 30th frame for efficiency
            if frame_count % 30 != 0:
                frame_count += 1
                continue

            # Convert frame to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            # Process each detected face
            for encoding in face_encodings:
                for enrollment, student_encodings in known_faces.items():
                    # Skip if student already processed
                    if enrollment in processed_students:
                        continue

                    matches = []
                    for stored_encoding in student_encodings:
                        match = face_recognition.compare_faces(
                            [stored_encoding['encoding']], 
                            encoding,
                            tolerance=0.6
                        )[0]
                        matches.append(match)

                    if any(matches):
                        with get_db_connection() as conn:
                            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                            try:
                                cursor.execute("""
                                    SELECT student_id 
                                    FROM students 
                                    WHERE enrollment_number = %s 
                                    AND section_id = %s
                                """, (enrollment, section_id))
                                
                                student = cursor.fetchone()

                                if student:
                                    # Record attendance
                                    device_info = json.dumps({
                                        "device_type": "Uploaded Video",
                                        "recognition_confidence": float(max(matches)),
                                        "frame_timestamp": frame_count / fps
                                    })

                                    cursor.execute("""
                                        INSERT INTO attendance (
                                            class_id, student_id, date, status,
                                            verification_method, device_info, created_at
                                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                                        ON CONFLICT (class_id, student_id, date) DO NOTHING
                                        RETURNING *
                                    """, (
                                        class_id,
                                        student['student_id'],
                                        current_date,
                                        'present',
                                        'facial',
                                        device_info,
                                        datetime.now()
                                    ))
                                    
                                    attendance_record = cursor.fetchone()
                                    if attendance_record:
                                        attendance_records.append(attendance_record)
                                        processed_students.add(enrollment)
                                    
                                    conn.commit()

                            except Exception as e:
                                print(f"Error recording attendance: {str(e)}")
                                conn.rollback()

            frame_count += 1

        cap.release()

        # Clean up
        try:
            os.remove(temp_video_path)
        except:
            pass

        return {
            "message": "Video attendance processing completed",
            "video_duration_seconds": video_duration,
            "processed_frames": frame_count,
            "students_marked_present": len(processed_students),
            "attendance_records": attendance_records
        }

    except Exception as e:
        print(f"Error processing video attendance: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process video attendance: {str(e)}"
        )
    finally:
        # Ensure video file is cleaned up
        if 'temp_video_path' in locals():
            try:
                os.remove(temp_video_path)
            except:
                pass