const router = require('express').Router();
const Resource = require('../models/resource.model');

router.post('/add', async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).send('Resource added successfully');
  } catch (error) {
    res.status(500).send('Error adding resource');
  }
});

router.get('/list', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).send('Error fetching resources');
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, req.body);
    res.send('Resource updated successfully');
  } catch (error) {
    res.status(500).send('Error updating resource');
  }
});

module.exports = router;