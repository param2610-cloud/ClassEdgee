import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORD = "Test@1234";
const ACADEMIC_YEAR = 2026;
const SEMESTER = 3;

const toUtcDate = (year, monthIndex, day, hour, minute = 0) =>
  new Date(Date.UTC(year, monthIndex, day, hour, minute, 0));

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getPastWeekdays = (count) => {
  const dates = [];
  const cursor = normalizeDate(new Date());

  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates.reverse();
};

const upsertUser = async ({
  email,
  role,
  firstName,
  lastName,
  collegeUid,
  institutionId,
  phoneNumber,
  passwordHash,
}) => {
  return prisma.users.upsert({
    where: { email },
    update: {
      role,
      first_name: firstName,
      last_name: lastName,
      college_uid: collegeUid,
      institution_id: institutionId,
      phone_number: phoneNumber,
      password_hash: passwordHash,
      status: "active",
    },
    create: {
      email,
      role,
      first_name: firstName,
      last_name: lastName,
      college_uid: collegeUid,
      institution_id: institutionId,
      phone_number: phoneNumber,
      password_hash: passwordHash,
      status: "active",
    },
  });
};

const upsertSection = async ({
  sectionName,
  batchYear,
  departmentId,
  institutionId,
  semester,
  academicYear,
  maxCapacity,
  studentCount,
}) => {
  const existing = await prisma.sections.findFirst({
    where: {
      institution_id: institutionId,
      section_name: sectionName,
      batch_year: batchYear,
    },
    select: { section_id: true },
  });

  if (existing) {
    return prisma.sections.update({
      where: { section_id: existing.section_id },
      data: {
        department_id: departmentId,
        institution_id: institutionId,
        semester,
        academic_year: academicYear,
        max_capacity: maxCapacity,
        student_count: studentCount,
      },
    });
  }

  return prisma.sections.create({
    data: {
      section_name: sectionName,
      batch_year: batchYear,
      department_id: departmentId,
      institution_id: institutionId,
      semester,
      academic_year: academicYear,
      max_capacity: maxCapacity,
      student_count: studentCount,
    },
  });
};

const upsertBuilding = async ({ institutionId, buildingName, floors }) => {
  const existing = await prisma.buildings.findFirst({
    where: {
      institution_id: institutionId,
      building_name: buildingName,
    },
    select: { building_id: true },
  });

  if (existing) {
    return prisma.buildings.update({
      where: { building_id: existing.building_id },
      data: { floors },
    });
  }

  return prisma.buildings.create({
    data: {
      institution_id: institutionId,
      building_name: buildingName,
      floors,
    },
  });
};

const upsertTimeslot = async ({ dayOfWeek, period }) => {
  const startHour = 9 + period;
  const startTime = toUtcDate(1970, 0, 1, startHour, 0);
  const endTime = toUtcDate(1970, 0, 1, startHour + 1, 0);

  const existing = await prisma.timeslots.findFirst({
    where: {
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    },
    select: { slot_id: true },
  });

  if (existing) {
    return prisma.timeslots.update({
      where: { slot_id: existing.slot_id },
      data: {
        semester: SEMESTER,
        academic_year: ACADEMIC_YEAR,
      },
    });
  }

  return prisma.timeslots.create({
    data: {
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      semester: SEMESTER,
      academic_year: ACADEMIC_YEAR,
      slot_type: "regular",
    },
  });
};

const isCsPresent = (studentIndex, classIndex) => {
  const i = classIndex;

  switch (studentIndex) {
    case 1:
      return i % 10 !== 0;
    case 2:
      return i % 9 !== 0;
    case 3:
      return i % 8 !== 0;
    case 4:
      return i % 7 !== 0;
    case 5:
      return i % 6 !== 0;
    case 6:
      return i % 5 !== 0;
    case 7:
      return i % 11 !== 0;
    case 8:
      return i % 5 < 3;
    case 9:
      return i % 7 < 4;
    case 10:
      return i % 6 < 4;
    default:
      return true;
  }
};

const isElPresent = (studentIndex, classIndex) => {
  const divisors = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const divisor = divisors[studentIndex - 1] || 6;
  return classIndex % divisor !== 0;
};

