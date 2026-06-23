import app from './app';
import { sequelize } from './models';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Authenticate with the database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models to the database (creates tables/adds columns dynamically in development)
    const isDev = process.env.NODE_ENV === 'development';
    await sequelize.sync({ alter: isDev });
    console.log('Database models synchronized successfully.');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📖 API Docs available at http://localhost:${PORT}/api-docs`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1);
  }
};

startServer();
