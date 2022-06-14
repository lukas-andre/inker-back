import { registerAs } from '@nestjs/config';

type OASConfig = {
  enabled: boolean;
  path: string;
};

export const oasConfig = registerAs<OASConfig>('oas', () => ({
  enabled: true,
  path: process.env.OAS_PATH || 'oas',
}));
