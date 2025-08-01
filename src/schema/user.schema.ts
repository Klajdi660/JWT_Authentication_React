import { object, string, TypeOf } from "zod";

const uppercaseRegex = /[A-Z]/;
const phoneRegex = /^\+?[0-9]{7,15}$/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createUserSchema = object({
  body: object({
    email: string({ required_error: "Email or phone number is required" })
      .regex(emailRegex, "Not a valid email")
      .or(string().length(0)),
    phoneNr: string({ required_error: "Email or phone number is required" })
      .regex(phoneRegex, "Not a valid phone number")
      .or(string().length(0)),
    username: string({ required_error: "Username is required" })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 6 characters long" }),
    fullname: string({ required_error: "Fullname is required" }),
    password: string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => specialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
  }).refine(
    (data) => {
      const { email, phoneNr } = data;
      const hasEmail = email.length > 0 && emailRegex.test(email);
      const hasPhoneNr = phoneNr.length > 0 && phoneRegex.test(phoneNr);
      return hasEmail || hasPhoneNr;
    },
    {
      message: "Either email or phone number must be provided",
      path: ["email"],
    }
  ),
});

export const verifyUserSchema = object({
  body: object({
    code: string({ required_error: "OTP code is required" }),
    username: string({ required_error: "Username is required" }),
  }),
});

export const verifyCodeSchema = object({
  body: object({
    code: string({ required_error: "OTP code is required" }),
    username: string({ required_error: "Username is required" }),
    action: string({ required_error: "Action is required" }),
  }),
});

export const resetPasswordSchema = object({
  body: object({
    username: string({ required_error: "Username is required" }),
    password: string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => specialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const changeUsernameSchema = object({
  body: object({
    username: string({ required_error: "Username is required" })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 8 characters long" }),
  }),
});

export const changePasswordSchema = object({
  body: object({
    currentPassword: string({ required_error: "Password is required" }),
    newPassword: string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => specialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmNewPassword: string({ required_error: "Enter new password again" }),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  }),
});

export const deleteAccountSchema = object({
  body: object({
    confirmDelete: string({ required_error: "confirmDelete is required" }),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type VerifyUserInput = TypeOf<typeof verifyUserSchema>["body"];
export type VerifyCodeInput = TypeOf<typeof verifyCodeSchema>["body"];
export type DeleteAccountInput = TypeOf<typeof deleteAccountSchema>["body"];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>["body"];
export type ChangeUsernameInput = TypeOf<typeof changeUsernameSchema>["body"];
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>["body"];
