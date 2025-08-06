// Token refresh utility service
import axios from 'axios';

class TokenService {
  private static instance: TokenService;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  // Get token from storage (check both localStorage and sessionStorage)
  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Get refresh token from storage
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  }

  // Get user ID from storage
  getUserId(): string | null {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
  }

  // Check if token is expired or about to expire
  isTokenExpired(): boolean {
    const tokenExpiry = localStorage.getItem('tokenExpiry') || sessionStorage.getItem('tokenExpiry');
    if (!tokenExpiry) {
      // If no expiry is stored, assume token is still valid (for backward compatibility)
      return false;
    }
    
    const expiryTime = parseInt(tokenExpiry);
    const currentTime = Date.now();
    
    // Consider token expired if it expires in the next 5 minutes
    return currentTime >= (expiryTime - 5 * 60 * 1000);
  }

  // Refresh access token using refresh token
  async refreshToken(): Promise<string | null> {
    // If refresh is already in progress, return the same promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      // No refresh token available, user needs to login again
      console.log('No refresh token available');
      return null;
    }

    this.refreshPromise = this.performRefresh(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.refreshPromise = null;
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  private async performRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        refreshToken
      });

      const { token, expiresIn } = response.data;
      
      // Determine which storage to use based on where the refresh token was stored
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
      
      // Update stored token and expiry
      storage.setItem('token', token);
      storage.setItem('tokenExpiry', (Date.now() + expiresIn * 1000).toString());
      
      return token;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  // Logout and clear all tokens
  logout(): void {
    const userId = this.getUserId();
    const refreshToken = this.getRefreshToken();

    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('profileCompleted');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profileCompleted');

    // Notify backend to invalidate refresh token
    if (userId && refreshToken) {
      axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        userId,
        refreshToken
      }).catch(() => {
        // Ignore errors during logout cleanup
      });
    }

    // Redirect to login page
    window.location.href = '/login';
  }

  // Get valid token (refresh if needed)
  async getValidToken(): Promise<string | null> {
    try {
      let token = this.getToken();
      
      if (!token) {
        return null;
      }

      // Only attempt refresh if we have token expiry info and it's expired
      const tokenExpiry = localStorage.getItem('tokenExpiry') || sessionStorage.getItem('tokenExpiry');
      if (tokenExpiry && this.isTokenExpired()) {
        token = await this.refreshToken();
      }

      return token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }
}

export default TokenService.getInstance();
