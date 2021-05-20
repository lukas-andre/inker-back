import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsOnlyDate(validationOptions?: ValidationOptions) {
  return function(object: Record<string, unknown>, propertyName: string) {
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
          const regex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/g;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
