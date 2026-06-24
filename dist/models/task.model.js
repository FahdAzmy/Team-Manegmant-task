"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Task extends sequelize_1.Model {
}
exports.Task = Task;
Task.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    title: { type: sequelize_1.DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'In Progress', 'Done'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
        defaultValue: 'Medium',
    },
    dueDate: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    projectId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
}, { sequelize: database_1.sequelize, tableName: 'tasks' });
