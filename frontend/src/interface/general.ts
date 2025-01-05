// Enums
export enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
}

export enum AlertType {
    FIRE = "fire",
    SECURITY = "security",
    MEDICAL = "medical",
    OTHER = "other",
}

export enum EventType {
    ACADEMIC = "academic",
    CULTURAL = "cultural",
    EMERGENCY_DRILL = "emergency_drill",
    WORKSHOP = "workshop",
    EXAM = "exam",
}

export enum ResourceStatus {
    AVAILABLE = "available",
    IN_USE = "in_use",
    MAINTENANCE = "maintenance",
    FUNCTIONAL = "functional",
}

export enum RoomType {
    CLASSROOM = "classroom",
    LAB = "lab",
    SEMINAR_HALL = "seminar_hall",
    AUDITORIUM = "auditorium",
}

export enum UserRole {
    STUDENT = "student",
    FACULTY = "faculty",
    COORDINATOR = "coordinator",
    ADMIN = "admin",
}


export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
}

export enum VerificationMethod {
    FACIAL = "facial",
    MANUAL = "manual",
    MOBILE = "mobile",
    BIOMETRIC = "biometric",
}

export enum SubjectType {
    THEORY = "theory",
    LAB = "lab",
    PROJECT = "project",
}

// Interfaces
export interface ActivityLog {
    log_id: number;
    user_id?: number;
    activity_type: string;
    description?: string;
    ip_address?: string;
    user_agent?: string;
    created_at?: Date;
    users?: User;
}

export interface AdministrativeDuty {
    duty_id: number;
    faculty_id?: number;
    duty_title: string;
    description?: string;
    start_date: Date;
    end_date?: Date;
    hours_per_week?: number;
    priority?: number;
    created_at?: Date;
    faculty?: Faculty;
}

export interface AlertNotification {
    notification_id: number;
    alert_id?: number;
    recipient_id?: number;
    message: string;
    sent_at?: Date;
    delivery_status?: string;
    read_at?: Date;
    response_action?: string;
    emergencyalerts?: EmergencyAlert;
    users?: User;
}

export interface AnalyticsData {
    data_id: number;
    data_type: string;
    entity_type: string;
    entity_id: number;
    metrics: any;
    analysis_period?: any; // daterange type
    created_at?: Date;
}

export interface Announcement {
    announcement_id: number;
    title: string;
    content: string;
    sender_id?: number;
    department_id?: number;
    target_type: string;
    target_id?: number;
    priority?: string;
    posted_at?: Date;
    expires_at?: Date;
    acknowledgment_required?: boolean;
    departments?: Department;
    users?: User;
}

export interface Attendance {
    attendance_id: number;
    class_id?: number;
    student_id?: number;
    date: Date;
    status: string;
    verification_method: VerificationMethod;
    location_coordinates?: any; // point type
    device_info?: any;
    verification_data?: Buffer;
    created_at?: Date;
    classes?: Class;
    students?: Student;
}

export interface BacklogSession {
    backlog_id: number;
    original_class_id?: number;
    rescheduled_class_id?: number;
    reason: string;
    requested_by?: number;
    priority?: number;
    status?: string;
    created_at?: Date;
    classes_original?: Class;
    users?: User;
    classes_rescheduled?: Class;
}

export interface Building {
    building_id: number;
    building_name: string;
    floors: number;
    location_coordinates?: any; // point type
    created_at?: Date;
    rooms: Room[];
}

export interface ChatInteraction {
    interaction_id: number;
    student_id?: number;
    session_id: string;
    query_text: string;
    response_text: string;
    learning_gaps: string[];
    confidence_score?: number;
    feedback_rating?: number;
    created_at?: Date;
    students?: Student;
}

