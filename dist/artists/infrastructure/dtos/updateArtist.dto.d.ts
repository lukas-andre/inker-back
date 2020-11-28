import { CreateArtistDto } from './createArtist.dto';
declare const UpdateArtistDto_base: import("@nestjs/common").Type<Partial<Pick<CreateArtistDto, "firstName" | "lastName" | "contactEmail">>>;
export declare class UpdateArtistDto extends UpdateArtistDto_base {
    readonly shortDescription: string;
    readonly contactPhoneNumber: string;
}
export {};
