import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { AWSConfig } from './aws.config';
import { databaseConfigs } from './database/config';
import { oasConfig } from './oas.config';
import { runwareConfig } from './runware.config';
import { sendGridConfig } from './sendgrid.config';
import { verificationHashConf } from './verificationHash';

export const config = [
  appConfig,
  authConfig,
  AWSConfig,
  verificationHashConf,
  oasConfig,
  runwareConfig,
  sendGridConfig,
  ...databaseConfigs,
];
