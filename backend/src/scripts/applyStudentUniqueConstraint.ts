import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';

async function applyUniqueConstraint() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Apply the unique constraint to Students.userId
    console.log('Adding unique constraint to Students.userId...');
    
    try {
      await sequelize.query(`
        ALTER TABLE "Students" 
        ADD CONSTRAINT students_userid_unique UNIQUE ("userId");
      `);
      console.log('Unique constraint added successfully');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('Unique constraint already exists');
      } else {
        throw error;
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyUniqueConstraint(); 