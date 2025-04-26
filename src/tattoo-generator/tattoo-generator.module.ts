import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TattooGeneratorController } from './infrastructure/controllers/tattoo-generator.controller';
import { RunwareImageGenerationService } from './infrastructure/services/runware-image-generation.service';
import { ImprovedTattooPromptEnhancementService } from './infrastructure/services/improved-tattoo-prompt-enhancement.service';
import { LibreTranslationService } from './infrastructure/services/libre-translation.service';
import { GenerateTattooImagesUseCase } from './use-cases/generate-tattoo-images.use-case';
import { HttpModule } from '@nestjs/axios';
import libreTranslateConfig from '../config/libretranslate.config';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forFeature(libreTranslateConfig),
    ],
    controllers: [
        TattooGeneratorController,
    ],
    providers: [
        RunwareImageGenerationService,
        GenerateTattooImagesUseCase,
        ImprovedTattooPromptEnhancementService,
        LibreTranslationService
    ],
    exports: [],
})
export class TattooGeneratorModule { } 