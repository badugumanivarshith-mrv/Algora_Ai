/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Request Payload Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';

export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required body fields: ${missing.join(', ')}`,
      });
      return;
    }
    next();
  };
}

export function validateEmail(req: Request, res: Response, next: NextFunction): void {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, error: 'Invalid email address format' });
    return;
  }

  next();
}
