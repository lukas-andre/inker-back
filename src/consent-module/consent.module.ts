import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FormTemplateEntity } from '../agenda/infrastructure/entities/formTemplate.entity';
import { SignedConsentEntity } from '../agenda/infrastructure/entities/signedConsent.entity';
import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module'; // For AgendaEventRepository
import { AGENDA_DB_CONNECTION_NAME } from '../databases/constants';

import { IFormTemplateRepository } from './domain/interfaces/form-template-repository.interface';
import { ISignedConsentRepository } from './domain/interfaces/signed-consent-repository.interface';
import { ConsentController } from './infrastructure/controllers/consent.controller';
import { FormTemplateRepository } from './infrastructure/repositories/form-template.repository';
import { SignedConsentRepository } from './infrastructure/repositories/signed-consent.repository';
import { AcceptDefaultTermsUseCase } from './usecases/accept-default-terms.usecase';
import { CreateTemplateUseCase } from './usecases/create-template.usecase';
import { UpdateTemplateUseCase } from './usecases/update-template.usecase';
import { DeleteTemplateUseCase } from './usecases/delete-template.usecase';
import { UpdateTemplateStatusUseCase } from './usecases/update-template-status.usecase';
import { GetTemplateUseCase } from './usecases/get-template.usecase';
import { SignConsentUseCase } from './usecases/sign-consent.usecase';
import { CheckConsentStatusUseCase } from './usecases/check-consent-status.usecase';

@Module({
  imports: [
    AgendaRepositoryModule,
    TypeOrmModule.forFeature(
      [FormTemplateEntity, SignedConsentEntity],
      AGENDA_DB_CONNECTION_NAME,
    ),
  ],
  controllers: [ConsentController],
  providers: [
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    DeleteTemplateUseCase,
    UpdateTemplateStatusUseCase,
    GetTemplateUseCase,
    SignConsentUseCase,
    AcceptDefaultTermsUseCase,
    CheckConsentStatusUseCase,
    FormTemplateRepository,
    SignedConsentRepository,
    {
      provide: IFormTemplateRepository,
      useClass: FormTemplateRepository,
    },
    {
      provide: ISignedConsentRepository,
      useClass: SignedConsentRepository,
    },
  ],
  exports: [
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    DeleteTemplateUseCase,
    UpdateTemplateStatusUseCase,
    GetTemplateUseCase,
    SignConsentUseCase,
    AcceptDefaultTermsUseCase,
    CheckConsentStatusUseCase,
    FormTemplateRepository,
    SignedConsentRepository,
  ],
})
export class ConsentModule {}
