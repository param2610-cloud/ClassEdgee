const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  present: { type: Boolean, required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;