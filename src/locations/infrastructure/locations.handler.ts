import { Injectable } from '@nestjs/common';

import { BaseComponent } from '../../global/domain/components/base.component';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import {
  ArtistLocationCreateDto,
  ArtistLocationDto,
  ArtistLocationUpdateDto,
  DeleteArtistLocationParams,
} from '../domain/interfaces/artistLocation.interface';
import { CreateArtistLocationUseCase } from '../useCases/artistLocations/createArtistLocation.usecase';
import { DeleteArtistLocationUseCase } from '../useCases/artistLocations/deleteArtistLocation.usecase';
import { GetArtistLocationsUseCase } from '../useCases/artistLocations/getArtistLocations.usecase';
import { UpdateArtistLocationUseCase } from '../useCases/artistLocations/updateArtistLocation.usecase';
import { AddLocationByApiUseCase } from '../usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from '../usecases/findArtistByRange.usecase';

import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByRangeDTORequest } from './dtos/findArtistByRangeRequest.dto';
import { FindArtistByRangeResponseDTO } from './dtos/findArtistByRangeResponse.dto';

@Injectable()
export class LocationsHandler extends BaseComponent {
  constructor(
    private readonly addLocationByApiUseCase: AddLocationByApiUseCase,
    private readonly findArtistByRangeUseCase: FindArtistByRangeUseCase,
    private readonly createArtistLocationUseCase: CreateArtistLocationUseCase,
    private readonly getArtistLocationsUseCase: GetArtistLocationsUseCase,
    private readonly updateArtistLocationUseCase: UpdateArtistLocationUseCase,
    private readonly deleteArtistLocationUseCase: DeleteArtistLocationUseCase,
    private readonly requestService: RequestContextService,
  ) {
    super(LocationsHandler.name);
  }

  public async handleAddLocation(dto: AddLocationDto) {
    return this.addLocationByApiUseCase.execute(dto);
  }

  public async handleFindArtistByRange(
    dto: FindArtistByRangeDTORequest,
  ): Promise<FindArtistByRangeResponseDTO[]> {
    return this.findArtistByRangeUseCase.execute(
      dto,
      this.requestService.userTypeId,
      this.requestService.userId,
    );
  }

  // New methods for artist locations CRUD operations

  public async handleCreateArtistLocation(
    artistId: string,
    dto: ArtistLocationCreateDto,
  ): Promise<ArtistLocationDto> {
    this.logger.log('Creating artist location', { artistId, dto });

    // Ensure artist ID is set
    dto.artistId = artistId;

    return this.createArtistLocationUseCase.execute(dto);
  }

  public async handleGetArtistLocations(
    artistId: string,
  ): Promise<ArtistLocationDto[]> {
    this.logger.log('Getting artist locations', { artistId });

    return this.getArtistLocationsUseCase.execute({ artistId });
  }

  public async handleUpdateArtistLocation(
    artistId: string,
    locationId: string,
    dto: ArtistLocationUpdateDto,
  ): Promise<ArtistLocationDto> {
    this.logger.log('Updating artist location', { artistId, locationId, dto });

    // Set the ID in the DTO
    dto.id = locationId;

    return this.updateArtistLocationUseCase.execute(dto);
  }

  public async handleDeleteArtistLocation(
    artistId: string,
    locationId: string,
  ): Promise<boolean> {
    this.logger.log('Deleting artist location', { artistId, locationId });

    const params: DeleteArtistLocationParams = {
      id: locationId,
      artistId,
    };

    return this.deleteArtistLocationUseCase.execute(params);
  }
}
