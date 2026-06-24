import { Task, TaskCreationAttributes, TaskAttributes } from '../models/task.model';
import { WhereOptions } from 'sequelize';

interface TaskQueryOptions {
  status?: string;
  priority?: string;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export class TaskService {
  public static async createTask(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    projectId: string;
  }): Promise<Task> {
    return Task.create(data as TaskCreationAttributes);
  }

  public static async getProjectTasks(
    projectId: string,
    options: TaskQueryOptions
  ): Promise<{ rows: Task[]; count: number }> {
    const where: WhereOptions = { projectId };
    if (options.status) where['status'] = options.status;
    if (options.priority) where['priority'] = options.priority;

    return Task.findAndCountAll({
      where,
      limit: options.limit,
      offset: options.offset,
      order: [[options.sortBy, options.sortOrder]],
    });
  }

  public static async getTaskById(id: string): Promise<Task | null> {
    return Task.findOne({ where: { id } });
  }

  public static async getTaskByIdAndProject(id: string, projectId: string): Promise<Task | null> {
    return Task.findOne({ where: { id, projectId } });
  }

  public static async updateTask(
    id: string,
    data: Partial<TaskAttributes>
  ): Promise<Task | null> {
    await Task.update(data, { where: { id } });
    return Task.findOne({ where: { id } });
  }

  public static async deleteTask(id: string): Promise<number> {
    return Task.destroy({ where: { id } });
  }
}
