const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  package: {
    type: String,
    enum: ['Silver', 'Gold', 'Platinum', 'Diamond'],
  },
  method: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'],
    default: 'Cash',
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending',
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  note: {
    type: String,
  },
  paidAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