const main = async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const institution = await prisma.institutions.upsert({
    where: { code: "TIT-TEST" },
    update: {
      name: "Testville Institute of Technology",
      contact_email: "admin@test.com",
      contact_phone: "+910000000001",
      license_type: "premium",
      is_active: true,
    },
    create: {
      name: "Testville Institute of Technology",
      code: "TIT-TEST",
      address: "Testville, India",
      contact_email: "admin@test.com",
      contact_phone: "+910000000001",
      license_type: "premium",
      is_active: true,
    },
  });

  const csDepartment = await prisma.departments.upsert({
    where: { department_code: "CSE" },
    update: {
      department_name: "Computer Science",
      institution_id: institution.institution_id,
    },
    create: {
      department_name: "Computer Science",
      department_code: "CSE",
      institution_id: institution.institution_id,
    },
  });

  const elDepartment = await prisma.departments.upsert({
    where: { department_code: "ECE" },
    update: {
      department_name: "Electronics",
      institution_id: institution.institution_id,
    },
    create: {
      department_name: "Electronics",
      department_code: "ECE",
      institution_id: institution.institution_id,
    },
  });

  const admin = await upsertUser({
    email: "admin@test.com",
    role: "admin",
    firstName: "System",
    lastName: "Admin",
    collegeUid: "ADM-001",
    institutionId: institution.institution_id,
    phoneNumber: "+910000000010",
    passwordHash,
  });

  const coordinator = await upsertUser({
    email: "coord@test.com",
    role: "coordinator",
    firstName: "Core",
    lastName: "Coordinator",
    collegeUid: "COORD-001",
    institutionId: institution.institution_id,
    phoneNumber: "+910000000011",
    passwordHash,
  });

  const faculty1User = await upsertUser({
    email: "faculty1@test.com",
    role: "faculty",
    firstName: "Ada",
    lastName: "Lovelace",
    collegeUid: "EMP-001",
    institutionId: institution.institution_id,
    phoneNumber: "+910000000021",
    passwordHash,
  });

  const faculty2User = await upsertUser({
    email: "faculty2@test.com",
    role: "faculty",
    firstName: "Alan",
    lastName: "Turing",
    collegeUid: "EMP-002",
    institutionId: institution.institution_id,
    phoneNumber: "+910000000022",
    passwordHash,
  });

  const faculty3User = await upsertUser({
    email: "faculty3@test.com",
    role: "faculty",
    firstName: "Nikola",
    lastName: "Tesla",
    collegeUid: "EMP-003",
    institutionId: institution.institution_id,
    phoneNumber: "+910000000023",
    passwordHash,
  });

  const faculty1 = await prisma.faculty.upsert({
    where: { user_id: faculty1User.user_id },
    update: {
      department_id: csDepartment.department_id,
      designation: "Professor",
      expertise: ["DS", "DBMS", "ALG"],
      qualifications: ["M.Tech", "PhD"],
      joining_date: new Date("2020-06-01"),
      research_interests: ["Distributed Systems"],
      publications: ["Paper A"],
      preferred_slots: [1, 2, 3],
      max_classes_per_day: 4,
      max_weekly_hours: 40,
    },
    create: {
      user_id: faculty1User.user_id,
      department_id: csDepartment.department_id,
      designation: "Professor",
      expertise: ["DS", "DBMS", "ALG"],
      qualifications: ["M.Tech", "PhD"],
      joining_date: new Date("2020-06-01"),
      research_interests: ["Distributed Systems"],
      publications: ["Paper A"],
      preferred_slots: [1, 2, 3],
      max_classes_per_day: 4,
      max_weekly_hours: 40,
    },
  });

  const faculty2 = await prisma.faculty.upsert({
    where: { user_id: faculty2User.user_id },
    update: {
      department_id: csDepartment.department_id,
      designation: "Associate Professor",
      expertise: ["DBMS", "ALG"],
      qualifications: ["M.Tech"],
      joining_date: new Date("2021-08-01"),
      research_interests: ["Algorithms"],
      publications: ["Paper B"],
      preferred_slots: [2, 3, 4],
      max_classes_per_day: 4,
      max_weekly_hours: 38,
    },
    create: {
      user_id: faculty2User.user_id,
      department_id: csDepartment.department_id,
      designation: "Associate Professor",
      expertise: ["DBMS", "ALG"],
      qualifications: ["M.Tech"],
      joining_date: new Date("2021-08-01"),
      research_interests: ["Algorithms"],
      publications: ["Paper B"],
      preferred_slots: [2, 3, 4],
      max_classes_per_day: 4,
      max_weekly_hours: 38,
    },
  });

  const faculty3 = await prisma.faculty.upsert({
    where: { user_id: faculty3User.user_id },
    update: {
      department_id: elDepartment.department_id,
      designation: "Professor",
      expertise: ["CT", "DE"],
      qualifications: ["M.Tech", "PhD"],
      joining_date: new Date("2019-07-01"),
      research_interests: ["Signal Processing"],
      publications: ["Paper C"],
      preferred_slots: [3, 4, 5],
      max_classes_per_day: 4,
      max_weekly_hours: 40,
    },
    create: {
      user_id: faculty3User.user_id,
      department_id: elDepartment.department_id,
      designation: "Professor",
      expertise: ["CT", "DE"],
      qualifications: ["M.Tech", "PhD"],
      joining_date: new Date("2019-07-01"),
      research_interests: ["Signal Processing"],
      publications: ["Paper C"],
      preferred_slots: [3, 4, 5],
      max_classes_per_day: 4,
      max_weekly_hours: 40,
    },
  });

  const csSection = await upsertSection({
    sectionName: "CS-A",
    batchYear: 2023,
    departmentId: csDepartment.department_id,
    institutionId: institution.institution_id,
    semester: SEMESTER,
    academicYear: ACADEMIC_YEAR,
    maxCapacity: 60,
    studentCount: 10,
  });

  const elSection = await upsertSection({
    sectionName: "EL-A",
    batchYear: 2023,
    departmentId: elDepartment.department_id,
    institutionId: institution.institution_id,
    semester: SEMESTER,
    academicYear: ACADEMIC_YEAR,
    maxCapacity: 60,
    studentCount: 10,
  });

  const buildingA = await upsertBuilding({
    institutionId: institution.institution_id,
    buildingName: "Academic Block A",
    floors: 4,
  });

  const buildingB = await upsertBuilding({
    institutionId: institution.institution_id,
    buildingName: "Tech Block B",
    floors: 3,
  });

  const roomA101 = await prisma.rooms.upsert({
    where: { room_number: "A-101" },
    update: {
      building_id: buildingA.building_id,
      room_type: "classroom",
      capacity: 60,
      floor_number: 1,
      status: "available",
    },
    create: {
      building_id: buildingA.building_id,
      room_number: "A-101",
      room_type: "classroom",
      capacity: 60,
      floor_number: 1,
      status: "available",
    },
  });

  await prisma.rooms.upsert({
    where: { room_number: "A-102" },
    update: {
      building_id: buildingA.building_id,
      room_type: "classroom",
      capacity: 60,
      floor_number: 1,
      status: "available",
    },
    create: {
      building_id: buildingA.building_id,
      room_number: "A-102",
      room_type: "classroom",
      capacity: 60,
      floor_number: 1,
      status: "available",
    },
  });

  await prisma.rooms.upsert({
    where: { room_number: "A-201" },
    update: {
      building_id: buildingA.building_id,
      room_type: "lab",
      capacity: 40,
      floor_number: 2,
      status: "available",
    },
    create: {
      building_id: buildingA.building_id,
      room_number: "A-201",
      room_type: "lab",
      capacity: 40,
      floor_number: 2,
      status: "available",
    },
  });

  await prisma.rooms.upsert({
    where: { room_number: "A-301" },
    update: {
      building_id: buildingA.building_id,
      room_type: "seminar_hall",
      capacity: 100,
      floor_number: 3,
      status: "available",
    },
    create: {
      building_id: buildingA.building_id,
      room_number: "A-301",
      room_type: "seminar_hall",
      capacity: 100,
      floor_number: 3,
      status: "available",
    },
  });

  const roomB101 = await prisma.rooms.upsert({
    where: { room_number: "B-101" },
    update: {
      building_id: buildingB.building_id,
      room_type: "classroom",
      capacity: 50,
      floor_number: 1,
      status: "available",
    },
    create: {
      building_id: buildingB.building_id,
      room_number: "B-101",
      room_type: "classroom",
      capacity: 50,
      floor_number: 1,
      status: "available",
    },
  });

  await prisma.rooms.upsert({
    where: { room_number: "B-201" },
    update: {
      building_id: buildingB.building_id,
      room_type: "lab",
      capacity: 30,
      floor_number: 2,
      status: "available",
    },
    create: {
      building_id: buildingB.building_id,
      room_number: "B-201",
      room_type: "lab",
      capacity: 30,
      floor_number: 2,
      status: "available",
    },
  });

  const csCourses = [
    { code: "CS301", name: "Data Structures" },
    { code: "CS302", name: "Database Systems" },
    { code: "CS303", name: "Algorithms" },
  ];

  const elCourses = [
    { code: "EL301", name: "Circuit Theory" },
    { code: "EL302", name: "Digital Electronics" },
  ];

  const upsertedCourses = [];

  for (const course of csCourses) {
    const upserted = await prisma.courses.upsert({
      where: { course_code: course.code },
      update: {
        course_name: course.name,
        department_id: csDepartment.department_id,
        institution_id: institution.institution_id,
        credits: 4,
        learning_outcomes: ["Seeded outcome"],
      },
      create: {
        course_code: course.code,
        course_name: course.name,
        department_id: csDepartment.department_id,
        institution_id: institution.institution_id,
        credits: 4,
        learning_outcomes: ["Seeded outcome"],
      },
    });
    upsertedCourses.push(upserted);
  }

  for (const course of elCourses) {
    const upserted = await prisma.courses.upsert({
      where: { course_code: course.code },
      update: {
        course_name: course.name,
        department_id: elDepartment.department_id,
        institution_id: institution.institution_id,
        credits: 4,
        learning_outcomes: ["Seeded outcome"],
      },
      create: {
        course_code: course.code,
        course_name: course.name,
        department_id: elDepartment.department_id,
        institution_id: institution.institution_id,
        credits: 4,
        learning_outcomes: ["Seeded outcome"],
      },
    });
    upsertedCourses.push(upserted);
  }

  const csStudents = [];
  const elStudents = [];

  for (let i = 1; i <= 20; i += 1) {
    const isCs = i <= 10;
    const studentNo = String(i).padStart(2, "0");
    const email = `student${i}@test.com`;
    const collegeUid = `STU-${studentNo}`;

    const user = await upsertUser({
      email,
      role: "student",
      firstName: `Student${i}`,
      lastName: isCs ? "CS" : "EL",
      collegeUid,
      institutionId: institution.institution_id,
      phoneNumber: `+910000001${studentNo}`,
      passwordHash,
    });

    const enrollmentNumber = isCs ? `2023CS${studentNo}` : `2023EL${studentNo}`;

    const student = await prisma.students.upsert({
      where: { enrollment_number: enrollmentNumber },
      update: {
        user_id: user.user_id,
        department_id: isCs ? csDepartment.department_id : elDepartment.department_id,
        section_id: isCs ? csSection.section_id : elSection.section_id,
        batch_year: 2023,
        current_semester: SEMESTER,
        guardian_name: `Guardian ${i}`,
        guardian_contact: `+91009900${studentNo}`,
      },
      create: {
        user_id: user.user_id,
        enrollment_number: enrollmentNumber,
        department_id: isCs ? csDepartment.department_id : elDepartment.department_id,
        section_id: isCs ? csSection.section_id : elSection.section_id,
        batch_year: 2023,
        current_semester: SEMESTER,
        guardian_name: `Guardian ${i}`,
        guardian_contact: `+91009900${studentNo}`,
      },
    });

    if (isCs) {
      csStudents.push(student);
    } else {
      elStudents.push(student);
    }
  }

  const timeSlots = new Map();
  for (let day = 1; day <= 5; day += 1) {
    for (let period = 0; period < 7; period += 1) {
      const slot = await upsertTimeslot({ dayOfWeek: day, period });
      timeSlots.set(`${day}-${period + 1}`, slot.slot_id);
    }
  }

  const csCourseRecords = upsertedCourses.filter((course) => course.course_code.startsWith("CS"));
  const elCourseRecords = upsertedCourses.filter((course) => course.course_code.startsWith("EL"));

  await prisma.notes.deleteMany({
    where: {
      course_id: { in: upsertedCourses.map((course) => course.course_id) },
    },
  });

  await prisma.resources.deleteMany({
    where: {
      course_id: { in: upsertedCourses.map((course) => course.course_id) },
    },
  });

  const existingClasses = await prisma.classes.findMany({
    where: {
      section_id: { in: [csSection.section_id, elSection.section_id] },
      semester: SEMESTER,
      academic_year: ACADEMIC_YEAR,
    },
    select: { class_id: true },
  });

  if (existingClasses.length) {
    const classIds = existingClasses.map((item) => item.class_id);
    const quizzes = await prisma.quizzes.findMany({
      where: { class_id: { in: classIds } },
      select: { quiz_id: true },
    });

    if (quizzes.length) {
      const quizIds = quizzes.map((item) => item.quiz_id);
      await prisma.quiz_responses.deleteMany({ where: { quiz_id: { in: quizIds } } });
      await prisma.quiz_questions.deleteMany({ where: { quiz_id: { in: quizIds } } });
      await prisma.quizzes.deleteMany({ where: { quiz_id: { in: quizIds } } });
    }

    await prisma.attendance.deleteMany({
      where: {
        class_id: { in: classIds },
      },
    });

    await prisma.classes.deleteMany({
      where: {
        class_id: { in: classIds },
      },
    });
  }

  const classDates = getPastWeekdays(30);

  for (let idx = 0; idx < classDates.length; idx += 1) {
    const classDate = classDates[idx];
    const jsDay = classDate.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    const csCourse = csCourseRecords[idx % csCourseRecords.length];
    const elCourse = elCourseRecords[idx % elCourseRecords.length];

    const csSlotId = timeSlots.get(`${dayOfWeek}-1`);
    const elSlotId = timeSlots.get(`${dayOfWeek}-2`);

    const csClass = await prisma.classes.create({
      data: {
        course_id: csCourse.course_id,
        faculty_id: idx % 2 === 0 ? faculty1.faculty_id : faculty2.faculty_id,
        room_id: roomA101.room_id,
        section_id: csSection.section_id,
        slot_id: csSlotId,
        semester: SEMESTER,
        academic_year: ACADEMIC_YEAR,
        is_active: true,
        date_of_class: classDate,
      },
    });

    const elClass = await prisma.classes.create({
      data: {
        course_id: elCourse.course_id,
        faculty_id: faculty3.faculty_id,
        room_id: roomB101.room_id,
        section_id: elSection.section_id,
        slot_id: elSlotId,
        semester: SEMESTER,
        academic_year: ACADEMIC_YEAR,
        is_active: true,
        date_of_class: classDate,
      },
    });

    const attendanceDate = normalizeDate(classDate);
    const classIndex = idx + 1;

    for (let s = 0; s < csStudents.length; s += 1) {
      const student = csStudents[s];
      await prisma.attendance.upsert({
        where: {
          class_id_student_id_date: {
            class_id: csClass.class_id,
            student_id: student.student_id,
            date: attendanceDate,
          },
        },
        create: {
          class_id: csClass.class_id,
          student_id: student.student_id,
          date: attendanceDate,
          status: isCsPresent(s + 1, classIndex) ? "present" : "absent",
          verification_method: "manual",
        },
        update: {
          status: isCsPresent(s + 1, classIndex) ? "present" : "absent",
          verification_method: "manual",
        },
      });
    }

    for (let s = 0; s < elStudents.length; s += 1) {
      const student = elStudents[s];
      await prisma.attendance.upsert({
        where: {
          class_id_student_id_date: {
            class_id: elClass.class_id,
            student_id: student.student_id,
            date: attendanceDate,
          },
        },
        create: {
          class_id: elClass.class_id,
          student_id: student.student_id,
          date: attendanceDate,
          status: isElPresent(s + 1, classIndex) ? "present" : "absent",
          verification_method: "manual",
        },
        update: {
          status: isElPresent(s + 1, classIndex) ? "present" : "absent",
          verification_method: "manual",
        },
      });
    }
  }

  for (const course of upsertedCourses) {
    const isCsCourse = course.course_code.startsWith("CS");
    const creatorUserId = isCsCourse ? faculty1User.user_id : faculty3User.user_id;
    const sectionId = isCsCourse ? csSection.section_id : elSection.section_id;

    for (let i = 1; i <= 3; i += 1) {
      await prisma.notes.create({
        data: {
          title: `${course.course_name} Note ${i}`,
          content: `Seeded note ${i} for ${course.course_name}`,
          created_by: creatorUserId,
          section_id: sectionId,
          course_id: course.course_id,
          tags: ["seed", "notes"],
        },
      });
    }

    for (let i = 1; i <= 2; i += 1) {
      await prisma.resources.create({
        data: {
          title: `${course.course_name} Resource ${i}`,
          description: `Seeded resource ${i} for ${course.course_name}`,
          file_url: `https://example.com/resources/${course.course_code.toLowerCase()}-${i}.pdf`,
          resource_type: "pdf",
          course_id: course.course_id,
          uploaded_by: creatorUserId,
          tags: ["seed", "resource"],
          visibility: "section",
          version: 1,
        },
      });
    }
  }

  console.log("Seed completed successfully", {
    institutionId: institution.institution_id,
    departmentIds: [csDepartment.department_id, elDepartment.department_id],
    users: {
      admin: admin.email,
      coordinator: coordinator.email,
      faculty: [faculty1User.email, faculty2User.email, faculty3User.email],
      students: 20,
    },
    sections: [csSection.section_name, elSection.section_name],
    courses: upsertedCourses.length,
    classes: 60,
  });
};

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
