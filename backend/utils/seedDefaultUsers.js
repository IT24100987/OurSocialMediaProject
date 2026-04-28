const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ALLOWED_ROLES = new Set(['Admin', 'Manager', 'Staff', 'Client']);

const FALLBACK_DEFAULT_USERS = [
  {
    name: 'Admin',
    email: 'admin@spoton.com',
    password: 'admin123',
    role: 'Admin',
  },
  {
    name: 'Manager',
    email: 'manager@spoton.com',
    password: 'manager123',
    role: 'Manager',
  },
  {
    name: 'Staff',
    email: 'staff@spoton.com',
    password: 'staff123',
    role: 'Staff',
  },
  {
    name: 'Client',
    email: 'client@spoton.com',
    password: 'client123',
    role: 'Client',
  },
];

const getBcryptRounds = () => {
  const rounds = Number(process.env.SEED_PASSWORD_ROUNDS || 12);
  return Number.isInteger(rounds) && rounds >= 10 && rounds <= 15 ? rounds : 12;
};

const normalizeSeedUser = (user) => {
  if (!user || typeof user !== 'object') return null;

  const name = String(user.name || '').trim();
  const email = String(user.email || '').toLowerCase().trim();
  const password = String(user.password || '');
  const role = String(user.role || '').trim();

  if (!name || !email || !password || !role) return null;
  if (!ALLOWED_ROLES.has(role)) return null;

  return { name, email, password, role };
};

const getDefaultUsers = () => {
  // Supports adding many users without code changes via JSON env variable.
  if (process.env.SEED_USERS_JSON) {
    try {
      const parsed = JSON.parse(process.env.SEED_USERS_JSON);
      if (!Array.isArray(parsed)) {
        throw new Error('SEED_USERS_JSON must be an array of users');
      }

      const normalizedFromJson = parsed
        .map(normalizeSeedUser)
        .filter(Boolean);

      if (normalizedFromJson.length > 0) {
        return normalizedFromJson;
      }

      console.warn('SEED_USERS_JSON did not contain valid users. Falling back to defaults.');
    } catch (error) {
      console.warn(`Failed to parse SEED_USERS_JSON: ${error.message}. Falling back to defaults.`);
    }
  }

  return FALLBACK_DEFAULT_USERS.map((user) => {
    const roleKey = user.role.toUpperCase();

    return {
      name: process.env[`SEED_${roleKey}_NAME`] || user.name,
      email: (process.env[`SEED_${roleKey}_EMAIL`] || user.email).toLowerCase().trim(),
      password: process.env[`SEED_${roleKey}_PASSWORD`] || user.password,
      role: user.role,
    };
  });
};

const isBcryptHash = (value) => {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
};

const seedDefaultUsers = async () => {
  const defaultUsers = getDefaultUsers();
  const rounds = getBcryptRounds();

  let createdCount = 0;
  let updatedCount = 0;
  let repairedCount = 0;
  let failedCount = 0;

  for (const defaultUser of defaultUsers) {
    try {
      const normalizedUser = normalizeSeedUser(defaultUser);
      if (!normalizedUser) {
        failedCount += 1;
        console.error('Skipped invalid default user configuration entry.');
        continue;
      }

      const existingUser = await User.findOne({ email: normalizedUser.email });

      if (existingUser) {
        let shouldUpdate = false;

        if (existingUser.name !== normalizedUser.name) {
          existingUser.name = normalizedUser.name;
          shouldUpdate = true;
        }

        if (existingUser.role !== normalizedUser.role) {
          existingUser.role = normalizedUser.role;
          shouldUpdate = true;
        }

        if (existingUser.isActive !== true) {
          existingUser.isActive = true;
          shouldUpdate = true;
        }

        // Repair legacy records that stored non-bcrypt passwords for seeded accounts.
        if (!isBcryptHash(existingUser.password)) {
          existingUser.password = await bcrypt.hash(normalizedUser.password, rounds);
          repairedCount += 1;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          await existingUser.save();
          updatedCount += 1;
        }

        continue;
      }

      const hashedPassword = await bcrypt.hash(normalizedUser.password, rounds);

      await User.create({
        name: normalizedUser.name,
        email: normalizedUser.email,
        password: hashedPassword,
        role: normalizedUser.role,
        isActive: true,
      });

      createdCount += 1;
    } catch (error) {
      failedCount += 1;
      console.error(`Failed to seed user ${defaultUser?.email || 'unknown'}: ${error.message}`);
    }
  }

  if (failedCount > 0) {
    console.warn(`Default user seeding completed with ${failedCount} failure(s).`);
  }

  if (createdCount > 0 || updatedCount > 0 || repairedCount > 0) {
    console.log(
      `Default user seeding complete. Created: ${createdCount}, Updated: ${updatedCount}, Repaired passwords: ${repairedCount}.`
    );
  } else {
    console.log('Default user accounts already exist and are secure.');
  }
};

module.exports = seedDefaultUsers;