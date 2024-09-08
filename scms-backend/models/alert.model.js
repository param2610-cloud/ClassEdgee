const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertSchema = new Schema({
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;