export interface NewUserParams {
  id: number;
  email?: string;
  mobile?: string;
  username: string;
  fullName: string;
  password: string;
  otpCode?: string;
  expiredCodeAt?: any;
}
