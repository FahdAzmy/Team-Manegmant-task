"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_model_1 = require("../models/project.model");
class ProjectService {
    static async createProject(data) {
        return project_model_1.Project.create(data);
    }
    static async getUserProjects(userId, options) {
        return project_model_1.Project.findAndCountAll({
            where: { ownerId: userId },
            limit: options.limit,
            offset: options.offset,
            order: [[options.sortBy, options.sortOrder]],
        });
    }
    static async getAllProjects(options) {
        return project_model_1.Project.findAndCountAll({
            limit: options.limit,
            offset: options.offset,
            order: [[options.sortBy, options.sortOrder]],
        });
    }
    static async getProjectById(id) {
        return project_model_1.Project.findOne({ where: { id } });
    }
    static async updateProject(id, data) {
        await project_model_1.Project.update(data, { where: { id } });
        return project_model_1.Project.findOne({ where: { id } });
    }
    static async deleteProject(id) {
        return project_model_1.Project.destroy({ where: { id } });
    }
}
exports.ProjectService = ProjectService;
