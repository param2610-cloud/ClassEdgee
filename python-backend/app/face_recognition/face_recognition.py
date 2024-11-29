# app/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import cv2
import numpy as np
from PIL import Image
import os
import datetime
import pandas as pd
from pydantic import BaseModel

class Student(BaseModel):
    enrollment: str
    name: str

class AttendanceRecord(BaseModel):
    enrollment: str
    name: str
    date: str
    time: str
    subject: str

face_recognition_router = APIRouter(prefix="/face_recognition_router", tags=["Face Recognition"])



class FaceRecognitionSystem:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
        self.recognizer = cv2.face.LBPHFaceRecognizer_create()
        try:
            self.recognizer.read("TrainingImageLabel/Trainner.yml")
        except:
            print("No training model found")

    def detect_face(self, img_array):
        gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        return faces, gray

    def train_model(self, training_images_path):
        faces = []
        ids = []
        
        for image_path in os.listdir(training_images_path):
            pil_img = Image.open(os.path.join(training_images_path, image_path)).convert('L')
            img_array = np.array(pil_img, 'uint8')
            id = int(image_path.split('.')[1])
            
            detected_faces = self.face_cascade.detectMultiScale(img_array)
            for (x, y, w, h) in detected_faces:
                faces.append(img_array[y:y + h, x:x + w])
                ids.append(id)
                
        self.recognizer.train(faces, np.array(ids))
        self.recognizer.save("TrainingImageLabel/Trainner.yml")
        return True

face_system = FaceRecognitionSystem()

@face_recognition_router.post("/register/")
async def register_student(student: Student, images: List[UploadFile] = File(...)):
    try:
        os.makedirs("TrainingImage", exist_ok=True)
        
        for i, image in enumerate(images):
            contents = await image.read()
            nparr = np.fromstring(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            faces, gray = face_system.detect_face(img)
            if len(faces) == 0:
                raise HTTPException(status_code=400, detail="No face detected in image")
                
            filename = f"TrainingImage/{student.name}.{student.enrollment}.{i+1}.jpg"
            cv2.imwrite(filename, gray)
            
        # Update student details CSV
        with open('StudentDetails/StudentDetails.csv', 'a') as f:
            f.write(f"{student.enrollment},{student.name},{datetime.datetime.now().date()},{datetime.datetime.now().time()}\n")
            
        return {"message": "Student registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@face_recognition_router.post("/train/")
async def train_model():
    try:
        success = face_system.train_model("TrainingImage")
        if success:
            return {"message": "Model trained successfully"}
        raise HTTPException(status_code=500, detail="Training failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@face_recognition_router.post("/mark-attendance/")
async def mark_attendance(subject: str, image: UploadFile = File(...)):
    try:
        contents = await image.read()
        nparr = np.fromstring(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        faces, gray = face_system.detect_face(img)
        if len(faces) == 0:
            raise HTTPException(status_code=400, detail="No face detected")
            
        student_data = pd.read_csv("StudentDetails/StudentDetails.csv")
        attendance_records = []
        
        for (x, y, w, h) in faces:
            id, conf = face_system.recognizer.predict(gray[y:y + h, x:x + w])
            if conf < 70:
                student = student_data[student_data['Enrollment'] == str(id)].iloc[0]
                timestamp = datetime.datetime.now()
                
                record = AttendanceRecord(
                    enrollment=str(id),
                    name=student['Name'],
                    date=timestamp.date().isoformat(),
                    time=timestamp.time().isoformat(),
                    subject=subject
                )
                attendance_records.append(record)
                
        # Save attendance records
        if attendance_records:
            df = pd.DataFrame([record.dict() for record in attendance_records])
            filename = f"Attendance/{subject}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(filename, index=False)
            
        return {"message": "Attendance marked", "records": attendance_records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@face_recognition_router.get("/students/")
async def get_students():
    try:
        df = pd.read_csv("StudentDetails/StudentDetails.csv")
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@face_recognition_router.get("/attendance/{subject}")
async def get_attendance(subject: str, date: Optional[str] = None):
    try:
        attendance_dir = "Attendance"
        attendance_files = [f for f in os.listdir(attendance_dir) if f.startswith(subject)]
        
        if date:
            attendance_files = [f for f in attendance_files if date in f]
            
        if not attendance_files:
            return []
            
        # Get most recent attendance file if date not specified
        latest_file = sorted(attendance_files)[-1]
        df = pd.read_csv(os.path.join(attendance_dir, latest_file))
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))