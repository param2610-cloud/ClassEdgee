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
connectDB()


//router import 
import supremeRouter from "./src/Router/supreme.router.js"
import generalRouter from './src/Router/general.router.js'
import logger from "./src/middlewares/logger.js";
import coordinatorRouter from './src/Router/coordinator.router.js'
import studentRouter from './src/Router/student.route.js'
import facultyRouter from './src/Router/faculty.router.js'
import departmentRouter from './src/Router/department.router.js'
import sectionRouter from './src/Router/section.router.js'

//print route
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
app.use(logger)


//router declaration 
app.use('/api/v1/supreme',supremeRouter)
app.use('/api/v1/general',generalRouter)
app.use("/api/v1/coordinator",coordinatorRouter)
app.use("/api/v1/student",studentRouter)
app.use("/api/v1/faculty",facultyRouter)
app.use("/api/v1/department",departmentRouter)
app.use("/api/v1/section",sectionRouter)
//principal form data register 
//principal login\


//interactive classroom routes
import feedbackRoutes from './src/Router/InteractiveClassroom/feedback.router.js'
import courseRoutes from './src/Router/InteractiveClassroom/course.router.js'
import activityRoutes from './src/Router/InteractiveClassroom/activity.router.js'
import sessionRoutes from './src/Router/InteractiveClassroom/session.router.js'
import analogisticRouters from './src/Router/InteractiveClassroom/analogistic.router.js'

//interactive classroom
app.use('/api/v2/feedback', feedbackRoutes);
app.use('/api/v2/courses', courseRoutes);
app.use('/api/v2/activities', activityRoutes);
app.use('/api/v2/sessions', sessionRoutes);
app.use('/api/v2/analogistics',analogisticRouters)



app.get("/", (req, res) => {
    res.sendFile("interface.html", { root: path.join(__dirname,'public') });
})


app.listen(port, () => console.log(`The App is Listening on port ${port}`));