export interface Class {
    class_id: number;
    course_id?: number;
    faculty_id?: number;
    room_id?: number;
    section_id?: number;
    slot_id?: number;
    semester: number;
    academic_year: number;
    date_of_class:Date
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
    attendance: Attendance[];
    backlogsessions_original: BacklogSession[];
    backlogsessions_rescheduled: BacklogSession[];
    courses?: Course;
    faculty?: Faculty;
    rooms?: Room;
    sections?: Section;
    timeslots?: TimeSlot;
    studentengagement: StudentEngagement[];
    detail_id?: number;
    schedule_details: ScheduleDetails;
}
export interface ScheduleDetails {
    detail_id: number;
    schedule_id: number;
    faculty_id: number;
    backup_faculty_id?: number;
    room_id: number;
    backup_room_id?: number;
    timeslot_id: number;
    day_of_week?: string;
    subject_id?: number;
    classes: Class[];
    subject_details?: SubjectDetail;
    faculty_schedule_details_backup_faculty_idTofaculty?: Faculty;
    rooms_schedule_details_backup_room_idTorooms?: Room;
    faculty_schedule_details_faculty_idTofaculty: Faculty;
    rooms_schedule_details_room_idTorooms: Room;
    schedule_meta: ScheduleMeta;
    timeslots: TimeSlot;
    schedule_topics: ScheduleTopic[];
}

export interface ScheduleMeta {
    schedule_id: number;
    department_id: number;
    academic_year: number;
    semester: number;
    batch_year: number;
    created_by: number;
    status: string;
    created_at?: Date;
    updated_at?: Date;
    section_id?: number;
    schedule_details: ScheduleDetails[];
    sections?: Section;
    users: User;
    departments: Department;
}

export interface ScheduleTopic {
    topic_id: number;
    schedule_detail_id: number;
    unit_id: number;
    topic_name: string;
    status: string;
    original_date?: Date;
    rescheduled_date?: Date;
    schedule_details: ScheduleDetails;
    units: Unit;
}

export interface Course {
    course_id: number;
    course_code: string;
    course_name: string;
    department_id?: number;
    credits: number;
    description?: string;
    prerequisites?: string;
    syllabus_url?: string;
    learning_outcomes: string[];
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
    classes: Class[];
    departments?: Department;
    learninganalytics: LearningAnalytics[];
    notes: Note[];
    resources: Resource[];
    subject_details: SubjectDetail[];
    syllabus_structure: SyllabusStructure[];
}

export interface Department {
    department_id: number;
    department_name: string;
    department_code: string;
    hod_user_id?: number;
    contact_email?: string;
    contact_phone?: string;
    created_at?: Date;
    updated_at?: Date;
    announcements: Announcement[];
    courses: Course[];
    users?: User;
    faculty: Faculty[];
    sections: Section[];
    students: Student[];
}

export interface EmergencyAlert {
    alert_id: number;
    type: AlertType;
    severity: AlertSeverity;
    location_id?: number;
    description: string;
    reported_by?: number;
    reported_at?: Date;
    resolved_at?: Date;
    resolution_notes?: string;
    status?: string;
    alertnotifications: AlertNotification[];
    rooms?: Room;
    users?: User;
}

export interface Equipment {
    equipment_id: number;
    name: string;
    type: string;
    room_id?: number;
    serial_number?: string;
    purchase_date?: Date;
    warranty_end_date?: Date;
    status?: ResourceStatus;
    last_maintenance_date?: Date;
    next_maintenance_date?: Date;
    maintenance_schedule?: any;
    specifications?: any;
    created_at?: Date;
    updated_at?: Date;
    rooms?: Room;
}

export interface EventParticipant {
    event_id: number;
    user_id: number;
    role: string;
    registration_date?: Date;
    attendance_status?: string;
    feedback?: string;
    events: Event;
    users: User;
}

export interface Event {
    event_id: number;
    title: string;
    description?: string;
    event_type: EventType;
    start_datetime: Date;
    end_datetime: Date;
    location_id?: number;
    organizer_id?: number;
    max_participants?: number;
    registration_deadline?: Date;
    priority?: string;
    status?: string;
    created_at?: Date;
    updated_at?: Date;
    eventparticipants: EventParticipant[];
    rooms?: Room;
    users?: User;
}

