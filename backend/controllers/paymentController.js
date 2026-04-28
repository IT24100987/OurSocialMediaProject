const Payment = require('../models/Payment');

// Helper to generate Invoice ID like INV-2023-XXXX
const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const count = await Payment.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}-${sequence}`;
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin/Manager
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('clientId', 'name package');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment stats
// @route   GET /api/payments/stats
// @access  Private/Admin/Manager
const getPaymentStats = async (req, res) => {
  try {
    const allPayments = await Payment.find();
    
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    allPayments.forEach(payment => {
        if (payment.status === 'Paid') {
            paidCount++;
            totalRevenue += payment.amount;
            const paidDate = new Date(payment.paidAt || payment.createdAt);
            if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
               thisMonthRevenue += payment.amount;
            }
        } else if (payment.status === 'Pending') {
            pendingCount++;
        } else if (payment.status === 'Overdue') {
            overdueCount++;
        }
    });

    res.json({
        totalRevenue,
        thisMonthRevenue,
        pendingCount,
        paidCount,
        overdueCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payments for one client
// @route   GET /api/payments/client/:clientId
// @access  Private (Admin/Manager, or the specific Client)
const getClientPayments = async (req, res) => {
  try {
    // If the caller is a client, verify they own the records
    if (req.user.role === 'Client') {
        const client = await require('../models/Client').findOne({ userId: req.user.id });
        if (!client || client._id.toString() !== req.params.clientId) {
            return res.status(403).json({ message: 'Not authorized to view these payments' });
        }
    }

    const payments = await Payment.find({ clientId: req.params.clientId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record new payment
// @route   POST /api/payments
// @access  Private/Admin/Manager
const createPayment = async (req, res) => {
  try {
    // 'package' is a reserved word — extract it safely from the body object
    const { clientId, amount, method, status, description, currency, dueDate } = req.body;
    const packageName = req.body.package;

    if (!clientId || !amount) {
      return res.status(400).json({ message: 'Client and amount are required' });
    }

    const invoiceNumber = await generateInvoiceNumber();
    
    let paidAt = null;
    if (status === 'Paid') {
        paidAt = new Date();
    }

    const payment = await Payment.create({
      clientId,
      amount: parseFloat(amount),
      package: packageName,
      currency: currency || 'USD',
      method: method || 'Bank Transfer',
      status: status || 'Pending',
      invoiceNumber,
      description,
      dueDate,
      paidAt
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status or details
// @route   PUT /api/payments/:id
// @access  Private/Admin/Manager
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If status changing to Paid, set paidAt date
    if (req.body.status === 'Paid' && payment.status !== 'Paid') {
        payment.paidAt = new Date();
    } else if (req.body.status && req.body.status !== 'Paid') {
        payment.paidAt = null;
    }

    payment.amount = req.body.amount || payment.amount;
    payment.package = req.body.package || payment.package;
    payment.method = req.body.method || payment.method;
    payment.status = req.body.status || payment.status;
    payment.note = req.body.note || payment.note;

    const updatedPayment = await payment.save();
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await Payment.deleteOne({ _id: req.params.id });
    res.json({ message: 'Payment record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  getPaymentStats,
  getClientPayments,
  createPayment,
  updatePayment,
  deletePayment,
};
