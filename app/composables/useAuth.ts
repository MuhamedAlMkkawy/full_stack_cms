import { ref, computed } from 'vue';
import { googleSheetsAuth, GoogleClientIdError } from '../services/google-sheets/googleSheetsAuth';
import { usersRepository } from '../repositories/users.repository';
import { organizationsRepository } from '../repositories/organizations.repository';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../services/google-sheets/googleSheetsTypes';

export function useAuth() {
  const authStore = useAuthStore();
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => {
    return Boolean(authStore.user?.token);
  });

  const requireGoogleClientId = () => {
    if (!googleSheetsAuth.isValidClientId(googleSheetsAuth.getClientId())) {
      throw new GoogleClientIdError();
    }
  };

  /**
   * Log in using email and password against the Google Sheets Users table.
   */
  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      requireGoogleClientId();
      await googleSheetsAuth.requestAccessToken(false);

      // 1. Verify user in Google Sheets Users worksheet
      let user = await usersRepository.verifyCredentials(email, password);

      // If no users exist in the sheet yet, auto-seed the first admin user
      if (!user) {
        const allUsers = await usersRepository.findAll();
        if (allUsers.length === 0) {
          user = await usersRepository.createUserWithPassword(
            {
              email: email.trim().toLowerCase(),
              name: 'Admin User',
              status: 'active',
            },
            password
          );
        }
      }

      if (!user) {
        error.value = 'Invalid email or password';
        return false;
      }

      // 2. Fetch or seed default organization
      const orgs = await organizationsRepository.getUserOrganizations(user.id);
      let role = 'admin';
      if (orgs.length > 0) {
        role = orgs[0].role;
      }

      currentUser.value = user;
      authStore.handleUserData({
        token: user.id,
        role: role,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });

      return true;
    } catch (err: any) {
      error.value = err?.message || 'Login failed';
      console.error('[useAuth] Login error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Register a new user in the Google Sheets Users worksheet.
   */
  const registerWithCredentials = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      requireGoogleClientId();
      await googleSheetsAuth.requestAccessToken(false);

      const existing = await usersRepository.findByEmail(email);
      if (existing) {
        error.value = 'An account with this email already exists';
        return false;
      }

      const user = await usersRepository.createUserWithPassword(
        {
          email: email.trim().toLowerCase(),
          name: name.trim() || email.split('@')[0],
          status: 'active',
        },
        password
      );

      currentUser.value = user;
      authStore.handleUserData({
        token: user.id,
        role: 'admin',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
      return true;
    } catch (err: any) {
      error.value = err?.message || 'Registration failed';
      console.error('[useAuth] Register error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      requireGoogleClientId();
      await googleSheetsAuth.requestAccessToken(false);

      const updated = await usersRepository.updatePassword(email, newPassword);
      if (!updated) {
        error.value = 'No account found for this email';
        return false;
      }
      return true;
    } catch (err: any) {
      error.value = err?.message || 'Password reset failed';
      console.error('[useAuth] Password reset error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      requireGoogleClientId();
      const accessToken = await googleSheetsAuth.requestAccessToken(true);
      if (!accessToken) {
        error.value = 'Google sign-in was canceled or failed';
        return false;
      }

      // Fetch Google User Profile
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoRes.ok) {
        throw new Error('Failed to fetch Google profile');
      }

      const googleProfile = await userInfoRes.json();
      const email = googleProfile.email;

      let user = await usersRepository.findByEmail(email);
      if (!user) {
        // Auto-register new Google user
        user = await usersRepository.createUserWithPassword({
          email,
          name: googleProfile.name || email.split('@')[0],
          avatar_url: googleProfile.picture || '',
          status: 'active',
        });
      }

      currentUser.value = user;
      authStore.handleUserData({
        token: accessToken,
        role: 'admin',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });

      return true;
    } catch (err: any) {
      error.value = err?.message || 'Google authentication failed';
      console.error('[useAuth] Google login error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Log out and clear tokens.
   */
  const logout = async () => {
    googleSheetsAuth.clearAccessToken();
    authStore.handleUserData({ token: null, role: null });
    useCookie('authStore').value = null;
    currentUser.value = null;
  };

  return {
    currentUser,
    loading,
    error,
    isAuthenticated,
    loginWithCredentials,
    registerWithCredentials,
    resetPassword,
    loginWithGoogle,
    logout,
  };
}

