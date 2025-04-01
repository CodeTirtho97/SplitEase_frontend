import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Validates a token with Redis session store
 * @param token JWT token to validate
 * @returns Promise resolving to boolean indicating if token is valid
 */
export const validateTokenWithRedis = async (token: string): Promise<boolean> => {
  try {
    // Call the validate endpoint (you need to implement this on your backend)
    const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data?.valid === true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

/**
 * Extends the current user session in Redis
 * @param token JWT token
 * @returns Promise resolving to boolean indicating success
 */
export const extendSession = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/extend-session`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data?.success === true;
  } catch (error) {
    console.error("Error extending session:", error);
    return false;
  }
};

/**
 * Gets the session status including expiry time
 * @param token JWT token
 * @returns Session status information
 */
export const getSessionStatus = async (token: string): Promise<{
  valid: boolean;
  expiresIn?: number; // seconds until expiry
  lastActivity?: string; // ISO date string
}> => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/session-status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching session status:", error);
    return { valid: false };
  }
};