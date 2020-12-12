import { IsNumber, IsString } from 'class-validator';

export class FollowArtistParams {
  @IsNumber()
  readonly userId: number;

  @IsNumber()
  readonly userTypeId: number;

  @IsString()
  readonly userType: string;

  @IsString()
  readonly username: string;

  @IsString()
  readonly fullname: string;

  @IsString()
  readonly profileThumbnail: string;
}
