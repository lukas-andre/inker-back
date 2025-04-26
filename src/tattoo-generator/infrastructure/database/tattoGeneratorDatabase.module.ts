import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TattooDesignCacheEntity } from "./entities/tattoo-design-cache.entity";
import { TATTOO_TRANSLATION_DB_CONNECTION_NAME } from "../../../databases/constants";
import { TattooDesignCacheRepository } from "./repositories/tattoo-design-cache.repository";


@Module({
    imports: [
        TypeOrmModule.forFeature([TattooDesignCacheEntity], TATTOO_TRANSLATION_DB_CONNECTION_NAME),
    ],
    providers: [
        TattooDesignCacheRepository,
    ],
    exports: [
        TattooDesignCacheRepository,
    ],
})
export class TattooGeneratorDatabaseModule { }