import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction } from '../entities/interaction.entity';
import { InteractionProvider } from './interaction.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interaction], 'artist-db'),
  ],
  providers: [InteractionProvider],
  exports: [InteractionProvider],
})
export class InteractionProviderModule {}