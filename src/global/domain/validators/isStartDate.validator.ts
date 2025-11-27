import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

// Validates that the start date is less than the end date
export function IsStartDate(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'IsStartDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return new Date(value) < new Date((args.object as any).end);
        },
      },
    });
  };
}
