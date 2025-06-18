import { boolean, object, string, TypeOf } from "zod";

const uppercaseRegex = /[A-Z]/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const sepecialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).regex(emailRegex, "Not a valid email"),
    username: string({
      required_error: "Username is required",
    })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 8 characters long" }),
    fullName: string({
      required_error: "Full Name is required",
    }),
    password: string({
      required_error: "Password is required",
    })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => sepecialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
  }),
});

export const loginUserSchema = object({
  body: object({
    identifier: string({
      required_error: "Username/Email is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
    remember: boolean().optional(),
    timezone: string().optional(),
  }),
});

export const verifyEmailSchema = object({
  body: object({
    code: string({
      required_error: "OTP code is required",
    }),
    email: string(),
  }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).regex(emailRegex, "Not a valid email"),
  }),
});

export const resetPasswordSchema = object({
  // params: object({
  //   email: string({
  //     required_error: "Email is required",
  //   }).regex(emailRegex, "Not a valid email"),
  //   hash: string({
  //     required_error: "Hash is required",
  //   }),
  // }),
  body: object({
    password: string({
      required_error: "Password is required",
    })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => sepecialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export const changeUsernameSchema = object({
  body: object({
    username: string({
      required_error: "Username is required",
    })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 8 characters long" }),
  }),
});

export const changePasswordSchema = object({
  body: object({
    currentPassword: string({
      required_error: "Password is required",
    }),
    newPassword: string({
      required_error: "Password is required",
    })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => sepecialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmNewPassword: string({
      required_error: "Enter new password again",
    }),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  }),
});

export const deleteAccountSchema = object({
  body: object({
    confirmDelete: string({
      required_error: "confirmDelete is required",
    }),
  }),
});

// export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>["body"];
export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type VerifyEmailInput = TypeOf<typeof verifyEmailSchema>["body"];
export type DeleteAccountInput = TypeOf<typeof deleteAccountSchema>["body"];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>["body"];
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];
export type ChangeUsernameInput = TypeOf<typeof changeUsernameSchema>["body"];
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>["body"];
