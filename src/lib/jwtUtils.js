export function decodeJWT(token) {
  try {
    const cleanToken = token.replace(/^Bearer\s+/, '');
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload);

    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

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

export function extractNPPFromToken(token) {
  const payload = decodeJWT(token);
  return payload?.npp || null;
}