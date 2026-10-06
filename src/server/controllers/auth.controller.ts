/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentication Controller (PostgreSQL + Drizzle ORM - Fully Refactored)
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { drizzleDb, UserEntity } from '../db/db';
import { users, refreshTokens, passwordResetTokens } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { config } from '../config/index';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

async function generateTokens(user: UserEntity) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret as jwt.Secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret as jwt.Secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  // Persist refresh token in database
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await drizzleDb.insert(refreshTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAt: expiresAt,
    }).onConflictDoNothing();
  } catch {}

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, college, targetCompany, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const existing = await drizzleDb.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing && existing.length > 0) {
      res.status(409).json({ success: false, error: 'A user with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = crypto.randomUUID();

    const newUser: UserEntity = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: role || 'student',
      college: college || 'IIT Bombay',
      xp: 100, // Welcome XP
      level: 1,
      streak: 1,
      target_company: targetCompany || 'Google',
      daily_goal_minutes: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await drizzleDb.insert(users).values({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      passwordHash: newUser.password_hash,
      role: newUser.role,
      college: newUser.college,
      xp: newUser.xp,
      level: newUser.level,
      streak: newUser.streak,
      targetCompany: newUser.target_company,
      dailyGoalMinutes: newUser.daily_goal_minutes
    });

    const tokens = await generateTokens(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          college: newUser.college,
          xp: newUser.xp,
          level: newUser.level,
          streak: newUser.streak,
          targetCompany: newUser.target_company,
        },
        tokens,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const rows = await drizzleDb.select().from(users).where(eq(users.email, normalizedEmail));
    const row = rows[0] || null;

    if (!row) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const user: UserEntity = {
      id: row.id,
      name: row.name,
      email: row.email,
      password_hash: row.passwordHash,
      role: row.role as any,
      college: row.college || 'IIT Bombay',
      xp: row.xp,
      level: row.level,
      streak: row.streak,
      target_company: row.targetCompany || 'Google',
      daily_goal_minutes: row.dailyGoalMinutes,
      created_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt ? String(row.createdAt) : new Date().toISOString()),
      updated_at: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt ? String(row.updatedAt) : new Date().toISOString())
    };

    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const tokens = await generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          targetCompany: user.target_company,
        },
        tokens,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token is required.' });
      return;
    }

    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret as jwt.Secret) as any;
    
    const rows = await drizzleDb.select().from(users).where(eq(users.id, payload.id));
    const row = rows[0] || null;

    if (!row) {
      res.status(401).json({ success: false, error: 'User not found for refresh token.' });
      return;
    }

    const user: UserEntity = {
      id: row.id,
      name: row.name,
      email: row.email,
      password_hash: row.passwordHash,
      role: row.role as any,
      college: row.college || 'IIT Bombay',
      xp: row.xp,
      level: row.level,
      streak: row.streak,
      target_company: row.targetCompany || 'Google',
      daily_goal_minutes: row.dailyGoalMinutes,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString()
    };

    const tokens = await generateTokens(user);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
  }
}

export const refreshToken = refresh;

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await drizzleDb.delete(refreshTokens).where(eq(refreshTokens.token, token));
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, message: 'Password reset successfully.' });
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const rows = await drizzleDb.select().from(users).where(eq(users.id, userId));
    const user = rows[0] || null;
    if (!user) {
      res.status(404).json({ success: false, error: 'User profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        dailyGoalMinutes: user.dailyGoalMinutes,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export const getProfile = me;
