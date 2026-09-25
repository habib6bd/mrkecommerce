export type Address = {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  addresses: Address[];
  dateJoined: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};
