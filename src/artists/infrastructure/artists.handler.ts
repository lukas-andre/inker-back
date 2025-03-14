import { Injectable } from '@nestjs/common';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { Artist } from './entities/artist.entity';
import { GetArtistStylesUseCase } from '../usecases/artistStyle/getArtistStyles.usecase';
import { ArtistStyleDto, CreateArtistStyleDto, UpdateArtistStyleDto } from '../domain/dtos/artistStyle.dto';
import { AddArtistStyleUseCase } from '../usecases/artistStyle/addArtistStyle.usecase';
import { UpdateArtistStyleUseCase } from '../usecases/artistStyle/updateArtistStyle.usecase';
import { RemoveArtistStyleUseCase } from '../usecases/artistStyle/removeArtistStyle.usecase';
import { GetWorksUseCase } from '../usecases/work/getWorks.usecase';
import { WorkDto, CreateWorkDto, UpdateWorkDto } from '../domain/dtos/work.dto';
import { CreateWorkUseCase } from '../usecases/work/createWork.usecase';
import { GetWorkByIdUseCase } from '../usecases/work/getWorkById.usecase';
import { UpdateWorkUseCase } from '../usecases/work/updateWork.usecase';
import { DeleteWorkUseCase } from '../usecases/work/deleteWork.usecase';
import { GetStencilsUseCase } from '../usecases/stencil/getStencils.usecase';
import { StencilDto, CreateStencilDto, UpdateStencilDto } from '../domain/dtos/stencil.dto';
import { CreateStencilUseCase } from '../usecases/stencil/createStencil.usecase';
import { GetStencilByIdUseCase } from '../usecases/stencil/getStencilById.usecase';
import { UpdateStencilUseCase } from '../usecases/stencil/updateStencil.usecase';
import { DeleteStencilUseCase } from '../usecases/stencil/deleteStencil.usecase';
import { BaseComponent } from '../../global/domain/components/base.component';
import { CreateArtistParams } from '../usecases/interfaces/createArtist.params';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistStudioPhotoUseCase } from '../usecases/updateArtistStudioPhoto.usecase';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { FindArtistByIdResult } from '../usecases/interfaces/findArtistById.result';
import { FindArtistsUsecase } from '../usecases/findArtists.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { DomainBadRequest } from '../../global/domain/exceptions/domain.exception';
import { StencilQueryDto } from '../domain/dtos/stencil-query.dto';
import { PaginatedStencilResponseDto } from '../domain/dtos/paginated-stencil-response.dto';

