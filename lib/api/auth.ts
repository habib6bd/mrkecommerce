import { AuthTokens, User } from "@/types/user";
import { apiRequest } from "./client";
import { mapUser } from "./mappers";

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}): Promise<User> {
  const data = await apiRequest<unknown>("/auth/register/", {
    method: "POST",
    body: input,
  });
  return mapUser(data);
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>("/auth/login/", {
    method: "POST",
    body: { email, password },
  });
}

export async function refreshAccessToken(refresh: string): Promise<{ access: string }> {
  return apiRequest<{ access: string }>("/auth/refresh/", {
    method: "POST",
    body: { refresh },
  });
}

export async function getMe(token: string): Promise<User> {
  const data = await apiRequest<unknown>("/auth/me/", { token });
  return mapUser(data);
}

export async function updateProfile(
  token: string,
  input: { name?: string; phone?: string }
): Promise<User> {
  const data = await apiRequest<unknown>("/auth/me/", {
    method: "PATCH",
    token,
    body: input,
  });
  return mapUser(data);
}
