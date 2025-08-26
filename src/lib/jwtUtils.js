// src/lib/jwtUtils.js
/**
 * Simple JWT decoder utility
 * Decodes JWT payload without verification (client-side only)
 */

export function decodeJWT(token) {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extract NPP from JWT token
 */
export function extractNPPFromToken(token) {
  const payload = decodeJWT(token);
  return payload?.npp || null;
}

/**
 * Extract user info from JWT token
 */
export function extractUserFromToken(token) {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    npp: payload.npp,
    email: payload.email,
    role: payload.role,
    role_id: payload.role_id,
    role_code: payload.role_code,
    division_id: payload.division_id,
    division_code: payload.division_code,
    ...payload // include any other fields
  };
}