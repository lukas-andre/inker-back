export interface BetaSignupDto {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  userType: 'artist' | 'customer';
}