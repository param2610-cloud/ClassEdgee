const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  available: { type: Boolean, default: true }
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;