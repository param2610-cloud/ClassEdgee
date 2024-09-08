const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Routes will be added here
const authRouter = require('./routes/auth');
const attendanceRouter = require('./routes/attendance');
const resourceRouter = require('./routes/resource');

app.use('/api/resource', resourceRouter);
app.use('/api/auth', authRouter);
app.use('/api/attendance', attendanceRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});