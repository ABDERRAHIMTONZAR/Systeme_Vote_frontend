// utils/decodeToken.js
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1]; // partie centrale
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}
