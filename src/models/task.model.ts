import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TaskAttributes {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'description' | 'status' | 'priority' | 'dueDate'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare status: string;
  declare priority: string;
  declare dueDate: Date;
  declare projectId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Task.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('Pending', 'In Progress', 'Done'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: false,
      defaultValue: 'Medium',
    },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    projectId: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, tableName: 'tasks' }
);