export interface Faculty {
    faculty_id: number;
    user_id?: number;
    department_id?: number;
    designation: string;
    expertise: string[];
    qualifications: string[];
    max_weekly_hours?: number;
    joining_date: Date;
    contract_end_date?: Date;
    research_interests: string[];
    publications: string[];
    created_at?: Date;
    updated_at?: Date;
    administrativeduties: AdministrativeDuty[];
    classes: Class[];
    departments?: Department;
    users?: User;
    facultyavailability: FacultyAvailability[];
    faculty_subject_mapping: faculty_subject_mapping[];

}

export interface FacultyAvailability {
    availability_id: number;
    faculty_id?: number;
    day_of_week?: number;
    start_time: Date;
    end_time: Date;
    is_preferred?: boolean;
    repeat_until?: Date;
    created_at?: Date;
    faculty?: Faculty;
}

export interface Feedback {
    feedback_id: number;
    sender_id?: number;
    receiver_id?: number;
    feedback_type: string;
    entity_id: number;
    rating?: number;
    comments?: string;
    anonymous?: boolean;
    created_at?: Date;
    users_receiver?: User;
    users_sender?: User;
}

export interface LearningAnalytics {
    analytics_id: number;
    student_id?: number;
    course_id?: number;
    metric_type: string;
    metric_value: any;
    analysis_date: Date;
    recommendations: string[];
    created_at?: Date;
    courses?: Course;
    students?: Student;
}

export interface Note {
    note_id: number;
    title: string;
    content: string;
    created_by?: number;
    section_id?: number;
    course_id?: number;
    tags: string[];
    is_private?: boolean;
    created_at?: Date;
    updated_at?: Date;
    courses?: Course;
    users?: User;
    sections?: Section;
}

export interface Resource {
    resource_id: number;
    title: string;
    description?: string;
    file_url?: string;
    resource_type: string;
    course_id?: number;
    uploaded_by?: number;
    tags: string[];
    visibility?: string;
    version?: number;
    created_at?: Date;
    updated_at?: Date;
    courses?: Course;
    users?: User;
}

export interface RoomFeature {
    feature_id: number;
    room_id?: number;
    feature_name: string;
    quantity?: number;
    status?: ResourceStatus;
    last_checked?: Date;
    created_at?: Date;
    rooms?: Room;
}

export interface Room {
    room_id: number;
    building_id?: number;
    room_number: string;
    room_type: RoomType;
    capacity: number;
    floor_number: number;
    wing?: string;
    area_sqft?: number;
    features?: any;
    status?: ResourceStatus;
    last_maintenance_date?: Date;
    next_maintenance_date?: Date;
    created_at?: Date;
    updated_at?: Date;
    classes: Class[];
    emergencyalerts: EmergencyAlert[];
    equipment: Equipment[];
    events: Event[];
    roomfeatures: RoomFeature[];
    buildings?: Building;
}

export interface Section {
    section_id: number;
    section_name: string;
    batch_year: number;
    department_id?: number;
    student_count: number;
    max_capacity: number;
    is_combined?: boolean;
    parent_section_id?: number;
    academic_year: number;
    semester: number;
    created_at?: Date;
    classes: Class[];
    notes: Note[];
    departments?: Department;
    parent_section?: Section;
    child_sections: Section[];
    students: Student[];
}

export interface StudentEngagement {
    engagement_id: number;
    class_id?: number;
    student_id?: number;
    engagement_type: string;
    engagement_metrics: any;
    duration?: number;
    notes?: string;
    created_at?: Date;
    classes?: Class;
    students?: Student;
}

