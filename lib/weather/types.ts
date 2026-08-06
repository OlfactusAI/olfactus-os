import type { Season } from "@/lib/domain/fragrance";

export type WeatherMode = "automatic" | "manual" | "disabled";
export type WeatherStatus =
  | "idle"
  | "locating"
  | "loading"
  | "ready"
  | "fallback"
  | "error";

export interface WeatherPreferences {
  mode: WeatherMode;
  manualCity: string;
  savedLatitude: number | null;
  savedLongitude: number | null;
  savedLabel: string;
}

export interface WeatherSnapshot {
  temperatureF: number;
  apparentTemperatureF: number;
  humidity: number;
  precipitationProbability: number;
  precipitationInches: number;
  windMph: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  timezone: string;
  locationLabel: string;
  observedAt: string;
  source: "open-meteo" | "seasonal-fallback";
  season: Season;
}

export const defaultWeatherPreferences: WeatherPreferences = {
  mode: "automatic",
  manualCity: "",
  savedLatitude: null,
  savedLongitude: null,
  savedLabel: "",
};
