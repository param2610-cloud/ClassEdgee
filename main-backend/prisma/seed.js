// Surtech Engineering College — Comprehensive MAKAUT Seed
// Programs: B.Tech CSE, ECE, CE, ME, AE + BCA
// Official MAKAUT AICTE syllabus (2018-19 B.Tech, 2023-24 BCA)

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hash = (p) => bcrypt.hashSync(p, 10);
const t = (h, m) => new Date(`1970-01-01T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00.000Z`);
const pick = (arr, i) => arr[Math.abs(i) % arr.length];
const S = (code, name, credits, type, wh, specs = []) => ({ code, name, credits, type, wh, specs });

const INSTITUTION = {
  name: "Surtech Engineering College", code: "SURTECH",
  address: "Surtech Campus, Kolkata, West Bengal 700052",
  contact_email: "admin@surtech.edu", contact_phone: "+91-33-2456-7890",
  license_type: "engineering", is_active: true,
  settings: { university: "MAKAUT", affiliationYear: 2005 },
};

const DEPARTMENTS = [
  { name: "Computer Science & Engineering",          code: "CSE", email: "cse@surtech.edu" },
  { name: "Electronics & Communication Engineering", code: "ECE", email: "ece@surtech.edu" },
  { name: "Civil Engineering",                       code: "CE",  email: "ce@surtech.edu"  },
  { name: "Mechanical Engineering",                  code: "ME",  email: "me@surtech.edu"  },
  { name: "Automobile Engineering",                  code: "AE",  email: "ae@surtech.edu"  },
  { name: "Computer Applications",                   code: "CA",  email: "ca@surtech.edu"  },
  { name: "Applied Sciences & Humanities",           code: "ASH", email: "ash@surtech.edu" },
];

const BUILDINGS_DATA = [
  { name: "Main Academic Block", floors: 4, rooms: [
    ...["A-001","A-002","A-003","A-004"].map(n => ({ n, type: "classroom", cap: 60, floor: 0 })),
    ...["A-101","A-102","A-103","A-104"].map(n => ({ n, type: "classroom", cap: 60, floor: 1 })),
    ...["A-201","A-202","A-203","A-204"].map(n => ({ n, type: "classroom", cap: 60, floor: 2 })),
    { n: "A-301", type: "seminar_hall", cap: 120, floor: 3 },
    { n: "A-302", type: "seminar_hall", cap: 120, floor: 3 },
  ]},
  { name: "Lab & Workshop Complex", floors: 3, rooms: [
    { n: "B-101", type: "lab", cap: 30, floor: 1 },
    { n: "B-102", type: "lab", cap: 30, floor: 1 },
    { n: "B-201", type: "lab", cap: 25, floor: 2 },
    { n: "B-202", type: "lab", cap: 25, floor: 2 },
    { n: "B-301", type: "lab", cap: 20, floor: 3 },
    { n: "B-302", type: "lab", cap: 20, floor: 3 },
    { n: "B-303", type: "lab", cap: 20, floor: 3 },
  ]},
  { name: "Computer Center", floors: 2, rooms: [
    { n: "C-101", type: "lab", cap: 40, floor: 1 },
    { n: "C-102", type: "lab", cap: 40, floor: 1 },
    { n: "C-103", type: "lab", cap: 30, floor: 1 },
    { n: "C-104", type: "lab", cap: 30, floor: 2 },
  ]},
];

const PERIODS = [
  [8,30, 9,20],[9,20,10,10],[10,10,11,0],
  [11,15,12,5],[12,5,12,55],
  [13,40,14,30],[14,30,15,20],[15,30,16,20],
];

const PROGRAMS = [
  { code:"BTECH-CSE", name:"B.Tech in Computer Science & Engineering",              dept:"CSE", credits:180, sems:8 },
  { code:"BTECH-ECE", name:"B.Tech in Electronics & Communication Engineering",     dept:"ECE", credits:180, sems:8 },
  { code:"BTECH-CE",  name:"B.Tech in Civil Engineering",                           dept:"CE",  credits:180, sems:8 },
  { code:"BTECH-ME",  name:"B.Tech in Mechanical Engineering",                      dept:"ME",  credits:180, sems:8 },
  { code:"BTECH-AE",  name:"B.Tech in Automobile Engineering",                      dept:"AE",  credits:180, sems:8 },
  { code:"BCA",       name:"Bachelor of Computer Applications",                     dept:"CA",  credits:120, sems:6 },
];

