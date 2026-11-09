import { BaseRepository } from './base.repository';
import { WORKSHEETS } from '../services/google-sheets/googleSheetsConfig';
import type { User } from '../services/google-sheets/googleSheetsTypes';
import { generateSalt, hashPassword, verifyPassword } from '../services/google-sheets/googleSheetsHelpers';

export class UsersRepository extends BaseRepository<User> {
  constructor() {
    super(WORKSHEETS.USERS);
  }

  /**
   * Find a user by their email address.
   */
  public async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const matches = await this.findWhere(
      (u) => u.email.trim().toLowerCase() === normalized
    );
    return matches[0] || null;
  }

  /**
   * Create a user with salted password hashing (never plaintext).
   */
  public async createUserWithPassword(
    data: Omit<Partial<User>, 'password_hash' | 'salt'>,
    plainPassword?: string
  ): Promise<User> {
    const salt = generateSalt();
    const passwordHash = plainPassword ? await hashPassword(plainPassword, salt) : '';

    return await this.create({
      ...data,
      email: data.email?.trim().toLowerCase() || '',
      password_hash: passwordHash,
      salt: salt,
      status: data.status || 'active',
      avatar_url: data.avatar_url || '',
      name: data.name || '',
    });
  }

  /**
   * Verify email and password credentials securely.
   */
  public async verifyCredentials(email: string, plainPassword: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.password_hash || !user.salt) {
      return null;
    }

    const isValid = await verifyPassword(plainPassword, user.salt, user.password_hash);
    return isValid ? user : null;
  }

  /**
   * Replace a user's password hash after Google Sheets access is granted.
   */
  public async updatePassword(email: string, plainPassword: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const salt = generateSalt();
    const passwordHash = await hashPassword(plainPassword, salt);
    return await this.update(user.id, {
      salt,
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    });
  }
}

export const usersRepository = new UsersRepository();

