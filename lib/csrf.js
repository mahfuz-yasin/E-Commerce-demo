/**
 * CSRF Protection utilities
 */

import { cookies } from 'next/headers'

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  return crypto.randomUUID()
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
export function validateCSRFToken(token) {
  const cookieStore = cookies()
  const storedToken = cookieStore.get('csrf_token')
  
  if (!storedToken || !token) {
    return false
  }
  
  return token === storedToken.value
}

/**
 * Set CSRF token in cookie
 * @param {string} token - CSRF token
 */
export function setCSRFCookie(token) {
  const cookieStore = cookies()
  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1 hour
  })
}
