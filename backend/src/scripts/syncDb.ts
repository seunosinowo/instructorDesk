import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Initial setup - create tables if they don't exist
    console.log('Creating database tables...');
    
    // First, check if Users table exists
    const [results] = await sequelize.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Users')"
    );
    const tableExists = (results as any[])[0].exists;

    if (!tableExists) {
      console.log('Tables do not exist. Creating all tables...');
      // Create all tables without dropping existing ones
      await sequelize.sync();
    } else {
      console.log('Tables already exist. No changes made.');
    }
    console.log('Database synchronized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();
