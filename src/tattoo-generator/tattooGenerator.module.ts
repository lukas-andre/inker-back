import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import libreTranslateConfig from '../config/libretranslate.config';
import { TokensModule } from '../tokens/tokens.module';

import { TattooGeneratorController } from './infrastructure/controllers/tattooGenerator.controller';
import { TattooGeneratorDatabaseModule } from './infrastructure/database/tattoGeneratorDatabase.module';
import { LibreTranslationService } from './infrastructure/services/libreTranslation.service';
import { RunwareImageGenerationService } from './infrastructure/services/runwareImageGeneration.service';
import { TattooPromptEnhancementService } from './infrastructure/services/tattooPromptEnhancement.service';
import { GenerateTattooImagesUseCase } from './usecases/generateTattooImages.usecase';
import { GetUserTattooHistoryUseCase } from './usecases/getUserTattooHistory.usecase';
import { UpdateTattooFavoriteUseCase } from './usecases/updateTattooFavorite.usecase';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forFeature(libreTranslateConfig),
    TattooGeneratorDatabaseModule,
    TokensModule,
  ],
  controllers: [TattooGeneratorController],
  providers: [
    RunwareImageGenerationService,
    GenerateTattooImagesUseCase,
    GetUserTattooHistoryUseCase,
    UpdateTattooFavoriteUseCase,
    TattooPromptEnhancementService,
    LibreTranslationService,
  ],
  exports: [GenerateTattooImagesUseCase],
})
export class TattooGeneratorModule {}
