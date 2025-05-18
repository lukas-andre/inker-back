import { Module } from '@nestjs/common';
import { ConsentController } from './infrastructure/controllers/consent.controller';
import { CreateTemplateUseCase } from './usecases/create-template.usecase';
import { GetTemplateUseCase } from './usecases/get-template.usecase';
import { SignConsentUseCase } from './usecases/sign-consent.usecase';
import { FormTemplateRepository } from './infrastructure/repositories/form-template.repository';
import { SignedConsentRepository } from './infrastructure/repositories/signed-consent.repository';
import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module'; // For AgendaEventRepository


@Module({
  imports: [ 
    AgendaRepositoryModule
  ],
  controllers: [ConsentController],
  providers: [
    CreateTemplateUseCase,
    GetTemplateUseCase,
    SignConsentUseCase,
    FormTemplateRepository,
    SignedConsentRepository,
  ],
  exports: [
    CreateTemplateUseCase,
    GetTemplateUseCase,
    SignConsentUseCase,
    FormTemplateRepository,
    SignedConsentRepository,
  ],
})
export class ConsentModule { } 