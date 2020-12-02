import { IsString } from 'class-validator';

export class AddFollowToArtistParams {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly userTypeId: string;

  @IsString()
  readonly username: string;

  @IsString()
  readonly profileThumbnail: string;
}
