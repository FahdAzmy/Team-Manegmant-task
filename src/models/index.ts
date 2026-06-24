import { sequelize } from '../config/database';
import { User } from './user.model';
import { Project } from './project.model';
import { Task } from './task.model';

User.hasMany(Project, { foreignKey: 'ownerId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export { sequelize, User, Project, Task };
