import { ApiBodyOptions } from '@nestjs/swagger';

export const fileApiBodyOptions: ApiBodyOptions = {
  type: 'multipart/form-data',
  required: true,
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};
