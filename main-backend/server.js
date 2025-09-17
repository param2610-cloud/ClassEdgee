import connectDB from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import express, { Router } from "express";
import cors from "cors";
import { corsOptions } from "./src/config/corsOptions.js";
import path from "path";
import { fileURLToPath } from "url";
configDotenv();
const app = express();
const port = process.env.PORT || 3000;

// engine init time program
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);
app.use('/',express.static(path.join(__dirname,'public')));


//database connection
// connectDB()


//router import 
import adminRouter from "./src/Router/supreme.router.js"
import generalRouter from './src/Router/general.router.js'
import coordinatorRouter from './src/Router/coordinator.router.js'
import studentRouter from './src/Router/student.route.js'
import facultyRouter from './src/Router/faculty.router.js'
import departmentRouter from './src/Router/department.router.js'
import sectionRouter from './src/Router/section.router.js'
import curriculumRouter from "./src/Router/curriculum.router.js";
import timeslotRouter from './src/Router/timeslot.router.js';
import supremeRouter from './src/Router/supreme.router.js';
import roomRouter from './src/Router/room.router.js'
import institutionRouter from './src/Router/institution.router.js'
import attendanceRouter from "./src/Router/attendance.router.js";
import resourceRouter from "./src/Router/resource/resource.router.js";
//interactive classroom routes
import feedbackRoutes from './src/Router/InteractiveClassroom/feedback.router.js'
import activityRoutes from './src/Router/InteractiveClassroom/activity.router.js'
import sessionRoutes from './src/Router/InteractiveClassroom/session.router.js'
import analogisticRouters from './src/Router/InteractiveClassroom/analogistic.router.js'
import quizRouter from "./src/Router/quizRoutes.js";
import scheduleRouter from "./src/Router/schedule.router.js";
import  mannualscheduleRouter from "./src/Router/mannualSchedule.router.js";
import classesRouter from "./src/Router/classes/general.router.js";
import queryRouter from "./src/Router/query.router.js";
import emergencyRouter from './src/Router/emergency.router.js'
import equipmentRouter from './src/Router/equipment.router.js'


//print route
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
// app.use(logger)


//router declaration 
app.use('/api/v1/admin',adminRouter)
app.use('/api/v1/general',generalRouter)
app.use("/api/v1/coordinator",coordinatorRouter)
app.use("/api/v1/student",studentRouter)
app.use("/api/v1/faculty",facultyRouter)
app.use("/api/v1/department",departmentRouter)
app.use("/api/v1/section",sectionRouter)
app.use("/api/v1/curriculum",curriculumRouter)
app.use('/api/v1/timeslots', timeslotRouter)
app.use("/api/v1/supreme",supremeRouter)
app.use("/api/v1/room",roomRouter)
app.use("/api/v1/schedule",scheduleRouter)
app.use("/api/v1/mannual-schedule",mannualscheduleRouter)
app.use("/api/v1/institution",institutionRouter)
app.use("/api/v1/classes",classesRouter)
app.use("/api/v1/attendance",attendanceRouter)
app.use("/api/v1/resource",resourceRouter)
app.use("/api/v1/query",queryRouter)
app.use("/api/v1/equipment",equipmentRouter)
app.use("/api",emergencyRouter)




//interactive classroom
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/analogistics',analogisticRouters)

app.use("/api/v1/quizzes", quizRouter)



app.get("/", (req, res) => {
    res.sendFile("interface.html", { root: path.join(__dirname,'public') });
})
app.get("/health", (req, res) => {
    res.send("The App is Healthy")
})

const LOCALIP = process.env.LOCAL_IP || 'localhost'
app.listen(port, () => console.log(`The App is Listening on port ${port} \n health check at http://${LOCALIP}:${port}/health`));


export default app;