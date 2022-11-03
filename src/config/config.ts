import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { AWSConfig } from './aws.config';
import { databaseConfigs } from './database/config';
import { oasConfig } from './oas.config';
import { verificationHashConf } from './verificationHash';

export const Config = [
  appConfig,
  authConfig,
  AWSConfig,
  verificationHashConf,
  oasConfig,
  ...databaseConfigs,
];