const SYLLABUS = {
"BTECH-CSE":{
1:[S("BS-M101","Engineering Mathematics I",4,"theory",4,["mathematics"]),S("BS-PH101","Engineering Physics",4,"theory",4,["physics"]),S("ES-EE101","Basic Electrical Engineering",4,"theory",4,["electrical"]),S("BS-PH191","Physics Lab",1.5,"lab",3,["physics"]),S("ES-EE191","Basic Electrical Engineering Lab",1,"lab",2,["electrical"]),S("ES-ME191","Engineering Drawing & Workshop",3,"lab",6,["mechanical","drawing"])],
2:[S("BS-CH201","Engineering Chemistry",4,"theory",4,["chemistry"]),S("BS-M201","Mathematics II",4,"theory",4,["mathematics"]),S("ES-CS201","Programming for Problem Solving (C)",3,"theory",3,["computer_science","programming"]),S("HM-HU201","English Language & Technical Communication",2,"theory",2,["english","humanities"]),S("BS-CH291","Chemistry Lab",1.5,"lab",3,["chemistry"]),S("ES-CS291","C Programming Lab",2,"lab",4,["computer_science","programming"]),S("HM-HU291","Language Lab",1,"lab",2,["english"])],
3:[S("ESC-301","Analog & Digital Electronics",3,"theory",3,["electronics","digital_electronics"]),S("PCC-CS301","Data Structure & Algorithm",3,"theory",3,["computer_science","data_structures"]),S("PCC-CS302","Computer Organization",3,"theory",3,["computer_science","computer_architecture"]),S("BSC-301","Mathematics III",2,"theory",2,["mathematics"]),S("HSMC-301","Economics for Engineers",3,"theory",3,["humanities","economics"]),S("ESC-391","Analog & Digital Electronics Lab",2,"lab",4,["electronics"]),S("PCC-CS391","Data Structure & Algorithm Lab",2,"lab",4,["computer_science","data_structures"]),S("PCC-CS393","IT Workshop",2,"lab",4,["computer_science"])],
4:[S("PCC-CS401","Discrete Mathematics",4,"theory",4,["mathematics","computer_science"]),S("PCC-CS402","Computer Architecture",3,"theory",3,["computer_science","computer_architecture"]),S("PCC-CS403","Formal Language & Automata Theory",3,"theory",3,["computer_science","theory_of_computation"]),S("PCC-CS404","Design and Analysis of Algorithms",3,"theory",3,["computer_science","algorithms"]),S("BSC-401","Biology for Engineers",3,"theory",3,["biology","sciences"]),S("PCC-CS492","Computer Architecture Lab",2,"lab",4,["computer_science","computer_architecture"]),S("PCC-CS494","Design & Analysis of Algorithms Lab",2,"lab",4,["computer_science","algorithms"])],
5:[S("ESC-501","Software Engineering",3,"theory",3,["computer_science","software_engineering"]),S("PCC-CS501","Compiler Design",3,"theory",3,["computer_science","compilers"]),S("PCC-CS502","Operating Systems",3,"theory",3,["computer_science","operating_systems"]),S("PCC-CS503","Object Oriented Programming",3,"theory",3,["computer_science","oop","programming"]),S("HSMC-501","Introduction to Industrial Management",3,"theory",3,["management","humanities"]),S("PEC-IT501A","Theory of Computation (Elective I)",3,"theory",3,["computer_science","theory_of_computation"]),S("ESC-591","Software Engineering Lab",2,"lab",4,["computer_science","software_engineering"]),S("PCC-CS592","Operating Systems Lab",2,"lab",4,["computer_science","operating_systems"]),S("PCC-CS593","OOP Lab",2,"lab",4,["computer_science","programming"])],
6:[S("PCC-CS601","Database Management Systems",3,"theory",3,["computer_science","databases"]),S("PCC-CS602","Computer Networks",3,"theory",3,["computer_science","networking"]),S("PEC-IT601A","Advanced Algorithms (Elective I)",3,"theory",3,["computer_science","algorithms"]),S("PEC-IT602A","Embedded Systems (Elective II)",3,"theory",3,["computer_science","embedded_systems"]),S("OEC-IT601A","Numerical Methods (Open Elective)",3,"theory",3,["mathematics","computer_science"]),S("PROJ-CS601","Research Methodology & Mini Project",3,"project",3,["computer_science"]),S("PCC-CS691","DBMS Lab",2,"lab",4,["computer_science","databases"]),S("PCC-CS692","Computer Networks Lab",2,"lab",4,["computer_science","networking"])],
7:[S("PEC-CS701A","Internet of Things (Elective I)",3,"theory",3,["computer_science","iot"]),S("PEC-CS702A","Neural Networks & Deep Learning (Elective II)",3,"theory",3,["computer_science","machine_learning","ai"]),S("OEC-CS701A","Operation Research (Open Elective)",3,"theory",3,["mathematics","management"]),S("HSMC-701","Project Management & Entrepreneurship",3,"theory",3,["management","humanities"]),S("PW-CS781","Project Work I",3,"project",6,["computer_science"])],
8:[S("PEC-CS801A","Cryptography & Network Security (Elective I)",3,"theory",3,["computer_science","networking","security"]),S("OEC-CS801C","Mobile Computing (Open Elective)",3,"theory",3,["computer_science","mobile"]),S("PW-CS881","Project Work II & Dissertation",6,"project",12,["computer_science"])],
},
"BTECH-ECE":{
1:[S("BS-M101-E","Engineering Mathematics I",4,"theory",4,["mathematics"]),S("BS-CH101-E","Engineering Chemistry",4,"theory",4,["chemistry"]),S("ES-EE101-E","Basic Electrical Engineering",4,"theory",4,["electrical"]),S("BS-CH191-E","Chemistry Lab",1.5,"lab",3,["chemistry"]),S("ES-EE191-E","Basic Electrical Engineering Lab",1,"lab",2,["electrical"]),S("ES-ME191-E","Engineering Drawing & Workshop",3,"lab",6,["mechanical","drawing"])],
2:[S("BS-PH201-E","Engineering Physics",4,"theory",4,["physics"]),S("BS-M201-E","Mathematics II",4,"theory",4,["mathematics"]),S("ES-CS201-E","Programming for Problem Solving (C)",3,"theory",3,["computer_science","programming"]),S("HM-HU201-E","English Language & Technical Communication",2,"theory",2,["english","humanities"]),S("BS-PH291-E","Physics Lab",1.5,"lab",3,["physics"]),S("ES-CS291-E","C Programming Lab",2,"lab",4,["computer_science","programming"])],
3:[S("EC301","Electronic Devices",3,"theory",3,["electronics","electronic_devices"]),S("EC302","Digital System Design",3,"theory",3,["electronics","digital_electronics"]),S("EC303","Signals and Systems",3,"theory",3,["electronics","signal_processing"]),S("EC304","Network Theory",3,"theory",3,["electronics","circuit_theory"]),S("EC391","Electronic Devices Lab",1,"lab",2,["electronics"]),S("EC392","Digital System Design Lab",1,"lab",2,["electronics","digital_electronics"])],
4:[S("EC401","Analog Communication",3,"theory",3,["electronics","communication"]),S("EC402","Analog Circuits",3,"theory",3,["electronics","analog_electronics"]),S("EC403","Microprocessor & Microcontroller",3,"theory",3,["electronics","embedded_systems"]),S("EC491","Analog Communication Lab",1,"lab",2,["electronics","communication"]),S("EC492","Analog Electronic Circuits Lab",1,"lab",2,["electronics"]),S("EC493","Microprocessor & Microcontroller Lab",1,"lab",2,["electronics","embedded_systems"])],
5:[S("EC501","Electromagnetic Waves",3,"theory",3,["electronics","electromagnetics"]),S("EC502","Computer Architecture",3,"theory",3,["computer_science","computer_architecture"]),S("EC503","Digital Communication & Stochastic Processes",3,"theory",3,["electronics","communication","signal_processing"]),S("EC504","Digital Signal Processing",3,"theory",3,["electronics","signal_processing"]),S("EC591","Electromagnetic Wave Laboratory",1,"lab",2,["electronics","electromagnetics"]),S("EC592","Digital Communication Laboratory",1,"lab",2,["electronics","communication"]),S("EC593","Digital Signal Processing Lab",1,"lab",2,["electronics","signal_processing"])],
6:[S("EC601","Control System and Instrumentation",3,"theory",3,["electronics","control_systems"]),S("EC602","Computer Network",3,"theory",3,["electronics","networking"]),S("HM-HU601-E","Engineering Economics & Management",3,"theory",3,["management","humanities"]),S("PE-EC603A","CMOS VLSI Design (Elective)",3,"theory",3,["electronics","vlsi"]),S("OE-EC604A","Electronic Measurement & Instruments (Open Elective)",3,"theory",3,["electronics","instrumentation"]),S("EC691","Control and Instrumentation Laboratory",1,"lab",2,["electronics","control_systems"]),S("EC692","Computer Network Lab",1,"lab",2,["electronics","networking"]),S("EC681","Mini Project / Electronic Design Workshop",2,"project",4,["electronics"])],
7:[S("PE-EC701A","Microwave Theory & Technique (Elective I)",3,"theory",3,["electronics","microwave"]),S("PE-EC702A","Adaptive Signal Processing (Elective II)",3,"theory",3,["electronics","signal_processing"]),S("PE-EC703A","Embedded System (Elective III)",3,"theory",3,["electronics","embedded_systems"]),S("OE-EC704A","Web Technology (Open Elective)",3,"theory",3,["computer_science","web"]),S("HM-HU701-E","Management",2,"theory",2,["management","humanities"]),S("EC782","Project Stage I",4,"project",8,["electronics"])],
8:[S("PE-EC801A","Antennas and Propagation (Elective I)",3,"theory",3,["electronics","antenna","microwave"]),S("PE-EC802A","Mixed Signal Design (Elective II)",3,"theory",3,["electronics","vlsi"]),S("OE-EC803A","Internet of Things (Open Elective)",3,"theory",3,["computer_science","iot"]),S("EC881","Project Stage II & Dissertation",7,"project",14,["electronics"])],
},
"BTECH-CE":{
1:[S("BS-M101-C","Engineering Mathematics I",4,"theory",4,["mathematics"]),S("BS-PH101-C","Engineering Physics",4,"theory",4,["physics"]),S("ES-EE101-C","Basic Electrical Engineering",4,"theory",4,["electrical"]),S("BS-PH191-C","Physics Lab",1.5,"lab",3,["physics"]),S("ES-EE191-C","Basic Electrical Engineering Lab",1,"lab",2,["electrical"]),S("ES-ME192-C","Engineering Drawing",3,"lab",6,["mechanical","drawing"])],
2:[S("BS-CH201-C","Engineering Chemistry",4,"theory",4,["chemistry"]),S("BS-M201-C","Mathematics II",4,"theory",4,["mathematics"]),S("ES-CS201-C","Programming for Problem Solving (C)",3,"theory",3,["computer_science","programming"]),S("HM-HU201-C","English Language & Technical Communication",2,"theory",2,["english","humanities"]),S("BS-CH291-C","Chemistry Lab",1.5,"lab",3,["chemistry"]),S("ES-CS291-C","C Programming Lab",2,"lab",4,["computer_science","programming"])],
3:[S("CE-ES301","Engineering Mechanics",4,"theory",4,["civil","mechanics","structural"]),S("CE-BS301","Biology for Engineers",3,"theory",3,["biology","sciences"]),S("CE-HS301","Humanities I",3,"theory",3,["humanities","management"]),S("CE-BS302","Mathematics III",2,"theory",2,["mathematics"]),S("CE-ES391","Basic Electronics Lab",2,"lab",4,["electronics"]),S("CE-ES392","Computer-Aided Civil Eng. Lab",2,"lab",4,["civil","computer_science"])],
4:[S("CE-PC401","Soil Mechanics I",3,"theory",3,["civil","geotechnical"]),S("CE-PC402","Environmental Engineering I",3,"theory",3,["civil","environmental"]),S("CE-PC403","Surveying & Geomatics",3,"theory",3,["civil","surveying"]),S("CE-PC404","Concrete Technology",3,"theory",3,["civil","structural","materials"]),S("CE-ES401","Introduction to Fluid Mechanics",2,"theory",2,["civil","fluid_mechanics"]),S("CE-ES491","Fluid Mechanics Laboratory",1,"lab",2,["civil","fluid_mechanics"]),S("CE-PC493","Surveying & Geomatics Lab",1,"lab",2,["civil","surveying"]),S("CE-PC494","Concrete Technology Laboratory",1,"lab",2,["civil","materials"])],
5:[S("CE-PC501","Design of RC Structures",3,"theory",3,["civil","structural","rc_design"]),S("CE-PC502","Engineering Hydrology",3,"theory",3,["civil","hydrology","water_resources"]),S("CE-PC503","Structural Analysis I",3,"theory",3,["civil","structural"]),S("CE-PC504","Soil Mechanics II",3,"theory",3,["civil","geotechnical"]),S("CE-PC506","Transportation Engineering",3,"theory",3,["civil","transportation"]),S("CE-PC591","RC Design Sessional",1,"lab",2,["civil","structural"]),S("CE-PC594","Soil Mechanics Laboratory",1,"lab",2,["civil","geotechnical"]),S("CE-PC596","Transportation Engineering Lab",1,"lab",2,["civil","transportation"])],
6:[S("CE-PC601","Construction Engineering & Management",2,"theory",2,["civil","construction","management"]),S("CE-PC602","Engineering Economics, Estimation & Costing",2,"theory",2,["civil","economics"]),S("CE-PC603","Water Resources Engineering",2,"theory",2,["civil","water_resources"]),S("CE-PC604","Design of Steel Structures",2,"theory",2,["civil","structural","steel_design"]),S("CE-PE601B","Foundation Engineering (Elective)",2,"theory",2,["civil","geotechnical"]),S("CE-PE602B","Structural Analysis II (Elective)",2,"theory",2,["civil","structural"]),S("CE-PC693","Water Resource Engineering Lab",1,"lab",2,["civil","water_resources"]),S("CE-PC694","Steel Structure Design Sessional",1,"lab",2,["civil","structural"])],
7:[S("CE-PE701A","Computational Hydraulics (Elective I)",3,"theory",3,["civil","hydraulics"]),S("CE-PE702A","Prestressed Concrete (Elective II)",3,"theory",3,["civil","structural"]),S("CE-PE703A","Air and Noise Pollution Control (Elective III)",3,"theory",3,["civil","environmental"]),S("CE-PE705A","Railway and Airport Engineering (Elective IV)",2,"theory",2,["civil","transportation"]),S("CE-OE701A","Metro System and Engineering (Open Elective)",2,"theory",2,["civil","transportation"])],
8:[S("CE-HS801A","Professional Practice, Law & Ethics",2,"theory",2,["civil","humanities"]),S("CE-PE801A","GIS & Remote Sensing (Elective)",2,"theory",2,["civil","surveying"]),S("CE-PW881","Project Work & Dissertation",4,"project",8,["civil"])],
},
"BTECH-ME":{
1:[S("BS-M101-M","Engineering Mathematics I",4,"theory",4,["mathematics"]),S("BS-PH101-M","Engineering Physics",4,"theory",4,["physics"]),S("ES-EE101-M","Basic Electrical Engineering",4,"theory",4,["electrical"]),S("BS-PH191-M","Physics Lab",1.5,"lab",3,["physics"]),S("ES-EE191-M","Basic Electrical Engineering Lab",1,"lab",2,["electrical"]),S("ES-ME192-M","Engineering Drawing",3,"lab",6,["mechanical","drawing"])],
2:[S("BS-CH201-M","Engineering Chemistry",4,"theory",4,["chemistry"]),S("BS-M201-M","Mathematics II",4,"theory",4,["mathematics"]),S("ES-CS201-M","Programming for Problem Solving (C)",3,"theory",3,["computer_science","programming"]),S("HM-HU201-M","English Language & Technical Communication",2,"theory",2,["english","humanities"]),S("BS-CH291-M","Chemistry Lab",1.5,"lab",3,["chemistry"]),S("ES-CS291-M","C Programming Lab",2,"lab",4,["computer_science","programming"])],
3:[S("BS-M301-M","Mathematics III (PDE & Statistics)",4,"theory",4,["mathematics"]),S("ES-ME301","Engineering Mechanics",4,"theory",4,["mechanical","mechanics"]),S("PC-ME301","Thermodynamics",4,"theory",4,["mechanical","thermodynamics"]),S("PC-ME302","Manufacturing Processes",4,"theory",4,["mechanical","manufacturing"]),S("ES-ECE301-M","Basic Electronics Engineering",3,"theory",3,["electronics"]),S("PC-ME391","Manufacturing Processes Lab",3,"lab",6,["mechanical","manufacturing"])],
4:[S("PC-ME401","Applied Thermodynamics",4,"theory",4,["mechanical","thermodynamics"]),S("PC-ME402","Fluid Mechanics & Fluid Machines",4,"theory",4,["mechanical","fluid_mechanics"]),S("PC-ME403","Strength of Materials",4,"theory",4,["mechanical","solid_mechanics"]),S("PC-ME404","Metrology & Instrumentation",4,"theory",4,["mechanical","metrology"]),S("ES-ME401","Materials Engineering",3,"theory",3,["mechanical","materials"]),S("PC-ME491","Manufacturing Practice Lab",1.5,"lab",3,["mechanical","manufacturing"]),S("PC-ME492","Machine Drawing I",1.5,"lab",3,["mechanical","drawing"])],
5:[S("PC-ME501","Heat Transfer",4,"theory",4,["mechanical","heat_transfer","thermodynamics"]),S("PC-ME502","Solid Mechanics",4,"theory",4,["mechanical","solid_mechanics"]),S("PC-ME503","Kinematics and Theory of Machines",4,"theory",4,["mechanical","kinematics","dynamics"]),S("HM-HU501-M","Effective Technical Communication",3,"theory",3,["humanities","management"]),S("PC-ME591","Mechanical Engineering Laboratory",1.5,"lab",3,["mechanical"]),S("PC-ME592","Machine Drawing II",1.5,"lab",3,["mechanical","drawing"])],
6:[S("PC-ME601","Manufacturing Technology",4,"theory",4,["mechanical","manufacturing","cnc"]),S("PC-ME602","Design of Machine Elements",4,"theory",4,["mechanical","machine_design"]),S("HM-HU601-M","Operations Research",3,"theory",3,["management","mathematics"]),S("PE-ME601A","Internal Combustion Engines (Elective)",3,"theory",3,["mechanical","thermodynamics","engines"]),S("PC-ME691","Mechanical Engineering Lab",1.5,"lab",3,["mechanical"])],
7:[S("PC-ME701","Advanced Manufacturing Technology",3,"theory",3,["mechanical","manufacturing"]),S("PE-ME711A","CAD/CAM (Elective Group 1)",3,"theory",3,["mechanical","cad_cam"]),S("PE-ME712A","Industrial Engineering (Elective Group 2)",3,"theory",3,["mechanical","management"]),S("PC-ME791","Mechanical Engineering Lab",1.5,"lab",3,["mechanical"]),S("PW-ME781","Project III",3,"project",6,["mechanical"])],
8:[S("PE-ME801A","Power Plant Engineering (Elective I)",3,"theory",3,["mechanical","thermodynamics"]),S("PE-ME802A","Total Quality Management (Elective II)",3,"theory",3,["mechanical","management"]),S("PW-ME881","Project IV",5,"project",10,["mechanical"])],
},
"BTECH-AE":{
1:[S("BS-M101-A","Engineering Mathematics I",4,"theory",4,["mathematics"]),S("BS-CH101-A","Engineering Chemistry",4,"theory",4,["chemistry"]),S("ES-EE101-A","Basic Electrical Engineering",4,"theory",4,["electrical"]),S("BS-CH191-A","Chemistry Lab",1.5,"lab",3,["chemistry"]),S("ES-EE191-A","Basic Electrical Engineering Lab",1,"lab",2,["electrical"]),S("ES-ME192-A","Engineering Drawing",3,"lab",6,["mechanical","drawing","automobile"])],
2:[S("BS-PH201-A","Engineering Physics",4,"theory",4,["physics"]),S("BS-M201-A","Mathematics II",4,"theory",4,["mathematics"]),S("ES-CS201-A","Programming for Problem Solving (C)",3,"theory",3,["computer_science","programming"]),S("HM-HU201-A","English Language & Technical Communication",2,"theory",2,["english","humanities"]),S("BS-PH291-A","Physics Lab",1.5,"lab",3,["physics"]),S("ES-CS291-A","C Programming Lab",2,"lab",4,["computer_science","programming"])],
3:[S("BS-M301-A","Mathematics III",4,"theory",4,["mathematics"]),S("ES-AUE301","Engineering Mechanics",4,"theory",4,["automobile","mechanics"]),S("PC-AUE301","Applied Thermodynamics",4,"theory",4,["automobile","thermodynamics"]),S("PC-AUE302","Manufacturing Methods",4,"theory",4,["automobile","manufacturing"]),S("ES-ECE301-A","Basic Electronics Engineering",3,"theory",3,["electronics"]),S("PC-AUE391","Machine Drawing Lab",1.5,"lab",3,["automobile","drawing"])],
4:[S("PC-AUE401","Strength of Materials",4,"theory",4,["automobile","solid_mechanics"]),S("PC-AUE402","Fluid Mechanics & Hydraulic Machines",4,"theory",4,["automobile","fluid_mechanics"]),S("PC-AUE403","Theory of Machines",4,"theory",4,["automobile","kinematics","dynamics"]),S("PC-AUE404","Metrology & Instrumentation",3,"theory",3,["automobile","metrology"]),S("ES-AUE401","Materials Engineering",3,"theory",3,["automobile","materials"]),S("PC-AUE491","Manufacturing and Testing Lab",1.5,"lab",3,["automobile","manufacturing"])],
5:[S("PC-AUE501","Automotive Engines",3,"theory",3,["automobile","engines","thermodynamics"]),S("PC-AUE502","Automotive Body & Chassis",3,"theory",3,["automobile","body_chassis"]),S("PC-AUE503","Heat Transfer",4,"theory",4,["automobile","heat_transfer"]),S("PC-AUE504","Design of Machine Elements",4,"theory",4,["automobile","machine_design"]),S("PC-AUE591","Fluid Mechanics & Heat Lab",1.5,"lab",3,["automobile","fluid_mechanics"]),S("PC-AUE592","Automobile Engineering Lab I",1.5,"lab",3,["automobile"])],
6:[S("PC-AUE601","Automotive Transmission",3,"theory",3,["automobile","transmission"]),S("PC-AUE602","Hybrid and Electric Vehicles",3,"theory",3,["automobile","ev","hybrid"]),S("PE-AUE611A","Electronic Vehicle Management (Elective)",3,"theory",3,["automobile","ev","electronics"]),S("PC-AUE691","Automobile Engineering Lab III",1.5,"lab",3,["automobile"]),S("PC-AUE692","Automobile Engineering Lab IV",1.5,"lab",3,["automobile"])],
7:[S("PC-AUE701","Vehicle Dynamics",3,"theory",3,["automobile","dynamics"]),S("PE-AUE711A","Alternate Fuels & Fuel Management (Elective I)",3,"theory",3,["automobile","fuels"]),S("PE-AUE712A","Automotive Component Design (Elective II)",3,"theory",3,["automobile","machine_design"]),S("OE-AUE711A","Quality Control & Management (Open Elective)",3,"theory",3,["management","quality"]),S("PC-AUE791","Automobile Engineering Lab V",1.5,"lab",3,["automobile"]),S("PW-AUE781","Project III",3,"project",6,["automobile"])],
8:[S("PE-AUE811A","Off Road Vehicles (Elective I)",3,"theory",3,["automobile"]),S("PE-AUE812A","Non-Destructive Testing Methods (Elective II)",3,"theory",3,["automobile","testing"]),S("OE-AUE811B","Internet of Things (Open Elective)",3,"theory",3,["automobile","iot"]),S("PW-AUE882","Project IV",6,"project",12,["automobile"])],
},
"BCA":{
1:[S("BCAC101","Digital Electronics",3,"theory",3,["electronics","digital_electronics","computer_applications"]),S("BCAC191","Digital Electronics Lab",2,"lab",4,["electronics","computer_applications"]),S("BCAC102","Programming for Problem Solving through C",3,"theory",3,["computer_applications","programming"]),S("BCAC192","C Programming Lab",2,"lab",4,["computer_applications","programming"])],
2:[S("BCAC201","Computer Architecture",3,"theory",3,["computer_applications","computer_architecture"]),S("BCAC291","Computer Architecture Lab",2,"lab",4,["computer_applications","computer_architecture"]),S("BCAC202","Web Design Using HTML, CSS, JavaScript",3,"theory",3,["computer_applications","web","programming"]),S("BCAC292","Web Design Lab",2,"lab",4,["computer_applications","web"])],
3:[S("BCAC301","Python Programming",3,"theory",3,["computer_applications","python","programming"]),S("BCAC391","Python Programming Lab",2,"lab",4,["computer_applications","python"]),S("BCAC302","Data Structure through C",3,"theory",3,["computer_applications","data_structures"]),S("BCAC392","Data Structure Lab",2,"lab",4,["computer_applications","data_structures"])],
4:[S("BCAC401","Database Management System",5,"theory",5,["computer_applications","databases"]),S("BCAC491","DBMS Lab",2,"lab",4,["computer_applications","databases"]),S("BCAC402","Operating System",4,"theory",4,["computer_applications","operating_systems"]),S("BCAC403","Software Engineering",4,"theory",4,["computer_applications","software_engineering"])],
5:[S("BCAC501","PHP with MySQL",5,"theory",5,["computer_applications","web","php","databases"]),S("BCAC591","PHP with MySQL Lab",2,"lab",4,["computer_applications","web","php"]),S("BCAC502","Object Oriented Programming with Java",5,"theory",5,["computer_applications","java","oop"]),S("BCAC592","OOP with Java Lab",2,"lab",4,["computer_applications","java"])],
6:[S("BCAC601","Advance Java with Web Application",5,"theory",5,["computer_applications","java","web"]),S("BCAC691","Advance Java Lab",2,"lab",4,["computer_applications","java"]),S("BCAC602","Unix and Shell Programming",5,"theory",5,["computer_applications","unix","operating_systems"]),S("BCAC692","Unix Lab",2,"lab",4,["computer_applications","unix"]),S("BCAC603","Networking",4,"theory",4,["computer_applications","networking"])],
},
};

