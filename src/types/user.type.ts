export interface NewUserTypes {
  id: number;
  email: string;
  username: string;
  fullname: string;
  password: string;
  otpCode: string;
  verified?: boolean;
  phoneNr: string;
}