@Injectable()
export class ArtistsHandler extends BaseComponent {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly getArtistStylesUseCase: GetArtistStylesUseCase,
    private readonly addArtistStyleUseCase: AddArtistStyleUseCase,
    private readonly updateArtistStyleUseCase: UpdateArtistStyleUseCase,
    private readonly removeArtistStyleUseCase: RemoveArtistStyleUseCase,
    private readonly getWorksUseCase: GetWorksUseCase,
    private readonly createWorkUseCase: CreateWorkUseCase,
    private readonly getWorkByIdUseCase: GetWorkByIdUseCase,
    private readonly updateWorkUseCase: UpdateWorkUseCase,
    private readonly deleteWorkUseCase: DeleteWorkUseCase,
    private readonly getStencilsUseCase: GetStencilsUseCase,
    private readonly createStencilUseCase: CreateStencilUseCase,
    private readonly getStencilByIdUseCase: GetStencilByIdUseCase,
    private readonly updateStencilUseCase: UpdateStencilUseCase,
    private readonly deleteStencilUseCase: DeleteStencilUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
    private readonly updateArtistStudioPhotoUseCase: UpdateArtistStudioPhotoUseCase,
    private readonly findArtistsUseCase: FindArtistsUsecase,
    private readonly requestContext: RequestContextService,
  ) {
    super(ArtistsHandler.name);
  }

  createArtist(requestCreateArtistDto: CreateArtistParams) {
    this.logger.log('Creating artist');
    return this.createArtistUseCase.execute(
      requestCreateArtistDto,
    );
  }

  getArtistStyles(artistId: number): Promise<ArtistStyleDto[]> {
    this.logger.log(`Getting styles for artist: ${artistId}`);
    return this.getArtistStylesUseCase.execute({ artistId });
  }

  addArtistStyle(artistId: number, dto: CreateArtistStyleDto): Promise<ArtistStyleDto> {
    this.logger.log(`Adding style for artist: ${artistId}`);
    return this.addArtistStyleUseCase.execute({ artistId, dto });
  }

  updateArtistStyle(
    artistId: number,
    styleName: string,
    dto: UpdateArtistStyleDto,
  ): Promise<ArtistStyleDto> {
    this.logger.log(`Updating style ${styleName} for artist: ${artistId}`);
    return this.updateArtistStyleUseCase.execute({ artistId, styleName, dto });
  }

  removeArtistStyle(artistId: number, styleName: string): Promise<void> {
    this.logger.log(`Removing style ${styleName} from artist: ${artistId}`);
    return this.removeArtistStyleUseCase.execute({ artistId, styleName });
  }

  // Work handlers
  getWorks(artistId: number, onlyFeatured?: boolean): Promise<WorkDto[]> {
    this.logger.log(`Getting works for artist: ${artistId}`);
    return this.getWorksUseCase.execute({ artistId, onlyFeatured });
  }

  async createWork(artist: Artist, dto: CreateWorkDto): Promise<WorkDto> {
    this.logger.log(`Creating work for artist: ${artist.id}`);
    return this.createWorkUseCase.execute({ artist, dto });
  }

  getWorkById(id: number): Promise<WorkDto> {
    this.logger.log(`Getting work by id: ${id}`);
    return this.getWorkByIdUseCase.execute({ id });
  }

  updateWork(id: number, artistId: number, dto: UpdateWorkDto): Promise<WorkDto> {
    this.logger.log(`Updating work ${id} for artist: ${artistId}`);
    return this.updateWorkUseCase.execute({ id, artistId, dto });
  }

  deleteWork(id: number, artistId: number): Promise<void> {
    this.logger.log(`Deleting work ${id} for artist: ${artistId}`);
    return this.deleteWorkUseCase.execute({ id, artistId });
  }

  // Stencil handlers
  getStencils(artistId: number, query: StencilQueryDto): Promise<PaginatedStencilResponseDto> {
    this.logger.log(`Getting stencils for artist: ${artistId}`);
    return this.getStencilsUseCase.execute({ artistId, query });
  }

  async createStencil(dto: CreateStencilDto, file: FileInterface): Promise<StencilDto> {
    const { userType, userTypeId } = this.requestContext;
    if (userType !== UserType.ARTIST) {
      throw new DomainBadRequest('Only artists can create stencils');
    }
    this.logger.log(`Creating stencil for artist: ${userTypeId}`);
    return this.createStencilUseCase.execute({ artistId: userTypeId, dto, file });
  }

  getStencilById(id: number): Promise<StencilDto> {
    this.logger.log(`Getting stencil by id: ${id}`);
    return this.getStencilByIdUseCase.execute({ id });
  }

  updateStencil(id: number, dto: UpdateStencilDto): Promise<StencilDto> {
    const { userType, userTypeId } = this.requestContext;
    if (userType !== UserType.ARTIST) {
      throw new DomainBadRequest('Only artists can update stencils');
    }
    this.logger.log(`Updating stencil ${id} for artist: ${userTypeId}`);
    return this.updateStencilUseCase.execute({ id, artistId: userTypeId, dto });
  }

  deleteStencil(id: number): Promise<void> {
    const { userType, userTypeId } = this.requestContext;
    if (userType !== UserType.ARTIST) {
      throw new DomainBadRequest('Only artists can delete stencils');
    }
    this.logger.log(`Deleting stencil ${id} for artist: ${userTypeId}`);
    return this.deleteStencilUseCase.execute({ id, artistId: userTypeId });
  }

  // Artist basic info methods
  getArtistByUserId(userId: number): Promise<Artist> {
    this.logger.log(`Getting artist by user ID: ${userId}`);
    return this.findArtistsUseCases.findOne({ where: { userId } });
  }

  getArtistById(id: number): Promise<FindArtistByIdResult> {
    this.logger.log(`Getting artist by ID: ${id}`);
    return this.findArtistsUseCases.findById(id);
  }

  updateArtistBasicInfo(id: number, updateArtistDto: UpdateArtistDto) {
    this.logger.log(`Updating basic info for artist: ${id}`);
    return this.updateArtistBasicInfoUseCase.execute(id, updateArtistDto);
  }

  updateProfilePicture(id: number, file: FileInterface) {
    this.logger.log(`Updating profile picture for artist: ${id}`);
    return this.updateArtistProfilePictureUseCase.execute(id, file);
  }

  updateStudioPhoto(id: number, file: FileInterface) {
    this.logger.log(`Updating studio photo for artist: ${id}`);
    return this.updateArtistStudioPhotoUseCase.execute(id, file);
  }

  // Query methods
  handleGetAll() {
    this.logger.log('Getting all artists');
    return this.findArtistsUseCases.findAll({});
  }

  handleFindById(id: number) {
    this.logger.log(`Finding artist by ID: ${id}`);
    return this.getArtistById(id);
  }

  me() {
    const userId = this.requestContext.userId;
    this.logger.log(`Getting current artist profile for user ID: ${userId}`);
    return this.getArtistByUserId(userId);
  }

  handleUpdateMe(updateArtistDto: UpdateArtistDto) {
    const userId = this.requestContext.userId;
    this.logger.log(`Updating artist profile for user ID: ${userId}`);
    return this.updateArtistBasicInfo(userId, updateArtistDto);
  }

  handleSearchArtists(searchParams: any) {
    this.logger.log(`Searching artists with params: ${JSON.stringify(searchParams)}`);
    return this.findArtistsUseCase.execute(searchParams);
  }
}