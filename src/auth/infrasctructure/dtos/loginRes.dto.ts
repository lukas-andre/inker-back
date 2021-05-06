import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class JwtPermissionDto {
  @ApiProperty({
    example: 'AuthController',
    description: 'Authorizated controller',
  })
  @IsString()
  c: string;

  @ApiProperty({
    example: '*',
    description: 'Access',
  })
  @IsString()
  a: string;
}

export class LoginResDto {
  @ApiProperty({
    example: 25,
    description: 'UserId',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'lilpeep',
    description: 'Username',
  })
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'lilpeep',
    description: 'Username',
  })
  @IsString()
  email?: string;

  @ApiProperty({
    example: 20,
    description: 'User Type Id',
    type: Number,
  })
  @IsNumber()
  userTypeId?: number;

  @ApiProperty({
    example: 'ARTIST',
    description: 'User type',
  })
  @IsString()
  userType: string;

  @ApiProperty({ name: 'permision', type: [JwtPermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JwtPermissionDto)
  permision: JwtPermissionDto[];

  @ApiProperty({
    example: 'kwledjashdf32091deusad',
    description: 'token',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    example: '3000',
    description: 'token expiration',
  })
  @IsNumber()
  expiresIn: number;
}
