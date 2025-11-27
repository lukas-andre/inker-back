import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Interaction } from '../entities/interaction.entity';

import { InteractionRepository } from './interaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Interaction], 'artist-db')],
  providers: [InteractionRepository],
  exports: [InteractionRepository],
})
export class InteractionProviderModule {}
