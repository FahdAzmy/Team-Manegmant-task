"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Project extends sequelize_1.Model {
}
exports.Project = Project;
Project.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    title: { type: sequelize_1.DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'completed', 'on-hold'),
        allowNull: false,
        defaultValue: 'active',
    },
    ownerId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
}, { sequelize: database_1.sequelize, tableName: 'projects' });
