import {
  Injectable
} from '@nestjs/common'
import { CreateArtistDto } from './dtos/createArtist.dto';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { DomainException } from 'src/global/domain/exceptions/domain.exception';
import { resolveDomainException } from 'src/global/infrastructure/exceptions/resolveDomainException';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtstBasicInfo.usecase';
// import { FollowDto } from './dtos/follow.dto';
import { JwtService } from '@nestjs/jwt'
import { ExtractJwt } from 'passport-jwt';
import { JwtPayload } from 'src/auth/domain/interfaces/jwtPayload.interface';
@Injectable()
export class ArtistsHandler {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
    private readonly updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase,
    private readonly jwtService: JwtService
  ) {}

  async handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse> {
    return this.resolve(await this.createArtistUseCase.execute(dto));
  }

  async handleUpdateProfileProflePicture(id: string, file: any): Promise<BaseArtistResponse> {
    return this.resolve(await this.updateArtistProfilePictureUseCase.execute(
      id,
      file,
    ));

  }

  async handleFindById(id: string): Promise<BaseArtistResponse> {
    return this.findArtistsUseCases.findById(id);
  }
  async handleGetAll(): Promise<BaseArtistResponse[]> {
    return this.findArtistsUseCases.findAll({});
  }

  async handleUpdateArtistBasicInfo(id: string, dto: UpdateArtistDto ): Promise<BaseArtistResponse>  {
    return this.resolve(await this.updateArtistBasicInfoUseCase.execute(id, dto));
  }

  private resolve(result: DomainException | BaseArtistResponse) {
    if (result instanceof DomainException)
      throw resolveDomainException(result);

    return result;
  }

  async handleFollow(id: string, request) {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const payload: JwtPayload = this.jwtService.verify(jwt);
    console.log('payload: ', payload);
    // this.
  }
}
