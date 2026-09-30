/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentication Controller (PostgreSQL + Drizzle ORM)
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db, drizzleDb, UserEntity } from '../db/db';
import { users, refreshTokens, passwordResetTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { config } from '../config/index';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

function generateTokens(user: UserEntity) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  // Persist refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.refreshTokens.set(refreshToken, {
    id: 'rt_' + crypto.randomUUID(),
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, college, targetCompany } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Query PostgreSQL first
  try {
    const existing = await drizzleDb.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing && existing.length > 0) {
      res.status(409).json({ success: false, error: 'A user with this email already exists.' });
      return;
    }
  } catch {
    if (db.users.has(normalizedEmail)) {
      res.status(409).json({ success: false, error: 'A user with this email already exists.' });
      return;
    }
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = 'usr_' + crypto.randomUUID();

  const newUser: UserEntity = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: 'student',
    college: college || 'IIT Bombay',
    xp: 100, // Welcome XP
    level: 1,
    streak: 1,
    target_company: targetCompany || 'Google',
    daily_goal_minutes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Sync with PostgreSQL
  try {
    await drizzleDb.insert(users).values({
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
  } catch (err) {
    // Fallback sync
  }

  db.users.set(newUser.id, newUser);
  db.users.set(newUser.email, newUser);

  const tokens = generateTokens(newUser);

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
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = db.users.get(normalizedEmail);

  if (!user) {
    try {
      const rows = await drizzleDb.select().from(users).where(eq(users.email, normalizedEmail));
      if (rows && rows.length > 0) {
        const row = rows[0];
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          password_hash: row.passwordHash,
          role: row.role as any,
          college: row.college || 'IIT Bombay',
          xp: row.xp,
          level: row.level,
          streak: row.streak,
          target_company: row.targetCompany,
          daily_goal_minutes: row.dailyGoalMinutes,
          created_at: row.createdAt.toISOString(),
          updated_at: row.updatedAt.toISOString()
        };
      }
    } catch {}
  }

  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const tokens = generateTokens(user);

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
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ success: false, error: 'Refresh token is required.' });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    const user = db.users.get(payload.id);

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found for refresh token.' });
      return;
    }

    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const user = db.users.get(userId);
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
      targetCompany: user.target_company,
      dailyGoalMinutes: user.daily_goal_minutes,
      createdAt: user.created_at,
    },
  });
}
