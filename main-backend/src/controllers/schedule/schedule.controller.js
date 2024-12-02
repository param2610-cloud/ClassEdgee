import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const fetchData = async (req, res) => {
    try {
        const Department = await prisma.departments.findMany({
            include: {
                faculty: {
                    include: {
                        users: true,
                        faculty_subject_mapping:{
                            include:{
                                subject_details:true
                            }
                        }
                    },
                },
                courses: {
                    include: {
                        subject_details: {
                            include:{
                                faculty_subject_mapping:{
                                    include:{
                                        faculty:true
                                    }
                                },
                                units:true,
                                syllabus_structure:{
                                    select:{
                                        semester:true
                                    }
                                }
                            }
                        },
                    },
                },
                sections: true,
            },
        });
        // console.log(JSON.stringify(Department[0].sections, null, 2));
        
        const Rooms = await prisma.rooms.findMany();
        const timeSlots = await prisma.timeslots.findMany();
        // console.log(JSON.stringify(Department[0], null, 2))
        // console.log(JSON.stringify(Rooms, null, 2))
        // console.log(JSON.stringify(timeSlots, null, 2))
        // create a new object
        // the object will have the following structure
        // {
        //     "type": "object",
        //     "properties": {
        //       "departments": {
        //         "type": "object",
        //         "patternProperties": {
        //           "^[A-Z]+$": {
        //             "type": "object",
        //             "properties": {
        //               "name": { "type": "string" },
        //               "faculty": {
        //                 "type": "array",
        //                 "items": {
        //                   "type": "object",
        //                   "properties": {
        //                     "id": { "type": "string" },
        //                     "name": { "type": "string" },
        //                     "department": { "type": "string" },
        //                     "specializations": {
        //                       "type": "array",
        //                       "items": { "type": "string" }
        //                     },
        //                     "preferred_times": {
        //                       "type": ["array", "null"],
        //                       "items": { "type": "string" }
        //                     },
        //                     "max_hours_per_day": { "type": "integer" },
        //                     "unavailable_days": {
        //                       "type": ["array", "null"],
        //                       "items": { "type": "string" }
        //                     }
        //                   },
        //                   "required": ["id", "name", "department", "specializations", "max_hours_per_day"]
        //                 }
        //               },
        //               "subjects": {
        //                 "type": "array",
        //                 "items": {
        //                   "type": "object",
        //                   "properties": {
        //                     "code": { "type": "string" },
        //                     "name": { "type": "string" },
        //                     "department": { "type": "string" },
        //                     "semester": { "type": "integer" },
        //                     "credits": { "type": "integer" },
        //                     "requires_lab": { "type": "boolean" },
        //                     "preferred_faculty_specializations": {
        //                       "type": "array",
        //                       "items": { "type": "string" }
        //                     },
        //                     "total_hours": { "type": "integer" }
        //                   },
        //                   "required": ["code", "name", "department", "semester", "credits", "requires_lab","total_hours"]
        //                 }
        //               },
        //               "sections": {
        //                 "type": "object",
        //                 "patternProperties": {
        //                   "^[A-Za-z0-9_]+$": {
        //                     "type": "object",
        //                     "properties": {
        //                       "batch": { "type": "integer" },
        //                       "section": { "type": "string" },
        //                       "strength": { "type": "integer" }
        //                     },
        //                     "required": ["batch", "section", "strength"]
        //                   }
        //                 }
        //               }
        //             },
        //             "required": ["name", "faculty", "subjects", "sections"]
        //           }
        //         }
        //       },
        //       "rooms": {
        //         "type": "array",
        //         "items": {
        //           "type": "object",
        //           "properties": {
        //             "id": { "type": "string" },
        //             "name": { "type": "string" },
        //             "capacity": { "type": "integer" },
        //             "room_type": { "type": "string" },
        //             "facilities": {
        //               "type": "array",
        //               "items": { "type": "string" }
        //             },
        //             "building": { "type": "string" }
        //           },
        //           "required": ["id", "name", "capacity", "room_type", "facilities", "building"]
        //         }
        //       },
        //       "time_slots": {
        //         "type": "object",
        //         "properties": {
        //           "days": {
        //             "type": "array",
        //             "items": { "type": "string" }
        //           },
        //           "times": {
        //             "type": "array",
        //             "items": { "type": "string" }
        //           }
        //         },
        //         "required": ["days", "times"]
        //       }
        //     },
        //     "required": ["departments", "rooms", "time_slots"]
        //   }
        const result = {
            departments: {},
            rooms: [],
            time_slots: {
                days: [],
                times: [],
            },
        };
        // classLength = 60 // in minutes
        // required time to teach a subject
        // required class to teach this subject  classno = maxInt(reqTimeForSubject(min) / classses length(min)) 
        // classno/ semesterDuration(weeks) = classes per week
        // calculate total classes per week subject1TotalClassesPerWeek + subject2TotalClassesPerWeek + ... = totalClassesPerWeek
        // totalClassesPerWeek / 5 = classes per day
        // while we proceed to make schedule we  will create counter of every subject , this subject's counter will contained the number of classes needed in a week , as one class will be assigned the counter will decreased by one
        // at first step of scheduling of a week we will not proceed after the daily class per day reached , we will shift to next day
        // by this way when we will come to end and the counter value of  every subject is zero then we will have a schedule
        // otherwise we will go for again from monday and schedule the class in empty slots of that day as we already iterating over the days at first step of scheduling, it is possible that we will not have empty space then we will return the schdule with the message that the this subject is not suitable to complete in this semester
        // 
        
        
        Department.forEach((department) => {
            const deptCode = department.department_code;
            result.departments[deptCode] = {
                name: department.department_name,
                faculty: department.faculty.map( (fac) =>({
                    id: fac.faculty_id.toString(),
                    name: `${fac.users.first_name} ${fac.users.last_name}`,
                    department: deptCode,
                    specializations: fac.faculty_subject_mapping.map(
                        (mapping) => mapping.subject_details.subject_code
                    ),

                    preferred_times: null,
                    max_hours_per_day: fac.max_weekly_hours / 5,
                    unavailable_days: null,
                })),
                subjects: department.courses.flatMap((course) =>
                    course.subject_details.map((subject) => ({
                        code: subject.subject_code,
                        name: subject.subject_name,
                        department: deptCode,
                        semester: subject.syllabus_structure.semester, // semester
                        credits: course.credits,
                        requires_lab: subject.subject_type === "lab",
                        preferred_faculty_specializations: subject.faculty_subject_mapping.map(
                                (mapping) => mapping.faculty.faculty_id.toString()
                            ),
                        total_hours: subject.units.reduce((acc, unit) => acc + unit.required_hours, 0),
                    }))
                ),
                sections: department.sections.reduce((acc, section) => {
                    const section_code = `${section.semester}_${section.section_name}`;
                    acc[section] = {
                        batch: section.batch_year,
                        section: section.section_name,
                        strength: section.student_count,
                        semester: section.semester,
                    };
                    return acc;
                }, {}),
            };
        });

        Rooms.forEach((room) => {
            result.rooms.push({
                id: room.room_id.toString(),
                name: room.room_number,
                capacity: room.capacity,
                room_type: room.room_type,
                facilities: room.features,
                building: "Main Building",
            });
        });

        timeSlots.forEach((slot) => {
            result.time_slots.days.push(slot.day_of_week.toString());
            const time = new Date(slot.start_time).toISOString().split("T")[1];
            result.time_slots.times.push(time);
        });
        return result
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


