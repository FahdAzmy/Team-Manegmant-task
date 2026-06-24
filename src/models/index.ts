import { sequelize } from "../config/database";
import { User } from "./user.model";

// Place any associations here when new models are introduced
// For example:
// User.hasMany(Project, { foreignKey: 'ownerId' });

export { sequelize, User };
