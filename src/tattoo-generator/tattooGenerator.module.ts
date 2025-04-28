import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TattooGeneratorController } from './infrastructure/controllers/tattooGenerator.controller';
import { RunwareImageGenerationService } from './infrastructure/services/runwareImageGeneration.service';
import { TattooPromptEnhancementService } from './infrastructure/services/tattooPromptEnhancement.service';
import { LibreTranslationService } from './infrastructure/services/libreTranslation.service';
import { GenerateTattooImagesUseCase } from './usecases/generateTattooImages.usecase';
import { GetUserTattooHistoryUseCase } from './usecases/getUserTattooHistory.usecase';
import { UpdateTattooFavoriteUseCase } from './usecases/updateTattooFavorite.usecase';
import { HttpModule } from '@nestjs/axios';
import libreTranslateConfig from '../config/libretranslate.config';
import { TattooGeneratorDatabaseModule } from './infrastructure/database/tattoGeneratorDatabase.module';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forFeature(libreTranslateConfig),
        TattooGeneratorDatabaseModule
    ],
    controllers: [
        TattooGeneratorController,
    ],
    providers: [
        RunwareImageGenerationService,
        GenerateTattooImagesUseCase,
        GetUserTattooHistoryUseCase,
        UpdateTattooFavoriteUseCase,
        TattooPromptEnhancementService,
        LibreTranslationService
    ],
    exports: [
        GenerateTattooImagesUseCase,
    ],
})
export class TattooGeneratorModule { } 