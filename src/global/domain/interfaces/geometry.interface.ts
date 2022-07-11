export interface GeometryInterface {
  location: LocationInterface;
  viewport: ViewportInterface;
}

export interface LocationInterface {
  lat: number;
  lng: number;
}

export interface ViewportInterface {
  northeast: LocationInterface;
  southwest: LocationInterface;
}
