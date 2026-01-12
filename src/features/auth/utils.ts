import { AUTH_KEY } from "./constants";

export function getStoredUser(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function setStoredUser(user: string | null): void {
  if (user) {
    localStorage.setItem(AUTH_KEY, user);
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

