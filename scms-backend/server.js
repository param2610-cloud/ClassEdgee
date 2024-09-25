import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import express from "express";
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
//
const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);
app.use('/',express.static(path.join(__dirname,'public')));
//



//router import 



//router declaration 
app.get("/", (req, res) => {
    res.sendFile("interface.html", { root: path.join(__dirname,'public') });
})


app.listen(port, () => console.log(`The App is Listening on port ${port}`));