export interface ContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
  userType: 'artist' | 'customer' | 'other';
  messageType: 'suggestion' | 'bug_report' | 'general_inquiry' | 'feature_request' | 'other';
}