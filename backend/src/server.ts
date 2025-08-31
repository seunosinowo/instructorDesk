import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database';
import app from './app';
import './models'; // Import models to ensure associations are set up

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .then(async () => {
    // Check if tables exist and sync if needed
    try {
      const [results] = await sequelize.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('Users', 'Schools')
      `);

      const existingTables = results.map((row: any) => row.table_name);
      const missingTables = ['Users', 'Schools'].filter(table => !existingTables.includes(table));

      if (missingTables.length > 0) {
        console.log(`Missing tables: ${missingTables.join(', ')}. Running sync...`);
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');
      } else {
        console.log('All required tables exist');
      }
    } catch (syncError) {
      console.error('Error checking/syncing database:', syncError);
      // Don't fail the server startup for sync errors
    }
  })
  .catch(err => {
    // Only log critical connection errors, not sync errors
    if (err.name === 'ConnectionError' || err.name === 'HostNotFoundError') {
      console.error('Database connection error:', err.message);
    }
  });


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;