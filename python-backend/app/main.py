import os
import uuid
import pandas as pd
import numpy as np
from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, date
import bcrypt
from student.studentRouter import student_router
# from face_recognition.face_recognition import face_recognition_router
from schedule.scheduler import ScheduleGenerator
import json
from typing import Dict, List
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Faculty Management API",
    description="API for managing faculty records and bulk uploads with data type validation",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database column type validation and conversion
class DataValidator:
    @staticmethod
    def validate_and_convert_users_table(row):
        """
        Validate and convert data for users table columns
        """
        validated_data = {}
        
        # UUID validation (string)
        validated_data['uuid'] = str(uuid.uuid4())
        
        # Email validation (string, max 255 chars)
        if not isinstance(row['email'], str):
            row['email'] = str(row['email'])
        validated_data['email'] = row['email'][:255]
        
        # First Name validation (string, max 100 chars)
        if not isinstance(row['firstName'], str):
            row['firstName'] = str(row['firstName'])
        validated_data['first_name'] = row['firstName'][:100]
        
        # Last Name validation (string, max 100 chars)
        if not isinstance(row['lastName'], str):
            row['lastName'] = str(row['lastName'])
        validated_data['last_name'] = row['lastName'][:100]
        
        # Phone Number validation (string, nullable, max 20 chars)
        if pd.notna(row['phoneNumber']):
            validated_data['phone_number'] = str(row['phoneNumber'])[:20]
        else:
            validated_data['phone_number'] = None
        
        # College UID validation (string, unique)
        if not isinstance(row['employeeId'], str):
            row['employeeId'] = str(row['employeeId'])
        validated_data['college_uid'] = row['employeeId'][:255]
        
        # Created_at will be automatically set by database
        return validated_data
    
    @staticmethod
    def validate_and_convert_faculty_table(row, user_id):
        """
        Validate and convert data for faculty table columns
        """
        validated_data = {
            'user_id': user_id
        }
        
        # Department ID validation (integer)
        validated_data['department_id'] = int(row['departmentId']) if pd.notna(row['departmentId']) else None
        
        # Designation validation (string, max 100 chars)
        if not isinstance(row['designation'], str):
            row['designation'] = str(row['designation'])
        validated_data['designation'] = row['designation'][:100]
        
        # Expertise validation (string array)
        if pd.notna(row['expertise']):
            expertise = str(row['expertise']).split(',')
            validated_data['expertise'] = [exp.strip() for exp in expertise]
        else:
            validated_data['expertise'] = []
        
        # Qualifications validation (string array)
        if pd.notna(row['qualifications']):
            qualifications = str(row['qualifications']).split(',')
            validated_data['qualifications'] = [qual.strip() for qual in qualifications]
        else:
            validated_data['qualifications'] = []
        
        # Max Weekly Hours validation (integer, default 40)
        validated_data['max_weekly_hours'] = int(row.get('maxWeeklyHours', 40))
        
        # Joining Date validation (date)
        if pd.notna(row['joiningDate']):
            validated_data['joining_date'] = pd.to_datetime(row['joiningDate']).date()
        else:
            raise ValueError("Joining Date is required")
        
        # Contract End Date validation (date, nullable)
        if pd.notna(row['contractEndDate']):
            validated_data['contract_end_date'] = pd.to_datetime(row['contractEndDate']).date()
        else:
            validated_data['contract_end_date'] = None
        
        # Research Interests validation (string array)
        if pd.notna(row['researchInterests']):
            interests = str(row['researchInterests']).split(',')
            validated_data['research_interests'] = [interest.strip() for interest in interests]
        else:
            validated_data['research_interests'] = []
        
        # Publications validation (string array)
        if pd.notna(row['publications']):
            publications = str(row['publications']).split(',')
            validated_data['publications'] = [pub.strip() for pub in publications]
        else:
            validated_data['publications'] = []
        
        return validated_data

# Database connection function (same as previous implementation)
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")




class ScheduleRequest(BaseModel):
    departments: Dict
    rooms: List[Dict]
    time_slots: Dict

@app.post("/generate-schedule")
async def generate_schedule(request: ScheduleRequest):
    try:
        # Save incoming data to JSON file for scheduler
        with open("data.json", "w") as f:
            json.dump(request.dict(), f, indent=2)
        
        # Initialize scheduler and generate schedule
        scheduler = ScheduleGenerator("data.json")
        schedule = scheduler.generate_schedule()
        
        # Convert schedule to JSON-friendly format
        json_schedule = scheduler._convert_schedule_for_json(schedule)
        
        return json_schedule
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Router for faculty bulk upload
faculty_router = APIRouter(prefix="/faculty", tags=["Faculty"])




