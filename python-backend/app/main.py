from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import pandas as pd
from pymongo import MongoClient
from datetime import datetime
import bcrypt
from pydantic import BaseModel, EmailStr
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
database_uri = os.getenv('DATABASE_URI')
client = MongoClient(database_uri)
db = client['classedgee']
students_collection = db['students']
faculty_collection = db['faculty']

class Student(BaseModel):
    firstName: str
    middleName: str | None = None
    lastName: str
    dateOfBirth: str
    gender: str
    bloodGroup: str | None = None
    email: EmailStr
    phoneNumber: str
    address: dict
    studentId: str
    enrollmentDate: str
    grade: str
    section: str | None = None
    previousSchool: str | None = None
    guardianName: str
    guardianRelation: str
    guardianContact: str
    emergencyContact: dict

# Column mapping dictionary
COLUMN_MAPPINGS = {
    'name': ['name', 'full name', 'student name'],
    'dateOfBirth': ['dob', 'date of birth', 'birth date', 'birthdate','DOB'],
    'gender': ['gender', 'sex', 'Gender'],
    'bloodGroup': ['blood group', 'bloodgroup', 'blood type'],
    'email': ['email', 'email address', 'mail'],
    'phoneNumber': ['phone number', 'phone', 'contact number', 'mobile'],
    'studentId': ['student id', 'studentid', 'id', 'student number'],
    'enrollmentDate': ['enrollment date', 'admission date', 'joining date'],
    'grade': ['grade', 'class', 'standard'],
    'section': ['section', 'division'],
    'previousSchool': ['previous school', 'privious school', 'last school'],
    'guardianName': ['guardian name', 'gurdian name', 'parent name'],
    'guardianRelation': ['guardian relation', 'gurdian relation', 'relation'],
    'guardianContact': ['guardian contact', 'gurdian contact', 'parent contact'],
    'emergencyContactPhone': ['emergency contact phone', 'emergency contact phone number', 'emergency phone'],
    'emergencyContactName': ['emergency contact name', 'emergency name'],
    'emergencyContactRelation': ['emergency contact relation', 'emergency relation']
}

def parse_name(full_name: str) -> Dict[str, str]:
    """Parse full name into first, middle, and last name components."""
    name_parts = full_name.strip().split()
    
    if len(name_parts) == 1:
        return {
            'firstName': name_parts[0],
            'middleName': None,
            'lastName': None
        }
    elif len(name_parts) == 2:
        return {
            'firstName': name_parts[0],
            'middleName': None,
            'lastName': name_parts[1]
        }
    else:
        return {
            'firstName': name_parts[0],
            'middleName': ' '.join(name_parts[1:-1]),
            'lastName': name_parts[-1]
        }

def find_matching_column(df: pd.DataFrame, possible_names: List[str]) -> str:
    """Find the first matching column name from the possible names list."""
    df_columns = [col.lower().strip() for col in df.columns]
    for name in possible_names:
        if name.lower() in df_columns:
            return df.columns[df_columns.index(name.lower())]
    return None

def map_columns(df: pd.DataFrame) -> Dict[str, str]:
    """Create mapping between standardized field names and actual Excel column names."""
    column_mapping = {}
    
    for field, possible_names in COLUMN_MAPPINGS.items():
        matched_column = find_matching_column(df, possible_names)
        if matched_column:
            column_mapping[field] = matched_column
            
    return column_mapping

def validate_student_data(data: dict) -> bool:
    required_fields = [
        "firstName", "lastName", "dateOfBirth", "gender", "email",
        "phoneNumber", "studentId", "enrollmentDate", "grade",
        "guardianName", "guardianRelation", "guardianContact"
    ]
    
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Missing required field: {field}")
    
    if not "@" in data["email"]:
        raise ValueError("Invalid email format")
    
    return True

