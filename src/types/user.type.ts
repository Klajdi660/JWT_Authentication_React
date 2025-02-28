export interface UserParams {
  id: number;
  email: string;
  username: string;
  fullName: string;
  password: string;
  otpCode?: string;
  expiredCodeAt?: any;
  passwordConfirm: string;
}
