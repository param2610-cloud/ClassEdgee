from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
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

face_router = APIRouter(
    prefix="/api/face-recognition",
    tags=["Face Recognition"]
)

class FaceRecognitionService:
    def __init__(self, conn):
        self.conn = conn
        self.cursor = conn.cursor(cursor_factory=RealDictCursor)
        self.detector = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
        self.recognizer = cv2.face.LBPHFaceRecognizer_create()

    async def register_student_face(self, base64_image: str, student_id: int, enrollment: str):
        try:
            # Process image
            img = self._process_base64_image(base64_image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.detector.detectMultiScale(gray, 1.3, 5)

            if not faces:
                raise HTTPException(status_code=400, detail="No face detected")

            x, y, w, h = faces[0]
            face_img = gray[y:y+h, x:x+w]
            face_encoding = cv2.imencode('.jpg', face_img)[1].tobytes()

            # Upload to Cloudinary
            cloudinary_response = cloudinary.uploader.upload(
                base64_image,
                folder="student_faces",
                public_id=f"student_{enrollment}",
                overwrite=True
            )

            # Update student record
            sql = """
                UPDATE students 
                SET face_encoding = %s, cloudinary_url = %s
                WHERE student_id = %s
            """
            self.cursor.execute(sql, (
                face_encoding,
                cloudinary_response['secure_url'],
                student_id
            ))
            self.conn.commit()

            return {"message": "Face registered successfully"}

        except Exception as e:
            self.conn.rollback()
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    async def process_attendance(self, class_id: int, frame_data: str):
        try:
            # Get class and section details
            sql = """
                SELECT c.*, s.*, st.*
                FROM classes c
                JOIN sections s ON c.section_id = s.section_id
                JOIN students st ON st.section_id = s.section_id
                WHERE c.class_id = %s
            """
            self.cursor.execute(sql, (class_id,))
            class_details = self.cursor.fetchall()

            if not class_details:
                raise HTTPException(status_code=404, detail="Class not found")

            # Process frame
            frame = self._process_base64_image(frame_data)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.detector.detectMultiScale(gray, 1.2, 5)

            attendance_records = []
            current_date = date.today()

            # Process each detected face
            for (x, y, w, h) in faces:
                face_img = gray[y:y+h, x:x+w]
                
                for student in class_details:
                    if not student['face_encoding']:
                        continue

                    if self._compare_faces(face_img, student['face_encoding']):
                        # Check existing attendance
                        self.cursor.execute("""
                            SELECT * FROM attendance 
                            WHERE class_id = %s 
                            AND student_id = %s 
                            AND date = %s
                        """, (class_id, student['student_id'], current_date))
                        
                        if not self.cursor.fetchone():
                            # Create attendance record
                            sql = """
                                INSERT INTO attendance (
                                    class_id, student_id, date, status,
                                    verification_method, created_at
                                ) VALUES (%s, %s, %s, %s, %s, %s)
                                RETURNING *
                            """
                            self.cursor.execute(sql, (
                                class_id,
                                student['student_id'],
                                current_date,
                                'present',
                                'facial',
                                datetime.now()
                            ))
                            attendance_records.append(self.cursor.fetchone())

            self.conn.commit()
            return {
                "message": f"Processed {len(attendance_records)} records",
                "records": attendance_records
            }

        except Exception as e:
            self.conn.rollback()
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    def _process_base64_image(self, base64_string: str) -> np.ndarray:
        img_data = base64.b64decode(
            base64_string.split(',')[1] if ',' in base64_string 
            else base64_string
        )
        nparr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def _compare_faces(self, face1: np.ndarray, face2_encoding: bytes, 
                      tolerance: float = 0.6) -> bool:
        try:
            face2 = cv2.imdecode(
                np.frombuffer(face2_encoding, np.uint8),
                cv2.IMREAD_GRAYSCALE
            )
            face1 = cv2.resize(face1, (100, 100))
            face2 = cv2.resize(face2, (100, 100))
            diff = cv2.absdiff(face1, face2)
            similarity = 1 - (np.sum(diff) / (255 * diff.size))
            return similarity > tolerance
        except Exception as e:
            print(f"Face comparison error: {str(e)}")
            return False

@face_router.post("/register-face")
async def register_face(data: FaceRegistrationRequest, conn = Depends(get_db_connection)):
    service = FaceRecognitionService(conn)
    return await service.register_student_face(
        data.image,
        data.student_id,
        data.enrollment
    )

@face_router.post("/process-attendance/{class_id}")
async def process_attendance(
    class_id: int,
    frame_data: str,
    conn = Depends(get_db_connection)
):
    service = FaceRecognitionService(conn)
    return await service.process_attendance(class_id, frame_data)

@face_router.get("/attendance/{class_id}")
async def get_attendance(
    class_id: int,
    date_str: Optional[str] = None,
    conn = Depends(get_db_connection)
):
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        attendance_date = (
            datetime.strptime(date_str, '%Y-%m-%d').date()
            if date_str else date.today()
        )

        sql = """
            SELECT a.*, s.enrollment_number, u.first_name, u.last_name
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE a.class_id = %s AND a.date = %s
        """
        cursor.execute(sql, (class_id, attendance_date))
        records = cursor.fetchall()

        return {
            "attendance": [
                AttendanceRecord(
                    student_name=f"{r['first_name']} {r['last_name']}",
                    enrollment=r['enrollment_number'],
                    status=r['status'],
                    time=r['created_at'].strftime('%H:%M:%S')
                ) for r in records
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")