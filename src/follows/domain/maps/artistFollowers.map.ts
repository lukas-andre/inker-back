export class ArtistFollowersMap extends Map<number, number> {
  addArtist(artistId: number, count: number): void {
    this.set(artistId, count);
  }
}
