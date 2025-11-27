import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import {
  MultimediasService,
  UploadToS3Result,
} from '../../../multimedias/services/multimedias.service';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { SendOfferMessageReqDto } from '../../infrastructure/dtos/sendOfferMessageReq.dto';
import { QuotationType } from '../../infrastructure/entities/quotation.entity';
import {
  OfferMessage,
  QuotationOffer,
} from '../../infrastructure/entities/quotationOffer.entity';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import { QuotationOfferRepository } from '../../infrastructure/repositories/quotationOffer.repository';

@Injectable()
export class SendOfferMessageUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationRepo: QuotationRepository,
    private readonly quotationOfferRepo: QuotationOfferRepository,
    private readonly multimediaService: MultimediasService,
    private readonly contextService: RequestContextService,
  ) {
    super(SendOfferMessageUseCase.name);
  }

  async execute(
    quotationId: string,
    offerId: string,
    dto: SendOfferMessageReqDto,
    imageFile?: FileInterface, // Optional image file
  ): Promise<QuotationOffer> {
    const userTypeId = this.contextService.userTypeId;
    const userType = this.contextService.userType;

    if (!userTypeId || !userType) {
      throw new UnauthorizedException('User context not found');
    }

    // 1. Find the offer and its parent quotation
    const offer = await this.quotationOfferRepo.findOne({
      where: { id: offerId, quotationId },
      relations: ['quotation'], // Need quotation to verify customerId and type
    });

    if (!offer || !offer.quotation) {
      throw new DomainNotFound('Quotation offer or quotation not found');
    }

    // 2. Authorization Check
    const isCustomer =
      userType === UserType.CUSTOMER &&
      offer.quotation.customerId === userTypeId;
    const isArtist =
      userType === UserType.ARTIST && offer.artistId === userTypeId;

    if (!isCustomer && !isArtist) {
      throw new ForbiddenException(
        'User is not authorized to send messages to this offer',
      );
    }
    if (offer.quotation.type !== QuotationType.OPEN) {
      throw new ForbiddenException(
        'Messages can only be sent on OPEN quotations',
      );
    }
    // Add checks for quotation/offer status if needed (e.g., cannot message after accepted/rejected)

    // 3. Handle optional image upload
    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      try {
        // Generate a unique filename part
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 random chars
        const safeOriginalName = imageFile.originalname.replace(
          /[^a-zA-Z0-9_\-\.]/g,
          '_',
        ); // Sanitize original name
        const uniqueFileName = `${timestamp}-${randomSuffix}-${safeOriginalName}`;
        const path = `quotations/${quotationId}/offers/${offerId}/messages`; // S3 "folder"
        const uploadedImage: UploadToS3Result =
          await this.multimediaService.upload(
            imageFile,
            path,
            uniqueFileName, // Full path including filename for S3 key
          );
        imageUrl = uploadedImage.cloudFrontUrl;
        this.logger.log(`Image uploaded for offer message: ${imageUrl}`);
      } catch (error) {
        this.logger.error('Error uploading image for offer message', error);
      }
    }

    // 4. Create the message object
    const newMessage: OfferMessage = {
      senderId: userTypeId,
      senderType: isArtist ? 'artist' : 'customer',
      message: dto.message,
      imageUrl: imageUrl,
      timestamp: new Date(),
    };

    // 5. Append message and save
    offer.messages = [...(offer.messages || []), newMessage];
    const offerToSave = { ...offer, quotation: undefined };
    const updatedOffer = await this.quotationOfferRepo.repo.save(
      offerToSave as QuotationOffer,
    );

    this.logger.log(
      `Message sent by ${newMessage.senderType} (${userTypeId}) on offer ${offerId}`,
    );

    // TODO: Implement notification logic here (notify the other party)
    // e.g., this.notificationService.notifyOfferMessage(offer, newMessage);

    return updatedOffer;
  }
}
