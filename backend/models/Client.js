const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Optional - if client has a login
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
  package: {
    type: String,
    enum: ['Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Silver',
  },
  packageAssignedAt: {
    type: Date,
  },
  registeredFrom: {
    type: String,
    enum: ['admin', 'landing_page'],
    default: 'admin',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Client', clientSchema);
