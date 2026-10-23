/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Security: Input Sanitization & XSS Defense Utilities
 */

/**
 * Escapes HTML control characters to prevent Cross-Site Scripting (XSS)
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:[^\s"'>]+/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips script tags and javascript: URIs while preserving safe markdown structure
 */
export function sanitizeMarkdown(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/javascript:[^"'\s)]+/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}
