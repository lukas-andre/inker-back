import { FastifyRateLimitOptions } from '@fastify/rate-limit';
import { ValidationPipeOptions } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// import { FastifyHelmetOptions } from 'fastify-helmet';

export const SERVICE_NAME = 'com.inkerapp.api-service';

export const corsOptions: CorsOptions = {};

// export const helmetOptions: FastifyHelmetOptions = {
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: [`'self'`],
//       styleSrc: [`'self'`, `'unsafe-inline'`],
//       imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
//       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
//     },
//   },
// };

export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  validatorPackage: require('@nestjs/class-validator'),
  transformerPackage: require('@nestjs/class-transformer'),
};

export const rateLimitOptions: FastifyRateLimitOptions = {
  timeWindow: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};
