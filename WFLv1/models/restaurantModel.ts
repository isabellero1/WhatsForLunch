// models/restaurantModel.ts

export interface Restaurant {
  place_id: string;
  name: string;
  types: string[];
  rating: number;
  price_level: number;
  website: string;
  url: string;
  vicinity: string;
  distance: number; // in meters
  comment: string; // New field for comments
  tags?: string[]; // Add this line to include the tags property
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }>;
  photo_url?: string; // Add this line to include the photo_url property
}

declare namespace NodeJS {
  interface ProcessEnv {
    GOOGLEAPI: string;
  }
}

export interface User {
  email: string;
  given_name: string;
  picture: string;
  // name: string | null;
}
