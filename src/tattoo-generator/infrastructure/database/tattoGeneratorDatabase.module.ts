import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TATTOO_TRANSLATION_DB_CONNECTION_NAME } from '../../../databases/constants';

import { TattooDesignCacheEntity } from './entities/tattooDesignCache.entity';
import { TattooDesignCacheRepository } from './repositories/tattooDesignCache.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TattooDesignCacheEntity],
      TATTOO_TRANSLATION_DB_CONNECTION_NAME,
    ),
  ],
  providers: [TattooDesignCacheRepository],
  exports: [TattooDesignCacheRepository],
})
export class TattooGeneratorDatabaseModule {}
