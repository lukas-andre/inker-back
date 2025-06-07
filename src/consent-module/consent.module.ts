import { Module } from '@nestjs/common';
import { ConsentController } from './infrastructure/controllers/consent.controller';
import { CreateTemplateUseCase } from './usecases/create-template.usecase';
import { UpdateTemplateUseCase } from './usecases/update-template.usecase';
import { DeleteTemplateUseCase } from './usecases/delete-template.usecase';
import { UpdateTemplateStatusUseCase } from './usecases/update-template-status.usecase';
import { GetTemplateUseCase } from './usecases/get-template.usecase';
import { SignConsentUseCase } from './usecases/sign-consent.usecase';
import { FormTemplateRepository } from './infrastructure/repositories/form-template.repository';
import { SignedConsentRepository } from './infrastructure/repositories/signed-consent.repository';
import { IFormTemplateRepository } from './domain/interfaces/form-template-repository.interface';
import { ISignedConsentRepository } from './domain/interfaces/signed-consent-repository.interface';
import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module'; // For AgendaEventRepository
import { FormTemplateEntity } from '../agenda/infrastructure/entities/formTemplate.entity';
import { SignedConsentEntity } from '../agenda/infrastructure/entities/signedConsent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AGENDA_DB_CONNECTION_NAME } from '../databases/constants';


@Module({
  imports: [ 
    AgendaRepositoryModule,
    TypeOrmModule.forFeature([FormTemplateEntity, SignedConsentEntity], AGENDA_DB_CONNECTION_NAME),
  ],
  controllers: [ConsentController],
  providers: [
    CreateTemplateUseCase,
    UpdateTemplateUseCase,
    DeleteTemplateUseCase,
    UpdateTemplateStatusUseCase,
    GetTemplateUseCase,
    SignConsentUseCase,
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
    FormTemplateRepository,
    SignedConsentRepository,
  ],
})
export class ConsentModule { } 