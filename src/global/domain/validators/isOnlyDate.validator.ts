import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsOnlyDate(
  format?: string,
  validationOptions?: ValidationOptions,
) {
  return function(object: unknown, propertyName: string) {
    registerDecorator({
      name: 'IsOnlyDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Please provide only date like 2020-12-08 12:30:00',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (format === 'YYYY-MM-DD hh:dd:ss') {
            const regex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/g;
            return typeof value === 'string' && regex.test(value);
          }

          if (format === 'YYYY-MM-DD') {
            const regex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
            return typeof value === 'string' && regex.test(value);
          }

          const regex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/g;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
