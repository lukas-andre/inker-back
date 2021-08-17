import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: 'us-east-1',
  artistBucketName: process.env.AWS_ARTISTS_BUCKET,
  bucketImageZipSize: 31457280, // 30 MB
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_ACCESS_SECRET,
  cloudFrontUrl: process.env.CLOUD_FRONT_URL,
  smsAccessKey: process.env.SMS_AWS_ACCESS_KEY,
  smsSecretKey: process.env.SMS_AWS_ACCESS_SECRET,
}));
