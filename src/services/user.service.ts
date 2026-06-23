import { User, UserCreationAttributes } from '../models/user.model';

export class UserService {
  /**
   * Find a user by email
   */
  public static async getUserByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  /**
   * Find a user by primary key ID
   */
  public static async getUserById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Create a new user record in the database
   */
  public static async createUser(userData: UserCreationAttributes): Promise<User> {
    return User.create(userData);
  }
}
