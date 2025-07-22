import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import sequelize from './config/database';

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly, not when imported (e.g., in tests)
if (require.main === module) {
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connected');
      const isProduction = process.env.NODE_ENV === 'production';
      await sequelize.sync({ alter: !isProduction });
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  };
  startServer();
}

export { app, sequelize };