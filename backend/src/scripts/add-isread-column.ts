import sequelize from '../config/database';

async function addIsReadColumn() {
  try {
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' AND column_name = 'isRead'
    `);

    if (results.length === 0) {
      // Add the column if it doesn't exist
      await sequelize.query(`
        ALTER TABLE messages 
        ADD COLUMN "isRead" BOOLEAN DEFAULT false NOT NULL
      `);
      console.log('Successfully added isRead column to messages table');
    } else {
      console.log('isRead column already exists in messages table');
    }
  } catch (error) {
    console.error('Error adding isRead column:', error);
  } finally {
    await sequelize.close();
  }
}

addIsReadColumn();