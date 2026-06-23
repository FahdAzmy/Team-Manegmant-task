"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
class UserService {
    /**
     * Find a user by email
     */
    static async getUserByEmail(email) {
        return user_model_1.User.findOne({ where: { email } });
    }
    /**
     * Find a user by primary key ID
     */
    static async getUserById(id) {
        return user_model_1.User.findByPk(id);
    }
    /**
     * Create a new user record in the database
     */
    static async createUser(userData) {
        return user_model_1.User.create(userData);
    }
}
exports.UserService = UserService;
