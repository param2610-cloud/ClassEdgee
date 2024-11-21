import os
import uuid
import pandas as pd
import numpy as np
import bcrypt
from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, date
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


class StudentDataValidator:
    @staticmethod
    def validate_and_convert_users_table(row):
        """
        Validate and convert data for users table columns for students
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
        if not isinstance(row['collegeUid'], str):
            row['collegeUid'] = str(row['collegeUid'])
        validated_data['college_uid'] = row['collegeUid'][:255]
        
        # Default user role
        validated_data['role'] = 'student'
        
        return validated_data
    
    @staticmethod
    def validate_and_convert_students_table(row, user_id):
        """
        Validate and convert data for students table columns
        """
        validated_data = {
            'user_id': user_id
        }
        
        # Enrollment Number validation (string, unique)
        if not isinstance(row['enrollmentNumber'], str):
            row['enrollmentNumber'] = str(row['enrollmentNumber'])
        validated_data['enrollment_number'] = row['enrollmentNumber']
        
        # Department ID validation (integer)
        validated_data['department_id'] = int(row['departmentId']) if pd.notna(row['departmentId']) else None
        
        # Batch Year validation (integer)
        validated_data['batch_year'] = int(row['batchYear'])
        
        # Current Semester validation (integer)
        validated_data['current_semester'] = int(row['currentSemester'])
        
        # Guardian Name validation (string, max 100 chars)
        if pd.notna(row['guardianName']):
            validated_data['guardian_name'] = str(row['guardianName'])[:100]
        else:
            validated_data['guardian_name'] = None
        
        # Guardian Contact validation (string, max 20 chars)
        if pd.notna(row['guardianContact']):
            validated_data['guardian_contact'] = str(row['guardianContact'])[:20]
        else:
            validated_data['guardian_contact'] = None
        
        return validated_data

# Router for student bulk upload
student_router = APIRouter(prefix="/student", tags=["Students"])

@student_router.post("/process-student-excel")
async def process_student_excel(file: UploadFile = File(...)):
    try:
        # Read Excel file
        df = pd.read_excel(file.file)
        
        # Validate required columns
        required_columns = [
            'firstName', 'lastName', 'email', 'phoneNumber', 
            'departmentId', 'enrollmentNumber', 'batchYear', 
            'currentSemester', 'guardianName', 'guardianContact', 
            'collegeUid', 'password'
        ]
        
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")
        
        # Establish database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Prepare lists for bulk insert
        successful_uploads = 0
        errors = []
        
        # Process each row
        for index, row in df.iterrows():
            try:
                # Validate and convert user data
                user_entry = StudentDataValidator.validate_and_convert_users_table(row)

                # Generate hashed password
                password = row.get('password', 'classedgee')  # Use default password if not provided
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                user_entry['password_hash'] = hashed_password.decode('utf-8')
                
                # Additional user entry details
                user_entry['status'] = 'active'
                user_entry['profile_picture'] = row.get('profilePictureUrl', None)

                # Insert user into the database
                user_insert_query = """
                INSERT INTO users (uuid, email, first_name, last_name, phone_number, 
                                   college_uid, password_hash, role, status, profile_picture)
                VALUES (%(uuid)s, %(email)s, %(first_name)s, %(last_name)s, %(phone_number)s, 
                        %(college_uid)s, %(password_hash)s, %(role)s, %(status)s, %(profile_picture)s)
                RETURNING user_id
                """
                cursor.execute(user_insert_query, user_entry)
                user_id = cursor.fetchone()[0]

                # Validate and convert student data
                student_entry = StudentDataValidator.validate_and_convert_students_table(row, user_id)
                
                # Perform student insert
                student_insert_query = """
                INSERT INTO students (
                    user_id, enrollment_number, department_id, 
                    batch_year, current_semester, 
                    guardian_name, guardian_contact
                ) VALUES (
                    %(user_id)s, %(enrollment_number)s, %(department_id)s, 
                    %(batch_year)s, %(current_semester)s, 
                    %(guardian_name)s, %(guardian_contact)s
                )
                """
                
                cursor.execute(student_insert_query, student_entry)
                
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
            "message": f"Successfully uploaded {successful_uploads} student records",
            "total_records": len(df)
        }, status_code=200)
    
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# Additional student-related endpoints can be added here

# In the main application, include the router
# app.include_router(student_router)