import { Request, Response, NextFunction } from "express";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email" | "array" | "object";
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (val: unknown) => boolean | string;
}

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];
    const body = req.body || {};

    for (const rule of rules) {
      const val = body[rule.field];

      if (rule.required && (val === undefined || val === null || val === "")) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      if (val !== undefined && val !== null && val !== "") {
        if (rule.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof val !== "string" || !emailRegex.test(val)) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid email address` });
          }
        } else if (rule.type && typeof val !== rule.type) {
          if (rule.type === "array" && !Array.isArray(val)) {
            errors.push({ field: rule.field, message: `${rule.field} must be an array` });
          } else if (rule.type !== "array") {
            errors.push({ field: rule.field, message: `${rule.field} must be of type ${rule.type}` });
          }
        }

        if (rule.minLength !== undefined && typeof val === "string" && val.length < rule.minLength) {
          errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.minLength} characters` });
        }

        if (rule.maxLength !== undefined && typeof val === "string" && val.length > rule.maxLength) {
          errors.push({ field: rule.field, message: `${rule.field} must not exceed ${rule.maxLength} characters` });
        }

        if (rule.pattern && typeof val === "string" && !rule.pattern.test(val)) {
          errors.push({ field: rule.field, message: `${rule.field} format is invalid` });
        }

        if (rule.custom) {
          const customResult = rule.custom(val);
          if (customResult !== true) {
            errors.push({
              field: rule.field,
              message: typeof customResult === "string" ? customResult : `${rule.field} is invalid`,
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request payload failed validation",
          details: errors,
        },
      });
      return;
    }

    next();
  };
}
