import { vi } from 'vitest';

export const mockUser = {
  id: 'user_test_123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'learner' as const,
  stripeCustomerId: null as string | null,
  clerkId: 'clerk_test_123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminUser = {
  ...mockUser,
  id: 'admin_test_123',
  email: 'admin@example.com',
  role: 'admin' as const,
};

export const mockRequireCurrentUser = vi.fn().mockResolvedValue(mockUser);
export const mockRequireAdmin = vi.fn().mockResolvedValue(mockAdminUser);

export function setupMockAuth() {
  mockRequireCurrentUser.mockReset().mockResolvedValue(mockUser);
  mockRequireAdmin.mockReset().mockResolvedValue(mockAdminUser);
}
