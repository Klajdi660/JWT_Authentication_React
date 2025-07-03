export interface NewUserTypes {
  id: number;
  email: string;
  phoneNumber: string;
  username: string;
  fullname: string;
  password: string;
  verified: boolean;
  otpCode?: string;
  expiredCodeAt?: any;
}
