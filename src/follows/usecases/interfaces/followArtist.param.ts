import { IsNumber, IsString } from 'class-validator';

export class FollowArtistParams {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly userTypeId: string;

  @IsString()
  readonly userType: string;

  @IsString()
  readonly username: string;

  @IsString()
  readonly fullname: string;

  @IsString()
  readonly profileThumbnail: string;
}
