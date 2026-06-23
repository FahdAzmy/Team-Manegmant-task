"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const models_1 = require("./models");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // Authenticate with the database
        await models_1.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // Sync models to the database (creates tables/adds columns dynamically in development)
        const isDev = process.env.NODE_ENV === 'development';
        await models_1.sequelize.sync({ alter: isDev });
        console.log('Database models synchronized successfully.');
        // Start HTTP server
        app_1.default.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📖 API Docs available at http://localhost:${PORT}/api-docs`);
            console.log('=================================');
        });
    }
    catch (error) {
        console.error('Unable to connect to the database or start the server:', error);
        process.exit(1);
    }
};
startServer();
