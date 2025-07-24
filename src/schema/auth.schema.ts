import { object, string, TypeOf } from "zod";

const phoneRegex = /^\+?[0-9]{7,15}$/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email, phone number or username is required",
    })
      .regex(emailRegex, "Not a valid email")
      .or(string().length(0)),
    phoneNr: string({
      required_error: "Email, phone number or username is required",
    })
      .regex(phoneRegex, "Not a valid phone number")
      .or(string().length(0)),
    username: string({ required_error: "Username is required" })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 6 characters long" })
      .or(string().length(0)),
    password: string({ required_error: "Password is required" }),
  }).refine(
    (data) => {
      const { email, phoneNr, username } = data;

      const hasEmail = email.length > 0 && emailRegex.test(email);
      const hasPhoneNr = phoneNr.length > 0 && phoneRegex.test(phoneNr);
      const hasUsername = username.length > 0 && usernameRegex.test(username);

      return hasEmail || hasPhoneNr || hasUsername;
    },
    {
      message: "Either email, phone number or username must be provided",
      path: ["email"],
    }
  ),
});

export const loginHelpSchema = object({
  body: object({
    action: string({ required_error: "Action is required" }),
    email: string({ required_error: "Email is required" })
      .regex(emailRegex, "Not a valid email")
      .or(string().length(0)),
    phoneNr: string({ required_error: "Phone number is required" })
      .regex(phoneRegex, "Not a valid phone number")
      .or(string().length(0)),
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

export type LoginUserInput = TypeOf<typeof loginUserSchema>["body"];
export type LoginHelpInput = TypeOf<typeof loginHelpSchema>["body"];
