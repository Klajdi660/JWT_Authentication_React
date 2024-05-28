export interface UserParams {
  id: number;
  email: string;
  username: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
  otpCode?: string;
  expiredCodeAt?: any;
}
