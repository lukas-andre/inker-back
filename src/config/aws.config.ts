import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type AWSConfig = {
  region: string;
  artistBucketName: string;
  bucketImageZipSize: number;
  accessKey: string;
  secretKey: string;
  cloudFrontUrl: string;
  smsAccessKey: string;
  smsSecretKey: string;
};

export const AWSConfig = registerAs<AWSConfig>('aws', () => ({
  region: 'us-east-1',
  artistBucketName: process.env.AWS_ARTISTS_BUCKET,
  bucketImageZipSize: 31457280, // 30 MB
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_ACCESS_SECRET,
  cloudFrontUrl: process.env.CLOUD_FRONT_URL,
  smsAccessKey: process.env.SMS_AWS_ACCESS_KEY,
  smsSecretKey: process.env.SMS_AWS_ACCESS_SECRET,
}));

export const AWSConfigSchema = Joi.object({
  AWS_ARTISTS_BUCKET: Joi.string().required(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_ACCESS_SECRET: Joi.string().required(),
  CLOUD_FRONT_URL: Joi.string().required(),
  SMS_AWS_ACCESS_KEY: Joi.string().required(),
  SMS_AWS_ACCESS_SECRET: Joi.string().required(),
});
