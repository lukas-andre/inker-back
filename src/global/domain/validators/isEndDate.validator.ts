import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsEndDate(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsEndDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const endDate = new Date(value);
          const startDate = new Date((args.object as any).start);
          console.log('IsEndDate: endDate: ', endDate);
          console.log('IsEndDate: startDate: ', startDate);
          console.log('value: ', value);
          return endDate > startDate;
        },
      },
    });
  };
}
