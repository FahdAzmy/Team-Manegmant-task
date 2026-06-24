import { Project, ProjectCreationAttributes, ProjectAttributes } from '../models/project.model';

interface ProjectQueryOptions {
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export class ProjectService {
  public static async createProject(data: {
    title: string;
    description?: string;
    status?: string;
    ownerId: string;
  }): Promise<Project> {
    return Project.create(data as ProjectCreationAttributes);
  }

  public static async getUserProjects(
    userId: string,
    options: ProjectQueryOptions
  ): Promise<{ rows: Project[]; count: number }> {
    return Project.findAndCountAll({
      where: { ownerId: userId },
      limit: options.limit,
      offset: options.offset,
      order: [[options.sortBy, options.sortOrder]],
    });
  }

  public static async getAllProjects(
    options: ProjectQueryOptions
  ): Promise<{ rows: Project[]; count: number }> {
    return Project.findAndCountAll({
      limit: options.limit,
      offset: options.offset,
      order: [[options.sortBy, options.sortOrder]],
    });
  }

  public static async getProjectById(id: string): Promise<Project | null> {
    return Project.findOne({ where: { id } });
  }

  public static async updateProject(
    id: string,
    data: Partial<ProjectAttributes>
  ): Promise<Project | null> {
    await Project.update(data, { where: { id } });
    return Project.findOne({ where: { id } });
  }

  public static async deleteProject(id: string): Promise<number> {
    return Project.destroy({ where: { id } });
  }
}
