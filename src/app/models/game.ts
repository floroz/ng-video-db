export interface Game {
  id: number;
  background_image: string;
  name: string;
  released: string;
  metacritic_url: string;
  website: string;
  description: string;
  metacritic: number;
  genres: Array<Genre>;
  parent_platforms: Array<ParentPlatform>;
  publishers: Array<Publishers>;
  ratings: Array<Rating>;
  screenshots: Array<Screenshots>;
  trailers: Array<Trailer>;
}

export interface APIResponse<T> {
  results: Array<T>;
  next: string;
  previous?: string;
}

interface Genre {
  name: string;
}

interface ParentPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Publishers {
  name: string;
}

interface Rating {
  id: number;
  count: number;
  title: string;
}

interface Screenshots {
  image: string;
}

interface Trailer {
  data: {
    max: string;
  };
}

export interface GameFilters {
  name?: string;
  released?: string;
  added?: string;
  created?: string;
  updated?: string;
  rating?: string;
  metacritic?: string;
  ['-name']?: string;
  ['-released']?: string;
  ['-added']?: string;
  ['-created']?: string;
  ['-updated']?: string;
  ['-rating']?: string;
  ['-metacritic']?: string;
}
