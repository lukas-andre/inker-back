export class ArtistFollowersMap extends Map<string, number> {
  addArtist(artistId: string, count: number): void {
    this.set(artistId, count);
  }
}