export interface Student {
    student_id: number;
    user_id?: number;
    enrollment_number: string;
    department_id?: number;
    batch_year: number;
    current_semester?: number;
    cgpa?: number;
    guardian_name?: string;
    guardian_contact?: string;
    face_encoding?: Buffer;
    biometric_data?: Buffer;
    created_at?: Date;
    updated_at?: Date;
    section_id?: number;
    attendance: Attendance[];
    chatinteractions: ChatInteraction[];
    learninganalytics: LearningAnalytics[];
    studentengagement: StudentEngagement[];
    sections?: Section;
    departments?: Department;
    users?: User;
}

export interface TimeSlot {
    slot_id: number;
    start_time: Date;
    end_time: Date;
    day_of_week?: number;
    slot_type?: string;
    created_at?: Date;
    classes: Class[];
}

export interface User {
    user_id: number;
    uuid?: string;
    email: string;
    password_hash: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    phone_number?: string;
    created_at?: Date;
    last_login?: Date;
    status?: UserStatus;
    mfa_enabled?: boolean;
    mfa_secret?: string;
    refreshtoken?: string;
    college_uid: string;
    activitylogs: ActivityLog[];
    alertnotifications: AlertNotification[];
    announcements: Announcement[];
    backlogsessions: BacklogSession[];
    departments: Department[];
    emergencyalerts: EmergencyAlert[];
    eventparticipants: EventParticipant[];
    events: Event[];
    faculty?: Faculty;
    feedback_received: Feedback[];
    feedback_sent: Feedback[];
    notes: Note[];
    resources: Resource[];
    students?: Student;
    institutions?: Institution; 
}

export interface SubjectDetail {
    subject_id: number;
    syllabus_id?: number;
    course_id?: number;
    subject_type: SubjectType;
    preferred_faculty_specializations: string[];
    resources_required: string[];
    created_at?: Date;
    updated_at?: Date;
    courses?: Course;
    syllabus_structure?: SyllabusStructure;
    units: Unit[];
    faculty_subject_mapping: faculty_subject_mapping[];
}

export interface SyllabusStructure {
    syllabus_id: number;
    course_id?: number;
    semester: number;
    created_at?: Date;
    updated_at?: Date;
    subject_details: SubjectDetail[];
    courses?: Course;
}

export interface Topic {
    topic_id: number;
    unit_id?: number;
    topic_name: string;
    topic_description?: string;
    created_at?: Date;
    updated_at?: Date;
    units?: Unit;
}

export interface UnitPrerequisite {
    unit_id: number;
    prerequisite_unit_id: number;
    prerequisite_type?: string;
    created_at?: Date;
    prerequisite_unit: Unit;
    dependent_unit: Unit;
}

export interface Unit {
    unit_id: number;
    subject_id?: number;
    unit_number: number;
    unit_name: string;
    required_hours: number;
    learning_objectives: string[];
    created_at?: Date;
    updated_at?: Date;
    subject_details?: SubjectDetail;
    topics: Topic[];
    unitprerequisites: UnitPrerequisite[];
}
export interface AcademicYear {
    year_id: number;
    institution_id: number;
    start_date: Date;
    end_date: Date;
    is_current?: boolean;
    created_at?: Date;
    institution?: Institution; // Assuming Institution is defined elsewhere
}

export interface Institution {
    institution_id: number;
    name: string;
    code: string;
    address?: string;
    contact_email: string;
    contact_phone?: string;
    license_type: string;
    settings?: Record<string, unknown>;
    theme?: Record<string, unknown>;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
    academic_years?: AcademicYear[]; 
    buildings?: Building[]; 
    courses?: Course[]; 
    departments?: Department[]; 
    sections?: Section[]; 
    users?: User[]; 
}
export interface faculty_subject_mapping {
    faculty_id: number;
    subject_id: number;
    assigned_date?: Date; 
    status?: string;      
    created_at?: Date;    
    updated_at?: Date;    
    faculty?: Faculty;    
    subject_details?: SubjectDetail; 
  }
  
