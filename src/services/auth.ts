import { useAuthStore } from '../store/authStore';
export async function loginEmailPassword(email: string, password: string) {
  // Mock login - will be replaced with real Firebase Auth in dev build
  const mockUser = { uid: 'mock-uid-123', email, displayName: email.split('@')[0] };
  useAuthStore.getState().setUser(mockUser as any);
  return mockUser;
}
export async function signupEmailPassword(name: string, email: string, password: string) {
  // Mock signup - will be replaced with real Firebase Auth in dev build
  const mockUser = { uid: 'mock-uid-123', email, displayName: name };
  useAuthStore.getState().setUser(mockUser as any);
  return mockUser;
}
export async function logoutUser() {
  useAuthStore.getState().setUser(null);
}

