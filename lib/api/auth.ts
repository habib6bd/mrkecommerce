import { Address, AuthTokens, User } from "@/types/user";
import { apiRequest } from "./client";
import { mapAddress, mapUser } from "./mappers";

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

export async function logoutRequest(token: string, refresh: string): Promise<void> {
  await apiRequest<void>("/auth/logout/", {
    method: "POST",
    token,
    body: { refresh },
  });
}

export async function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>("/auth/password-reset/", {
    method: "POST",
    body: { email },
  });
}

export async function confirmPasswordReset(input: {
  uid: string;
  token: string;
  newPassword: string;
}): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>("/auth/password-reset/confirm/", {
    method: "POST",
    body: { uid: input.uid, token: input.token, new_password: input.newPassword },
  });
}

export type AddressInput = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

function toAddressPayload(input: Partial<AddressInput>) {
  const body: Record<string, unknown> = {};
  if (input.fullName !== undefined) body.full_name = input.fullName;
  if (input.phone !== undefined) body.phone = input.phone;
  if (input.line1 !== undefined) body.line1 = input.line1;
  if (input.line2 !== undefined) body.line2 = input.line2;
  if (input.city !== undefined) body.city = input.city;
  if (input.state !== undefined) body.state = input.state;
  if (input.postalCode !== undefined) body.postal_code = input.postalCode;
  if (input.country !== undefined) body.country = input.country;
  if (input.isDefault !== undefined) body.is_default = input.isDefault;
  return body;
}

export async function listAddresses(token: string): Promise<Address[]> {
  const data = await apiRequest<unknown[]>("/auth/addresses/", { token });
  return data.map(mapAddress);
}

export async function createAddress(token: string, input: AddressInput): Promise<Address> {
  const data = await apiRequest<unknown>("/auth/addresses/", {
    method: "POST",
    token,
    body: toAddressPayload(input),
  });
  return mapAddress(data);
}

export async function updateAddress(
  token: string,
  id: number,
  input: Partial<AddressInput>
): Promise<Address> {
  const data = await apiRequest<unknown>(`/auth/addresses/${id}/`, {
    method: "PATCH",
    token,
    body: toAddressPayload(input),
  });
  return mapAddress(data);
}

export async function deleteAddress(token: string, id: number): Promise<void> {
  await apiRequest<void>(`/auth/addresses/${id}/`, {
    method: "DELETE",
    token,
  });
}
