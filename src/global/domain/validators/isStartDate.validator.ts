import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsStartDate(validationOptions?: ValidationOptions) {
  return function(object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsStartDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const startDate = new Date(value);
          const endDate = new Date((args.object as any).end);
          return startDate < endDate;
        },
      },
    });
  };
}