@app.post("/process-excel")
async def process_excel(file: UploadFile):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    try:
        # Read the Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Map columns to standardized fields
        column_mapping = map_columns(df)
        
        successful_entries = []
        failed_entries = []
        
        for index, row in df.iterrows():
            try:
                # Initialize student data dictionary
                student_data = {}
                
                # Handle name field
                if 'name' in column_mapping:
                    name_parts = parse_name(str(row[column_mapping['name']]))
                    student_data.update(name_parts)
                
                # Map other fields
                field_mappings = {
                    'dateOfBirth': 'dateOfBirth',
                    'gender': 'gender',
                    'bloodGroup': 'bloodGroup',
                    'email': 'email',
                    'phoneNumber': 'phoneNumber',
                    'studentId': 'studentId',
                    'enrollmentDate': 'enrollmentDate',
                    'grade': 'grade',
                    'section': 'section',
                    'previousSchool': 'previousSchool',
                    'guardianName': 'guardianName',
                    'guardianRelation': 'guardianRelation',
                    'guardianContact': 'guardianContact'
                }
                
                for field, target in field_mappings.items():
                    if field in column_mapping:
                        student_data[target] = row[column_mapping[field]]
                
                # Handle address fields (if present)
                address_fields = {
                    'street': ['street', 'address'],
                    'city': ['city'],
                    'state': ['state'],
                    'postalCode': ['postal code', 'zip code', 'pincode'],
                    'country': ['country']
                }
                
                address_data = {}
                for field, possible_names in address_fields.items():
                    for name in possible_names:
                        matched_col = find_matching_column(df, [name])
                        if matched_col and pd.notna(row[matched_col]):
                            address_data[field] = row[matched_col]
                            break
                
                student_data['address'] = address_data
                
                # Handle emergency contact
                emergency_contact = {
                    'name': row[column_mapping['emergencyContactName']] if 'emergencyContactName' in column_mapping else None,
                    'relation': row[column_mapping['emergencyContactRelation']] if 'emergencyContactRelation' in column_mapping else None,
                    'phone': row[column_mapping['emergencyContactPhone']] if 'emergencyContactPhone' in column_mapping else None
                }
                
                student_data['emergencyContact'] = emergency_contact
                
                # Clean NaN values
                student_data = {k: (v if pd.notna(v) else None) for k, v in student_data.items()}
                
                # Validate data
                validate_student_data(student_data)
                
                # Convert dates to proper format
                if 'dateOfBirth' in student_data and student_data['dateOfBirth']:
                    student_data['dateOfBirth'] = pd.to_datetime(
                        student_data['dateOfBirth']
                    ).strftime('%Y-%m-%d')
                
                if 'enrollmentDate' in student_data and student_data['enrollmentDate']:
                    student_data['enrollmentDate'] = pd.to_datetime(
                        student_data['enrollmentDate']
                    ).strftime('%Y-%m-%d')
                
                # Check for existing student
                existing_student = students_collection.find_one({
                    '$or': [
                        {'studentId': student_data['studentId']},
                        {'email': student_data['email']}
                    ]
                })
                
                if existing_student:
                    raise ValueError(
                        f"Student with ID {student_data['studentId']} or email {student_data['email']} already exists"
                    )
                
                # Add metadata
                student_data['createdAt'] = datetime.utcnow()
                student_data['updatedAt'] = datetime.utcnow()
                
                # Insert into database
                result = students_collection.insert_one(student_data)
                
                successful_entries.append({
                    'studentId': student_data['studentId'],
                    'name': f"{student_data['firstName']} {student_data.get('lastName', '')}"
                })
                
            except Exception as e:
                failed_entries.append({
                    'row': index + 2,  # Excel rows start at 1, and header is row 1
                    'error': str(e)
                })
        
        return {
            'status': 'completed',
            'successful_entries': successful_entries,
            'failed_entries': failed_entries,
            'total_processed': len(successful_entries) + len(failed_entries),
            'total_successful': len(successful_entries),
            'total_failed': len(failed_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Column mapping dictionary for faculty with nested structure
FACULTY_COLUMN_MAPPINGS = {
    'personalInformation.fullName': ['full name', 'faculty name', 'name'],
    'personalInformation.dateOfBirth': ['dob', 'date of birth', 'birth date', 'birthdate'],
    'personalInformation.gender': ['gender', 'sex'],
    'personalInformation.contactNumber': ['contact number', 'phone number', 'mobile'],
    'personalInformation.email': ['email', 'email address'],
    'qualification.highestDegree': ['highest degree', 'degree'],
    'qualification.specialization': ['specialization', 'major'],
    'qualification.universityInstitute': ['university', 'institute', 'college','University/Institute'],
    'qualification.yearOfPassing': ['year of passing', 'graduation year'],
    'professionalExperience.totalYearsOfExperience': ['years of experience', 'total experience',"Total Years of Experience"],
    'professionalExperience.previousJobTitle': ['previous job title', 'job title'],
    'professionalExperience.previousOrganization': ['previous organization', 'last company'],
    'professionalExperience.duration.startDate': ['job start date', 'duration start', 'start date'],
    'professionalExperience.duration.endDate': ['job end date', 'duration end', 'end date'],
    'subjectExpertise.primarySubject': ['primary subject', 'main subject'],
    'subjectExpertise.secondarySubjects': ['secondary subjects', 'other subjects'],
    'additionalInformation.address': ['address', 'location'],
}

def set_nested_value(dictionary: dict, path: str, value) -> None:
    """Set a value in a nested dictionary using a dot-notated path."""
    keys = path.split('.')
    for key in keys[:-1]:
        dictionary = dictionary.setdefault(key, {})
    dictionary[keys[-1]] = value

def validate_faculty_data(data: dict) -> bool:
    """Validate faculty data against required fields and data types."""
    required_fields = [
        'personalInformation.fullName',
        'personalInformation.dateOfBirth',
        'personalInformation.gender',
        'personalInformation.contactNumber',
        'personalInformation.email',
        'qualification.highestDegree',
        'qualification.specialization',
        'qualification.universityInstitute',
        'qualification.yearOfPassing',
        'professionalExperience.totalYearsOfExperience',
        'professionalExperience.previousJobTitle',
        'professionalExperience.previousOrganization',
        'professionalExperience.duration.startDate',
        'professionalExperience.duration.endDate',
        'subjectExpertise.primarySubject',
        'additionalInformation.address'
    ]

    def get_nested_value(d, path):
        """Get a value from a nested dictionary using a dot-notated path."""
        keys = path.split('.')
        current = d
        for key in keys:
            if not isinstance(current, dict) or key not in current:
                return None
            current = current[key]
        return current

    for field in required_fields:
        value = get_nested_value(data, field)
        if value is None or pd.isna(value) or value == '':
            raise ValueError(f"Missing required field: {field}")

    # Validate email format
    email = get_nested_value(data, 'personalInformation.email')
    if not '@' in str(email):
        raise ValueError("Invalid email format")

    # Validate gender
    gender = get_nested_value(data, 'personalInformation.gender')
    valid_genders = ['Male', 'Female', 'Other', 'M', 'F']
    if str(gender).strip() not in valid_genders:
        raise ValueError("Invalid gender value")

    return True

@app.post("/process-faculty-excel")
async def process_faculty_excel(file: UploadFile):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    try:
        # Read the Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Map columns to standardized fields
        column_mapping = {}
        for field, possible_names in FACULTY_COLUMN_MAPPINGS.items():
            matched_col = None
            for name in possible_names:
                if name.lower() in [col.lower() for col in df.columns]:
                    matched_col = next(col for col in df.columns if col.lower() == name.lower())
                    break
            if matched_col:
                column_mapping[field] = matched_col
        
        successful_entries = []
        failed_entries = []
        
        for index, row in df.iterrows():
            try:
                # Initialize nested faculty data structure
                faculty_data = {
                    'personalInformation': {},
                    'qualification': {},
                    'professionalExperience': {
                        'duration': {}
                    },
                    'subjectExpertise': {},
                    'additionalInformation': {}
                }

                # Map values to nested structure
                for field, excel_col in column_mapping.items():
                    value = row[excel_col]
                    # Handle date fields
                    if 'date' in field.lower() or 'dob' in field.lower():
                        if pd.notna(value):
                            value = pd.to_datetime(value).strftime('%Y-%m-%d')
                    # Handle numerical fields
                    elif 'yearOfPassing' in field or 'totalYearsOfExperience' in field:
                        if pd.notna(value):
                            value = int(float(value))
                    # Handle gender standardization
                    elif 'gender' in field.lower():
                        if pd.notna(value):
                            value = 'Female' if str(value).strip().upper() in ['F', 'FEMALE'] else 'Male' if str(value).strip().upper() in ['M', 'MALE'] else str(value)
                    
                    if pd.notna(value):
                        set_nested_value(faculty_data, field, value)

                # Validate data
                validate_faculty_data(faculty_data)
                
                # Check for existing faculty member
                existing_faculty = faculty_collection.find_one({
                    'personalInformation.email': faculty_data['personalInformation']['email']
                })
                
                if existing_faculty:
                    raise ValueError(f"Faculty with email {faculty_data['personalInformation']['email']} already exists")
                
                # Add metadata
                faculty_data['createdAt'] = datetime.utcnow()
                faculty_data['updatedAt'] = datetime.utcnow()
                
                # Insert into database
                result = faculty_collection.insert_one(faculty_data)
                
                successful_entries.append({
                    'email': faculty_data['personalInformation']['email'],
                    'name': faculty_data['personalInformation']['fullName']
                })
                
            except Exception as e:
                failed_entries.append({
                    'row': index + 2,  # Excel rows start at 1, header is row 1
                    'error': str(e)
                })
        
        return {
            'status': 'completed',
            'successful_entries': successful_entries,
            'failed_entries': failed_entries,
            'total_processed': len(successful_entries) + len(failed_entries),
            'total_successful': len(successful_entries),
            'total_failed': len(failed_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=os.getenv('PORT'), port=8000)