import { User } from "../types";

// Mock authentication functions - replace with real implementation
export const authenticateWithGoogle = async (): Promise<User> => {
  // Simulate Google authentication
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser: User = {
        id: "user-123",
        name: "John Doe",
        email: "john.doe@company.com",
        role: "tenant_admin", // or 'super_admin' based on email domain
      };
      resolve(mockUser);
    }, 1000);
  });
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const saveUser = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("authToken", "mock-token");
};

export const isValidEmailDomain = (email: string): boolean => {
  // Check if email is from a valid organization domain
  const validDomains = ["@company.com", "@university.edu", "@organization.org"];
  return validDomains.some((domain) => email.endsWith(domain));
};

export const getUserRole = (email: string): User["role"] => {
  // Super admin logic - could be based on specific emails or domains
  const superAdminEmails = ["admin@mapease.com", "superadmin@mapease.com"];
  if (superAdminEmails.includes(email)) {
    return "super_admin";
  }

  if (isValidEmailDomain(email)) {
    return "tenant_admin";
  }

  return "user";
};
