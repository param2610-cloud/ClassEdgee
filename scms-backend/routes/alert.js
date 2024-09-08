const router = require('express').Router();
const Alert = require('../models/alert.model');

router.post('/create', async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).send('Alert created successfully');
  } catch (error) {
    res.status(500).send('Error creating alert');
  }
});

router.get('/list', async (req, res) => {
  try {
    const alerts = await Alert.find().sort('-timestamp');
    res.json(alerts);
  } catch (error) {
    res.status(500).send('Error fetching alerts');
  }
});

module.exports = router;