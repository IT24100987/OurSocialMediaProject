const Client = require('../models/Client');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d()\-\s]{7,20}$/;
const MIN_PASSWORD_LENGTH = 8;
const VALID_PACKAGES = ['Silver', 'Gold', 'Platinum', 'Diamond'];

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private/Admin/Manager
const getClients = async (req, res) => {
  try {
    // 'package' is a reserved JS word — read query params directly
    const { status, search } = req.query;
    const packageFilter = req.query.package;
    let query = {};

    if (packageFilter) query.package = packageFilter;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query).populate('userId', 'name email role');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single client profile
// @route   GET /api/clients/:id
// @access  Private/Admin/Manager/Client
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('userId', 'name email role');

    // Security check: Client role can only access their own profile
    if (req.user.role === 'Client' && client.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this client profile' });
    }

    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a client (Internal use by Admin/Manager)
// @route   POST /api/clients
// @access  Private/Admin/Manager
const createClient = async (req, res) => {
  try {
    // 'package' is a reserved JS word — read it directly from req.body
    const { name, email, phone, company, notes } = req.body;
    const packageName = req.body.package;
    const trimmedName = name?.trim();
    const normalizedEmail = email?.toLowerCase().trim();

    if (!trimmedName || !normalizedEmail) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (phone && !PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    if (packageName && !VALID_PACKAGES.includes(packageName)) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    const clientExists = await Client.findOne({ email: normalizedEmail });
    if (clientExists) {
      return res.status(400).json({ message: 'Client already exists' });
    }

    const client = await Client.create({
      name: trimmedName,
      email: normalizedEmail,
      phone: phone?.trim(),
      company: company?.trim(),
      package: packageName || 'Silver',
      packageAssignedAt: new Date(),
      registeredFrom: 'admin',
      notes: notes?.trim(),
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new client from landing page
// @route   POST /api/clients/register
// @access  Public
const registerClient = async (req, res) => {
  try {
    // 'package' is a reserved JS word — read it directly from req.body
    const { name, email, phone, company, password } = req.body;
    const packageName = req.body.package;
    const trimmedName = name?.trim();
    const normalizedEmail = email?.toLowerCase().trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    if (phone && !PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    if (packageName && !VALID_PACKAGES.includes(packageName)) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    const clientExists = await Client.findOne({ email: normalizedEmail });

    if (userExists || clientExists) {
      return res.status(400).json({ message: 'User or Client already exists with this email' });
    }

    // 1. Create User account automatically
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Client',
    });

    // 2. Create Client record linked to the user
    const client = await Client.create({
      userId: user._id,
      name: trimmedName,
      email: normalizedEmail,
      phone: phone?.trim(),
      company: company?.trim(),
      package: packageName || 'Silver',
      packageAssignedAt: new Date(),
      registeredFrom: 'landing_page',
    });

    // 3. Return with JWT for instant login
    res.status(201).json({
      message: 'Registration successful',
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: client._id,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private/Admin/Manager/Client (partial)
const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

     // Security check: Client role can only update limited fields on their own profile
    if (req.user.role === 'Client') {
         if (client.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this client' });
         }
         // Only allow updating phone and company for clients themselves
         client.phone = req.body.phone || client.phone;
         client.company = req.body.company || client.company;
    } else {
        // Admin or Manager can update anything
        client.name = req.body.name || client.name;
        client.email = req.body.email || client.email;
        client.phone = req.body.phone || client.phone;
        client.company = req.body.company || client.company;
        
        if (req.body.package && req.body.package !== client.package) {
            client.package = req.body.package;
            client.packageAssignedAt = new Date();
        }
        
        client.status = req.body.status || client.status;
        client.notes = req.body.notes || client.notes;
    }

    const updatedClient = await client.save();
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete (deactivate) client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (client) {
      client.status = 'inactive';
      await client.save();
      
      // Optionally deactivate linked user account
      if (client.userId) {
          const user = await User.findById(client.userId);
          if (user) {
              user.isActive = false;
              await user.save();
          }
      }

      res.json({ message: 'Client deactivated successfully' });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  registerClient,
  updateClient,
  deleteClient,
};