const FACULTY=[
{fn:"Debashis",ln:"Chakraborty",dept:"CSE",desig:"Professor & HOD",mwh:20,mpd:3,subjects:["PCC-CS301","PCC-CS403","PCC-CS404","BSC-301","PCC-CS401","PEC-IT501A"]},
{fn:"Arnab",ln:"Ghosh",dept:"CSE",desig:"Associate Professor",mwh:24,mpd:4,subjects:["PCC-CS301","PCC-CS391","PCC-CS601","PCC-CS691","ESC-501","ESC-591"]},
{fn:"Sayan",ln:"Mukherjee",dept:"CSE",desig:"Associate Professor",mwh:24,mpd:4,subjects:["PCC-CS501","PCC-CS502","PCC-CS592","PCC-CS402","PCC-CS492","PCC-CS302"]},
{fn:"Piyali",ln:"Banerjee",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PCC-CS503","PCC-CS593","ESC-501","ESC-591","ES-CS201","ES-CS291","ES-CS201-E","ES-CS291-E","ES-CS201-C","ES-CS291-C","ES-CS201-M","ES-CS291-M","ES-CS201-A","ES-CS291-A"]},
{fn:"Sourav",ln:"Das",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PCC-CS602","PCC-CS692","PEC-IT602A","PEC-CS701A","PEC-CS801A","EC602"]},
{fn:"Ananya",ln:"Roy",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PEC-CS702A","PEC-IT501A","OEC-CS701A","OEC-CS801C"]},
{fn:"Debasish",ln:"Sen",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PCC-CS302","PCC-CS402","PCC-CS492","ESC-301","ESC-391","PCC-CS393"]},
{fn:"Abhijit",ln:"Mondal",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PCC-CS301","PCC-CS391","PCC-CS404","PCC-CS494","PEC-IT601A"]},
{fn:"Moumita",ln:"Saha",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PEC-CS701A","OEC-CS801C","PROJ-CS601","PEC-IT602A","OEC-IT601A"]},
{fn:"Tapas",ln:"Bose",dept:"CSE",desig:"Professor",mwh:20,mpd:3,subjects:["PEC-CS801A","PCC-CS602","PCC-CS692","HSMC-701"]},
{fn:"Anwar",ln:"Ali",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PEC-IT602A","PEC-IT601A","OEC-IT601A"]},
{fn:"Subhendu",ln:"Dey",dept:"CSE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["ESC-301","ESC-391","PCC-CS302","PCC-CS393"]},
{fn:"Biswajit",ln:"Chatterjee",dept:"ECE",desig:"Professor & HOD",mwh:20,mpd:3,subjects:["EC303","EC503","EC504","EC592","EC593","PE-EC702A"]},
{fn:"Arindam",ln:"Mitra",dept:"ECE",desig:"Associate Professor",mwh:24,mpd:4,subjects:["EC301","EC391","EC402","EC492","EC304"]},
{fn:"Sushmita",ln:"Sarkar",dept:"ECE",desig:"Associate Professor",mwh:24,mpd:4,subjects:["EC401","EC491","EC503","EC592"]},
{fn:"Priyam",ln:"Kundu",dept:"ECE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["EC403","EC493","PE-EC703A","EC782","EC502"]},
{fn:"Souvik",ln:"Pal",dept:"ECE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["EC501","EC591","PE-EC701A","PE-EC801A"]},
{fn:"Anjali",ln:"Majumdar",dept:"ECE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["EC601","EC691","PE-EC603A","PE-EC802A"]},
{fn:"Uttam",ln:"Bhattacharya",dept:"ECE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["EC602","EC692","OE-EC803A","OE-EC704A","HM-HU601-E"]},
{fn:"Jahirul",ln:"Islam",dept:"ECE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["EC302","EC392","EC304","PE-EC701A"]},
{fn:"Rituparna",ln:"Dey",dept:"ECE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["EC504","EC593","OE-EC604A","HM-HU701-E"]},
{fn:"Tapas",ln:"Pal",dept:"CE",desig:"Professor & HOD",mwh:20,mpd:3,subjects:["CE-PC501","CE-PC591","CE-PC604","CE-PC694","CE-PE602B"]},
{fn:"Sunita",ln:"Ghosh",dept:"CE",desig:"Associate Professor",mwh:24,mpd:4,subjects:["CE-PC401","CE-PC504","CE-PC594","CE-PE601B"]},
{fn:"Arijit",ln:"Das",dept:"CE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["CE-PC403","CE-PC493","CE-PC506","CE-PC596","CE-PE705A","CE-PE801A"]},
{fn:"Nasrin",ln:"Khatun",dept:"CE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["CE-PC402","CE-PC502","CE-PC603","CE-PC693","CE-PE703A"]},
{fn:"Pradipta",ln:"Roy",dept:"CE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["CE-ES401","CE-ES491","CE-PE701A","CE-PC503"]},
{fn:"Sumana",ln:"Mandal",dept:"CE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["CE-ES301","CE-PC404","CE-PC494","CE-PC503"]},
{fn:"Kaustav",ln:"Sinha",dept:"CE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["CE-PC601","CE-PC602","CE-HS801A","CE-OE701A"]},
{fn:"Uttam Kumar",ln:"Das",dept:"ME",desig:"Professor & HOD",mwh:20,mpd:3,subjects:["PC-ME301","PC-ME401","PC-ME501","PC-ME591"]},
{fn:"Rajib",ln:"Dey",dept:"ME",desig:"Associate Professor",mwh:24,mpd:4,subjects:["PC-ME302","PC-ME391","PC-ME601","PC-ME691","PC-ME701","PE-ME711A"]},
{fn:"Soumya",ln:"Ghosh",dept:"ME",desig:"Associate Professor",mwh:24,mpd:4,subjects:["PC-ME402","PC-ME491","PC-ME492","PC-ME592"]},
{fn:"Mousumi",ln:"Roy",dept:"ME",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PC-ME403","PC-ME502","PE-ME801A"]},
{fn:"Asish",ln:"Mondal",dept:"ME",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PC-ME503","PC-ME602","PE-ME712A"]},
{fn:"Dipankar",ln:"Bera",dept:"ME",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["ES-ME401","PC-ME404"]},
{fn:"Krishnendu",ln:"Sen",dept:"ME",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["HM-HU601-M","PE-ME712A","PE-ME802A","PW-ME781"]},
{fn:"Subrata",ln:"Ghosh",dept:"AE",desig:"Professor & HOD",mwh:20,mpd:3,subjects:["PC-AUE301","PC-AUE501","PC-AUE601","PC-AUE701"]},
{fn:"Partha",ln:"Karmakar",dept:"AE",desig:"Associate Professor",mwh:24,mpd:4,subjects:["PC-AUE602","PE-AUE611A","PC-AUE691","PC-AUE692"]},
{fn:"Susmita",ln:"Biswas",dept:"AE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PC-AUE502","PC-AUE504","PE-AUE712A"]},
{fn:"Mrinmay",ln:"Das",dept:"AE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PC-AUE302","PC-AUE391","PC-AUE491","PC-AUE591","PC-AUE592","PC-AUE791"]},
{fn:"Raktim",ln:"Saha",dept:"AE",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["PE-AUE711A","OE-AUE811B","PE-AUE811A","PE-AUE812A"]},
{fn:"Swagata",ln:"Bose",dept:"CA",desig:"Associate Professor & HOD",mwh:24,mpd:4,subjects:["BCAC502","BCAC592","BCAC601","BCAC691","BCAC301","BCAC391"]},
{fn:"Debabrata",ln:"Nag",dept:"CA",desig:"Associate Professor",mwh:24,mpd:4,subjects:["BCAC401","BCAC491","BCAC403"]},
{fn:"Sudipta",ln:"Roy",dept:"CA",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["BCAC202","BCAC292","BCAC501","BCAC591"]},
{fn:"Anuradha",ln:"Das",dept:"CA",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["BCAC102","BCAC192","BCAC302","BCAC392"]},
{fn:"Shubhraneel",ln:"Dey",dept:"CA",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["BCAC402","BCAC602","BCAC692","BCAC603"]},
{fn:"Pritha",ln:"Chatterjee",dept:"CA",desig:"Assistant Professor",mwh:24,mpd:4,subjects:["BCAC101","BCAC191","BCAC201","BCAC291"]},
{fn:"Biswanath",ln:"Pal",dept:"ASH",desig:"Associate Professor",mwh:30,mpd:5,subjects:["BS-M101","BS-M201","BSC-301","PCC-CS401","OEC-IT601A","OEC-CS701A","BS-M101-E","BS-M201-E","BS-M101-C","BS-M201-C","CE-BS302","BS-M101-M","BS-M201-M","BS-M301-M","BS-M101-A","BS-M201-A","BS-M301-A"]},
{fn:"Amitava",ln:"Sen",dept:"ASH",desig:"Associate Professor",mwh:30,mpd:5,subjects:["BS-PH101","BS-PH191","BS-PH201-E","BS-PH291-E","BS-PH101-C","BS-PH191-C","BS-PH101-M","BS-PH191-M","BS-PH201-A","BS-PH291-A"]},
{fn:"Jayita",ln:"Roy",dept:"ASH",desig:"Associate Professor",mwh:30,mpd:5,subjects:["BS-CH201","BS-CH291","BS-CH101-E","BS-CH191-E","BS-CH201-C","BS-CH291-C","BS-CH201-M","BS-CH291-M","BS-CH101-A","BS-CH191-A"]},
{fn:"Nilufar",ln:"Begum",dept:"ASH",desig:"Assistant Professor",mwh:30,mpd:5,subjects:["HM-HU201","HM-HU291","HM-HU201-E","HM-HU201-C","HM-HU201-M","HM-HU201-A","HSMC-301","HSMC-501","HSMC-701","HM-HU501-M","HM-HU601-E","CE-HS301","CE-HS801A"]},
{fn:"Kalyani",ln:"Bhattacharya",dept:"ASH",desig:"Assistant Professor",mwh:30,mpd:5,subjects:["ES-EE101","ES-EE191","ES-EE101-E","ES-EE191-E","ES-EE101-C","ES-EE191-C","ES-EE101-M","ES-EE191-M","ES-EE101-A","ES-EE191-A"]},
{fn:"Subhajit",ln:"Kundu",dept:"ASH",desig:"Assistant Professor",mwh:30,mpd:5,subjects:["ES-ME191","ES-ME191-E","ES-ME192-C","ES-ME192-M","ES-ME192-A","PC-ME492","PC-ME592","PC-AUE391","CE-ES391","CE-ES392","CE-BS301","BSC-401","ES-ECE301-M","ES-ECE301-A"]},
];

const SECTION_CONFIGS=[
{dept:"CSE",batch:2025,sem:2,sections:["A","B","C"],count:40},
{dept:"CSE",batch:2024,sem:4,sections:["A","B","C"],count:40},
{dept:"CSE",batch:2023,sem:6,sections:["A","B"],count:40},
{dept:"CSE",batch:2022,sem:8,sections:["A","B"],count:38},
{dept:"ECE",batch:2025,sem:2,sections:["A","B"],count:40},
{dept:"ECE",batch:2024,sem:4,sections:["A","B"],count:40},
{dept:"ECE",batch:2023,sem:6,sections:["A"],count:38},
{dept:"ECE",batch:2022,sem:8,sections:["A"],count:35},
{dept:"CE",batch:2025,sem:2,sections:["A","B"],count:38},
{dept:"CE",batch:2024,sem:4,sections:["A"],count:38},
{dept:"CE",batch:2023,sem:6,sections:["A"],count:35},
{dept:"CE",batch:2022,sem:8,sections:["A"],count:30},
{dept:"ME",batch:2025,sem:2,sections:["A","B"],count:38},
{dept:"ME",batch:2024,sem:4,sections:["A"],count:38},
{dept:"ME",batch:2023,sem:6,sections:["A"],count:35},
{dept:"ME",batch:2022,sem:8,sections:["A"],count:30},
{dept:"AE",batch:2025,sem:2,sections:["A"],count:35},
{dept:"AE",batch:2024,sem:4,sections:["A"],count:32},
{dept:"AE",batch:2023,sem:6,sections:["A"],count:28},
{dept:"AE",batch:2022,sem:8,sections:["A"],count:22},
{dept:"CA",batch:2025,sem:2,sections:["A","B"],count:38},
{dept:"CA",batch:2024,sem:4,sections:["A","B"],count:35},
{dept:"CA",batch:2023,sem:6,sections:["A"],count:32},
];

const FIRST_NAMES=["Aarav","Aditya","Akash","Amrit","Anirban","Arjun","Arnab","Debayan","Gourab","Hrithik","Indraneel","Jay","Kartik","Kunal","Manab","Nikhil","Pratik","Rahul","Rishi","Rohit","Sanjay","Soham","Sounak","Suresh","Vivek","Ananya","Ankita","Diya","Ishita","Kavya","Madhuri","Meghna","Moumita","Nandita","Piyali","Priya","Riya","Sanjukta","Shreya","Sneha","Srija","Supriya","Tanushree","Tina","Urmila","Bishal","Debdyuti","Farhan","Gourav","Himangshu","Joydeep","Koustav","Loknath","Mithuraj","Nilesh","Omkar","Partha","Rudradeep","Saikat","Tapan"];
const LAST_NAMES=["Ghosh","Chakraborty","Banerjee","Mukherjee","Das","Bose","Dey","Chatterjee","Sarkar","Mondal","Roy","Saha","Sen","Pal","Kundu","Majumdar","Mitra","Biswas","Bhattacharya","Nandi","Islam","Ansari","Khan","Shaikh","Begum","Patra","Misra"];

async function main() {
  console.log("🌱 Seeding Surtech Engineering College (MAKAUT)...\n");

  // CLEANUP
  console.log("Cleaning up...");
  try { await prisma.$executeRaw`TRUNCATE TABLE institutions CASCADE`; } catch {}
  console.log("✓ Cleanup done\n");

  // INSTITUTION
  const institution = await prisma.institutions.create({ data: INSTITUTION });
  const instId = institution.institution_id;
  console.log("✓ Institution:", institution.name);

  // DEPARTMENTS
  const deptMap = {};
  for (const d of DEPARTMENTS) {
    const dept = await prisma.departments.create({ data: { department_name:d.name, department_code:d.code, contact_email:d.email, institution_id:instId } });
    deptMap[d.code] = dept.department_id;
  }
  console.log("✓ Departments:", Object.keys(deptMap).join(", "));

  // BUILDINGS + ROOMS
  let roomCount = 0;
  for (const b of BUILDINGS_DATA) {
    const building = await prisma.buildings.create({ data: { building_name:b.name, floors:b.floors, institution_id:instId } });
    await prisma.rooms.createMany({ data: b.rooms.map(r => ({ building_id:building.building_id, room_number:r.n, room_type:r.type, capacity:r.cap, floor_number:r.floor, status:"available" })) });
    roomCount += b.rooms.length;
  }
  console.log("✓ Rooms:", roomCount);

  // TIMESLOTS (Mon-Sat, 8 periods = 48 slots)
  const slotMap = {};
  for (let day = 1; day <= 6; day++) {
    for (let p = 0; p < PERIODS.length; p++) {
      const [sh,sm,eh,em] = PERIODS[p];
      const slot = await prisma.timeslots.create({ data: { day_of_week:day, start_time:t(sh,sm), end_time:t(eh,em), slot_type:"regular", semester:2, academic_year:2026 } });
      slotMap[`${day}-${p}`] = slot.slot_id;
    }
  }
  console.log("✓ Timeslots:", Object.keys(slotMap).length);

  // PROGRAMS + SYLLABI + SUBJECTS + UNITS
  const subjectMap = {};
  let subjectCount = 0;
  const unitWeights = [0.20,0.22,0.22,0.20,0.16];
  const unitLabels = ["Introduction & Fundamentals","Core Concepts","Advanced Topics","Applications & Techniques","Case Studies & Problem Solving"];

  for (const prog of PROGRAMS) {
    const program = await prisma.courses.create({ data: { course_code:prog.code, course_name:prog.name, department_id:deptMap[prog.dept], credits:prog.credits, institution_id:instId, is_active:true } });
    for (let sem = 1; sem <= prog.sems; sem++) {
      const semSubjects = SYLLABUS[prog.code]?.[sem];
      if (!semSubjects) continue;
      const syllabus = await prisma.syllabus_structure.create({ data: { course_id:program.course_id, semester:sem } });
      for (const subj of semSubjects) {
        const sd = await prisma.subject_details.create({ data: { syllabus_id:syllabus.syllabus_id, course_id:program.course_id, subject_code:subj.code, subject_name:subj.name, subject_type:subj.type, preferred_faculty_specializations:subj.specs } });
        if (!subjectMap[subj.code]) subjectMap[subj.code] = [];
        subjectMap[subj.code].push(sd.subject_id);
        subjectCount++;
        const totalHours = subj.wh * 18;
        await prisma.units.createMany({ data: unitWeights.map((w,u) => ({ subject_id:sd.subject_id, unit_number:u+1, unit_name:`Unit ${u+1}: ${unitLabels[u]}`, required_hours:Math.max(2,Math.round(totalHours*w)), learning_objectives:[] })) });
      }
    }
  }
  console.log(`✓ Programs:${PROGRAMS.length} Subjects:${subjectCount} Units:${subjectCount*5}`);

  // ADMIN + COORDINATOR
  const pwd = hash("Surtech@2026");
  const adminUser = await prisma.users.create({ data: { email:"admin@surtech.edu", password_hash:pwd, role:"admin", first_name:"Rajan", last_name:"Kumar", college_uid:"ADM/001", institution_id:instId, status:"active" } });
  const coordUser = await prisma.users.create({ data: { email:"coordinator@surtech.edu", password_hash:pwd, role:"coordinator", first_name:"Sreela", last_name:"Basu", college_uid:"COORD/001", institution_id:instId, status:"active" } });
  console.log("✓ Admin + Coordinator");

  // FACULTY
  const preferredSlotIds = [1,2,3,4,5].flatMap(day=>[0,1,2,3].map(p=>slotMap[`${day}-${p}`]).filter(Boolean));
  for (let i = 0; i < FACULTY.length; i++) {
    const f = FACULTY[i];
    const email = `${f.fn.toLowerCase().replace(/[^a-z]/g,"")}.${f.ln.toLowerCase().replace(/[^a-z]/g,"")}@surtech.edu`;
    const user = await prisma.users.create({ data: { email, password_hash:pwd, role:"faculty", first_name:f.fn, last_name:f.ln, college_uid:`FAC/${String(i+1).padStart(3,"0")}`, institution_id:instId, status:"active", phone_number:`+91-98${String(3000000+i).padStart(7,"0")}` } });
    const faculty = await prisma.faculty.create({ data: { user_id:user.user_id, department_id:deptMap[f.dept], designation:f.desig, expertise:f.subjects.slice(0,5), qualifications:["M.Tech","B.Tech"], max_weekly_hours:f.mwh, max_classes_per_day:f.mpd, joining_date:new Date(`${2010+Math.floor(i/8)}-0${(i%9)+1}-15`), preferred_slots:preferredSlotIds.slice(0,12) } });
    const mappings = f.subjects.flatMap(code=>(subjectMap[code]||[]).map(subjectId=>({ faculty_id:faculty.faculty_id, subject_id:subjectId, status:"active" })));
    if (mappings.length) await prisma.faculty_subject_mapping.createMany({ data:mappings, skipDuplicates:true });
    await prisma.facultyavailability.createMany({ data:PERIODS.flatMap((period,p)=>Array.from({length:6},(_,d)=>({ faculty_id:faculty.faculty_id, day_of_week:d+1, start_time:t(period[0],period[1]), end_time:t(period[2],period[3]), is_preferred:d<5&&p<5 }))), skipDuplicates:true });
  }
  console.log(`✓ Faculty: ${FACULTY.length}`);

  // SECTIONS + STUDENTS
  const sectionMap = {};
  let totalStudents = 0;
  for (const cfg of SECTION_CONFIGS) {
    for (const letter of cfg.sections) {
      const section = await prisma.sections.create({ data: { section_name:`${cfg.dept}-${letter}-${cfg.batch}`, batch_year:cfg.batch, department_id:deptMap[cfg.dept], student_count:cfg.count, max_capacity:40, academic_year:2026, semester:cfg.sem, institution_id:instId } });
      sectionMap[`${cfg.dept}-${cfg.batch}-${cfg.sem}-${letter}`] = section.section_id;

      // Build user data
      const userData = [];
      const extras = [];
      for (let s = 1; s <= cfg.count; s++) {
        const num = String(s).padStart(3,"0");
        const fn = pick(FIRST_NAMES, s*7+cfg.batch+letter.charCodeAt(0));
        const ln = pick(LAST_NAMES, s*3+cfg.batch+letter.charCodeAt(0));
        const email = `${fn.toLowerCase()}${cfg.batch}${cfg.dept.toLowerCase()}${letter.toLowerCase()}${num}@surtech.edu`;
        userData.push({ email, password_hash:pwd, role:"student", first_name:fn, last_name:ln, college_uid:`${cfg.dept}/${cfg.batch}/${letter}${num}`, institution_id:instId, status:"active" });
        extras.push({ email, enrollNum:`SUR/${cfg.dept}/${cfg.batch}/${letter}/${num}`, cgpa:parseFloat((6.0+Math.random()*3.5).toFixed(2)) });
      }
      await prisma.users.createMany({ data:userData });
      const created = await prisma.users.findMany({ where:{ email:{ in:userData.map(u=>u.email) } }, select:{ user_id:true, email:true } });
      const emailToId = Object.fromEntries(created.map(u=>[u.email,u.user_id]));
      await prisma.students.createMany({ data:extras.map(e=>({ user_id:emailToId[e.email], enrollment_number:e.enrollNum, department_id:deptMap[cfg.dept], batch_year:cfg.batch, current_semester:cfg.sem, cgpa:e.cgpa, section_id:section.section_id })) });
      totalStudents += cfg.count;
    }
  }
  console.log(`✓ Sections:${Object.keys(sectionMap).length} Students:${totalStudents}`);

  // SCHEDULE META (one per section — ready for scheduler)
  await prisma.schedule_meta.createMany({ data:Object.entries(sectionMap).map(([key,sectionId])=>{
    const [dept,,sem,] = key.split("-");
    const batch = parseInt(key.split("-")[1]);
    const semester = parseInt(key.split("-")[2]);
    return { department_id:deptMap[dept], academic_year:2026, semester, batch_year:batch, created_by:coordUser.user_id, status:"draft", section_id:sectionId };
  }) });
  console.log(`✓ Schedule meta: ${Object.keys(sectionMap).length} sections`);

  console.log("\n🎓 Done!");
  console.log(`   University : MAKAUT | Programs: ${PROGRAMS.length} | Subjects: ${subjectCount}`);
  console.log(`   Faculty: ${FACULTY.length} | Students: ${totalStudents} | Sections: ${Object.keys(sectionMap).length}`);
  console.log("   Password: Surtech@2026  |  Admin: admin@surtech.edu  |  Coord: coordinator@surtech.edu");
}

main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
