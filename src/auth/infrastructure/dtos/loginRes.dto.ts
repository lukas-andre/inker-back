import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class JwtPermissionDto {
  @ApiProperty({
    example: 'AuthController',
    description: 'Authorized controller',
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
    example: '1',
    description: 'UserId',
    type: String,
  })
  @IsString()
  id: string;

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
    example: '1',
    description: 'User Type Id',
    type: String,
  })
  @IsString()
  userTypeId?: string;

  @ApiProperty({
    example: 'ARTIST',
    description: 'User type',
  })
  @IsString()
  userType: string;

  @ApiProperty({ name: 'permission', type: [JwtPermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JwtPermissionDto)
  permission: JwtPermissionDto[];

  @ApiProperty({
    example: '1231412-2131231',
    description: 'token',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    example: '3d',
    description: 'token expiration',
  })
  @IsString()
  expiresIn: string;
}
