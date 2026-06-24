"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const task_model_1 = require("../models/task.model");
class TaskService {
    static async createTask(data) {
        return task_model_1.Task.create(data);
    }
    static async getProjectTasks(projectId, options) {
        const where = { projectId };
        if (options.status)
            where['status'] = options.status;
        if (options.priority)
            where['priority'] = options.priority;
        return task_model_1.Task.findAndCountAll({
            where,
            limit: options.limit,
            offset: options.offset,
            order: [[options.sortBy, options.sortOrder]],
        });
    }
    static async getTaskById(id) {
        return task_model_1.Task.findOne({ where: { id } });
    }
    static async getTaskByIdAndProject(id, projectId) {
        return task_model_1.Task.findOne({ where: { id, projectId } });
    }
    static async updateTask(id, data) {
        await task_model_1.Task.update(data, { where: { id } });
        return task_model_1.Task.findOne({ where: { id } });
    }
    static async deleteTask(id) {
        return task_model_1.Task.destroy({ where: { id } });
    }
}
exports.TaskService = TaskService;
