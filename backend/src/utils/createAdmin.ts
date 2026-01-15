import User from '../models/User.model';
import { logger } from './logger';

interface CreateAdminOptions {
  name: string;
  email: string;
  password: string;
}

/**
 * Utility function to create an admin user
 * This can be used in a script or endpoint
 */
export const createAdminUser = async (options: CreateAdminOptions): Promise<void> => {
  const { name, email, password } = options;

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        logger.info(`Admin user with email ${email} already exists`);
        return;
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.password = password; // Will be hashed by pre-save hook
        await existingAdmin.save();
        logger.info(`User ${email} has been promoted to admin`);
        return;
      }
    }

    // Create new admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isEmailVerified: true,
    });

    logger.info(`Admin user created successfully: ${admin.email}`);
  } catch (error) {
    logger.error(`Error creating admin user: ${error}`);
    throw error;
  }
};

/**
 * Script to create admin user from command line
 * Usage: tsx src/utils/createAdmin.ts "Admin Name" "admin@example.com" "password123"
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.error('Usage: tsx src/utils/createAdmin.ts <name> <email> <password>');
    process.exit(1);
  }

  const [name, email, password] = args;

  // Import database connection
  import('../config/database').then(async (module) => {
    const connectDatabase = module.default;
    await connectDatabase();
    
    await createAdminUser({ name, email, password });
    console.log('Admin user created successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
