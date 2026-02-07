import { create } from "zustand";
import { User, Agent, Client } from "@/types";

interface AuthState {
  user: User | null;
  agent: Agent | null;
  client: Client | null;
  token: string | null;
  login: (email: string, password: string, role: "agent" | "client") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  agent: null,
  client: null,
  token: null,

  login: (email: string, password: string, role: "agent" | "client") => {
    // Mock authentication
    if (email && password) {
      // Simulate successful login
      const mockUser: User = {
        id: `${role}-1`,
        email,
        role,
        createdAt: new Date(),
      };
      set({
        user: mockUser,
        token: "mock-jwt-token",
      });
    }
  },

  logout: () => {
    set({
      user: null,
      agent: null,
      client: null,
      token: null,
    });
  },
}));
