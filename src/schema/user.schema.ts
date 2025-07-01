import { boolean, object, string, TypeOf } from "zod";

const uppercaseRegex = /[A-Z]/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;

export const createUserSchema = object({
  body: object({
    email: string({
      required_error: "Email or phone number is required",
    })
      .regex(emailRegex, "Not a valid email")
      .or(string().length(0)),

    mobile: string({
      required_error: "Email or phone number is required",
    })
      .regex(phoneRegex, "Not a valid phone number")
      .or(string().length(0)),

    username: string({
      required_error: "Username is required",
    })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 6 characters long" }),

    fullname: string({
      required_error: "Full Name is required",
    }),

    password: string({
      required_error: "Password is required",
    })
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine((value) => uppercaseRegex.test(value), {
        message: "Password must contain at least one capital letter",
      })
      .refine((value) => specialCharacterRegex.test(value), {
        message: "Password must contain at least one special character",
      }),
  }).refine(
    (data) => {
      const hasEmail = data.email.length > 0 && emailRegex.test(data.email);
      const hasPhone = data.mobile.length > 0 && phoneRegex.test(data.mobile);
      return hasEmail || hasPhone;
    },
    {
      message: "Either email or phone number must be provided",
      path: ["email"],
    }
  ),
});

// export const createUserSchema = object({
//   body: object({
//     email: string({
//       required_error: "Email is required",
//     }).regex(emailRegex, "Not a valid email"),
//     username: string({
//       required_error: "Username is required",
//     })
//       .regex(usernameRegex, "Username should only contain letters and numbers")
//       .min(6, { message: "Username must be at least 8 characters long" }),
//     fullName: string({
//       required_error: "Full Name is required",
//     }),
//     password: string({
//       required_error: "Password is required",
//     })
//       .min(8, { message: "Password must be at least 8 characters long" })
//       .refine((value) => uppercaseRegex.test(value), {
//         message: "Password must contain at least one capital letter",
//       })
//       .refine((value) => sepecialCharacterRegex.test(value), {
//         message: "Password must contain at least one special character",
//       }),
//   }),
// });

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email, phone number or username is required",
    })
      .regex(emailRegex, "Not a valid email")
      .or(string().length(0)),
    mobile: string({
      required_error: "Email, phone number or username is required",
    })
      .regex(phoneRegex, "Not a valid phone number")
      .or(string().length(0)),
    username: string({
      required_error: "Username is required",
    })
      .regex(usernameRegex, "Username should only contain letters and numbers")
      .min(6, { message: "Username must be at least 6 characters long" })
      .or(string().length(0)),
    password: string({
      required_error: "Password is required",
    }),
    remember: boolean().optional(),
    timezone: string().optional(),
  }).refine(
    (data) => {
      const { email, mobile, username } = data;

      const hasEmail = email.length > 0 && emailRegex.test(email);
      const hasPhone = mobile.length > 0 && phoneRegex.test(mobile);
      const hasUsername = username.length > 0 && usernameRegex.test(username);

      return hasEmail || hasPhone || hasUsername;
    },
    {
      message: "Either email, phone number or username must be provided",
      path: ["email"],
    }
  ),
});

export const registerConfirmSchema = object({
  body: object({
    code: string({
      required_error: "OTP code is required",
    }),
    username: string(),
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
      .refine((value) => specialCharacterRegex.test(value), {
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
      .refine((value) => specialCharacterRegex.test(value), {
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
export type RegisterConfirmInput = TypeOf<typeof registerConfirmSchema>["body"];
export type DeleteAccountInput = TypeOf<typeof deleteAccountSchema>["body"];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>["body"];
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];
export type ChangeUsernameInput = TypeOf<typeof changeUsernameSchema>["body"];
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>["body"];
