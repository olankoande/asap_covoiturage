// Google Maps configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('Google Maps API key is not configured. Please check your environment variables.');
}

// Ensure the API key is properly formatted
export const MAPS_CONFIG = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ["places"] as ("places" | "drawing" | "geometry" | "localContext" | "visualization")[],
  region: 'CA',
  language: 'fr'
};

export const defaultMapCenter = {
  lat: 45.5017,
  lng: -73.5673,
  zoom: 11
}; // Montreal