import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database';
import app from './app';
import './models'; // Import models to ensure associations are set up

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .then(() => {
    // Only sync in development, and only if tables don't exist
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      return sequelize.sync({ alter: true });
    }
  })
  .then(() => {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.log('Database synchronized');
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