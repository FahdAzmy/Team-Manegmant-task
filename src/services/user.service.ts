import { User, UserCreationAttributes } from '../models/user.model';

export class UserService {
  /**
   * Find a user by email
   */
  public static async getUserByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  /**
   * Find a user by ID
   */
  public static async getUserById(id: string): Promise<User | null> {
    return User.findOne({ where: { id } });
  }

  /**
   * Create a new user record in the database
   */
  public static async createUser(userData: UserCreationAttributes): Promise<User> {
    return User.create(userData);
  }

  /**
   * Update the user's refresh token
   */
  public static async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await User.update({ refreshToken }, { where: { id: userId } });
  }
}
