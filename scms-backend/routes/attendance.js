const router = require('express').Router();
const Attendance = require('../models/attendance.model');

router.post('/mark', async (req, res) => {
  try {
    const attendance = new Attendance({
      studentId: req.body.studentId,
      present: req.body.present
    });
    await attendance.save();
    res.status(201).send('Attendance marked successfully');
  } catch (error) {
    res.status(500).send('Error marking attendance');
  }
});

router.get('/report', async (req, res) => {
  try {
    const report = await Attendance.find().populate('studentId', 'username');
    res.json(report);
  } catch (error) {
    res.status(500).send('Error fetching attendance report');
  }
});

module.exports = router;