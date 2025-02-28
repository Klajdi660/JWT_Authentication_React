import { RoleParams, EmailProvidersParams } from "../types";

export const ROLES: RoleParams = {
  Admin: "admin",
  User: "user",
  Guest: "guest",
  Merchant: "merchant",
};

export const EMAIL_PROVIDERS: EmailProvidersParams = {
  Email: "email",
  Google: "google",
  Facebook: "facebook",
};
