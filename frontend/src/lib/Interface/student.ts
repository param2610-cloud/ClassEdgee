export interface IStudent {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
    email: string;
    phoneNumber: string;
    studentId: string;
    enrollmentDate: string;
    grade: string;
    section: string;
    previousSchool?: string;
    guardianName: string;
    guardianRelation: string;
    guardianContact: string;
    profile_image_link?: string;
    medicalConditions: string[];
    address: IAddress;
    emergencyContact: IEmergencyContact;
    createdAt: string;
    updatedAt: string;
  }
  interface IAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
  
  interface IEmergencyContact {
    name: string;
    relation: string;
    phone: string;
  }