@faculty_router.post("/process-faculty-excel")
async def process_faculty_excel(file: UploadFile = File(...)):
    try:
        # Read Excel file
        df = pd.read_excel(file.file)
        
        # Validate required columns
        required_columns = [
            'email', 'firstName', 'lastName', 'phoneNumber', 
            'departmentId', 'employeeId', 'designation', 
            'expertise', 'qualifications', 'joiningDate',"password"
        ]
        
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")
        
        # Establish database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Prepare lists for bulk insert
        user_data = []
        faculty_data = []
        
        # Process each row
        successful_uploads = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Validate and convert user data
                # Validate and convert user data
                user_entry = DataValidator.validate_and_convert_users_table(row)

                # Generate hashed password
                password = row.get('password', 'classedgee')  # Use default password if not provided
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                user_entry['password_hash'] = hashed_password.decode('utf-8')  # Convert to string
                user_entry['role'] = 'faculty'
                # Insert user into the database
                user_insert_query = """
                INSERT INTO users (uuid, email, first_name, last_name, phone_number, college_uid, password_hash,role)
                VALUES (%(uuid)s, %(email)s, %(first_name)s, %(last_name)s, %(phone_number)s, %(college_uid)s, %(password_hash)s, %(role)s)
                RETURNING user_id
                """
                cursor.execute(user_insert_query, user_entry)
                user_id = cursor.fetchone()[0]

                
                # Validate and convert faculty data
                faculty_entry = DataValidator.validate_and_convert_faculty_table(row, user_id)
                
                # Perform faculty insert
                faculty_insert_query = """
                INSERT INTO faculty (
                    user_id, department_id, designation, 
                    expertise, qualifications, joining_date, 
                    max_weekly_hours, contract_end_date, 
                    research_interests, publications
                ) VALUES (
                    %(user_id)s, %(department_id)s, %(designation)s, 
                    %(expertise)s, %(qualifications)s, %(joining_date)s, 
                    %(max_weekly_hours)s, %(contract_end_date)s, 
                    %(research_interests)s, %(publications)s
                )
                """
                
                cursor.execute(faculty_insert_query, faculty_entry)
                
                successful_uploads += 1
            
            except Exception as row_error:
                print(f"Error processing row {index + 2}: {row_error}")
                errors.append({
                    'row': index + 2,  # Excel rows start at 1, header is row 1
                    'error': str(row_error)
                })
        
        # Check for errors before final processing
        if errors:
            conn.rollback()
            return JSONResponse(content={
                "message": "Upload failed",
                "errors": errors
            }, status_code=400)
        
        try:
            # Commit transactions
            conn.commit()
        except Exception as commit_error:
            conn.rollback()
            return JSONResponse(content={
                "message": "Database commit failed",
                "error": str(commit_error)
            }, status_code=500)
        
        finally:
            # Close database connection
            cursor.close()
            conn.close()
        
        return JSONResponse(content={
            "message": f"Successfully uploaded {successful_uploads} faculty records",
            "total_records": len(df)
        }, status_code=200)
    
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# Additional SQL-based endpoints
@faculty_router.get("/")
async def list_faculty(skip: int = 0, take: int = 10):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT 
            f.faculty_id, 
            f.designation, 
            u.email, 
            u.first_name, 
            u.last_name 
        FROM faculty f
        JOIN users u ON f.user_id = u.user_id
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (take, skip))
        faculty = cursor.fetchall()
        
        # Convert to list of dictionaries
        faculty_list = [
            {
                "faculty_id": row[0],
                "designation": row[1],
                "email": row[2],
                "first_name": row[3],
                "last_name": row[4]
            } for row in faculty
        ]
        
        return faculty_list
    finally:
        cursor.close()
        conn.close()

@faculty_router.get("/{faculty_id}")
async def get_faculty(faculty_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT 
            f.*, 
            u.email, 
            u.first_name, 
            u.last_name,
            u.phone_number,
            u.college_uid
        FROM faculty f
        JOIN users u ON f.user_id = u.user_id
        WHERE f.faculty_id = %s
        """
        cursor.execute(query, (faculty_id,))
        faculty = cursor.fetchone()
        
        if not faculty:
            raise HTTPException(status_code=404, detail="Faculty not found")
        
        # Create a dictionary with the faculty details
        faculty_dict = {
            "faculty_id": faculty[0],
            "user_id": faculty[1],
            "department_id": faculty[2],
            "designation": faculty[3],
            "expertise": faculty[4],
            "qualifications": faculty[5],
            "max_weekly_hours": faculty[6],
            "joining_date": faculty[7],
            "contract_end_date": faculty[8],
            "research_interests": faculty[9],
            "publications": faculty[10],
            "created_at": faculty[11],
            "updated_at": faculty[12],
            "email": faculty[13],
            "first_name": faculty[14],
            "last_name": faculty[15],
            "phone_number": faculty[16],
            "college_uid": faculty[17]
        }
        
        return faculty_dict
    finally:
        cursor.close()
        conn.close()

# Include the router in the app
app.include_router(faculty_router)
app.include_router(student_router)
# app.include_router(face_recognition_router)

# Optional: Add a root endpoint
@app.get("/")
async def root():
    return {"message": "Faculty Management API is running"}

# If running the script directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)