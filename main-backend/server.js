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
import principalRouter from './src/Router/principal.router.js'
import generalRouter from './src/Router/general.router.js'
import logger from "./src/middlewares/logger.js";
import coordinatorRouter from './src/Router/coordinator.router.js'
import studentRouter from './src/Router/student.route.js'
import facultyRouter from './src/Router/faculty.router.js'

//print route
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
app.use(logger)


//router declaration 
app.use('/api/v1/supreme',supremeRouter)
app.use('/api/v1/principal',principalRouter)
app.use('/api/v1/general',generalRouter)
app.use("/api/v1/coordinator",coordinatorRouter)
app.use("/api/v1/student",studentRouter)
app.use("/api/v1/faculty",facultyRouter)
//princiipal form data register 
//principal login



app.get("/", (req, res) => {
    res.sendFile("interface.html", { root: path.join(__dirname,'public') });
})


app.listen(port, () => console.log(`The App is Listening on port ${port}`));