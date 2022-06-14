import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { AWSConfig } from './aws.config';
import { oasConfig } from './oas.config';
import { verificationHashConf } from './verificationHash';
import { databaseConfigs } from './database/config';

export const Config = [
  appConfig,
  authConfig,
  AWSConfig,
  verificationHashConf,
  oasConfig,
  ...databaseConfigs,
];
