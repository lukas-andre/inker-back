import { IsString } from 'class-validator';

export class AddFollowToArtistParams {
  @IsString()
  readonly userId: number;

  @IsString()
  readonly userTypeId: number;

  @IsString()
  readonly username: string;

  @IsString()
  readonly profileThumbnail: string;
}
