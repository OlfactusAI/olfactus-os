import type {
  WeatherPreferences,
  WeatherSnapshot,
} from "@/lib/weather/types";
import type { Season } from "@/lib/domain/fragrance";

interface OpenMeteoResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    precipitation_probability: number[];
    uv_index: number[];
  };
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
}

export async function geocodeCity(city: string) {
  const endpoint = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );
  endpoint.searchParams.set("name", city);
  endpoint.searchParams.set("count", "1");
  endpoint.searchParams.set("language", "en");
  endpoint.searchParams.set("format", "json");

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("City lookup failed.");
  }

  const data = (await response.json()) as GeocodingResponse;
  const result = data.results?.[0];
  if (!result) {
    throw new Error("No matching city was found.");
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    label: [result.name, result.admin1, result.country]
      .filter(Boolean)
      .join(", "),
  };
}

export async function fetchWeatherSnapshot({
  latitude,
  longitude,
  locationLabel,
}: {
  latitude: number;
  longitude: number;
  locationLabel: string;
}): Promise<WeatherSnapshot> {
  const endpoint = new URL(
    "https://api.open-meteo.com/v1/forecast",
  );
  endpoint.searchParams.set("latitude", String(latitude));
  endpoint.searchParams.set("longitude", String(longitude));
  endpoint.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
  );
  endpoint.searchParams.set(
    "hourly",
    "precipitation_probability,uv_index",
  );
  endpoint.searchParams.set("temperature_unit", "fahrenheit");
  endpoint.searchParams.set("wind_speed_unit", "mph");
  endpoint.searchParams.set("precipitation_unit", "inch");
  endpoint.searchParams.set("timezone", "auto");
  endpoint.searchParams.set("forecast_days", "2");

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Weather service unavailable.");
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const hourIndex = nearestHourIndex(
    data.hourly.time,
    data.current.time,
  );

  return {
    temperatureF: Math.round(data.current.temperature_2m),
    apparentTemperatureF: Math.round(
      data.current.apparent_temperature,
    ),
    humidity: Math.round(
      data.current.relative_humidity_2m,
    ),
    precipitationProbability:
      data.hourly.precipitation_probability[hourIndex] ?? 0,
    precipitationInches: data.current.precipitation,
    windMph: Math.round(data.current.wind_speed_10m),
    uvIndex: Math.round(
      data.hourly.uv_index[hourIndex] ?? 0,
    ),
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    timezone: data.timezone,
    locationLabel,
    observedAt: data.current.time,
    source: "open-meteo",
    season: seasonFromDate(new Date()),
  };
}

export function seasonalFallback(
  preferences: WeatherPreferences,
): WeatherSnapshot {
  const season = seasonFromDate(new Date());
  const defaults = {
    spring: { temperatureF: 70, humidity: 55 },
    summer: { temperatureF: 90, humidity: 65 },
    fall: { temperatureF: 68, humidity: 50 },
    winter: { temperatureF: 45, humidity: 45 },
  }[season];

  return {
    ...defaults,
    apparentTemperatureF: defaults.temperatureF,
    precipitationProbability: 0,
    precipitationInches: 0,
    windMph: 5,
    uvIndex: season === "summer" ? 7 : 3,
    weatherCode: 0,
    isDay: true,
    timezone: "local",
    locationLabel:
      preferences.mode === "disabled"
        ? "Weather disabled"
        : "Seasonal fallback",
    observedAt: new Date().toISOString(),
    source: "seasonal-fallback",
    season,
  };
}

export function weatherDescription(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorms";
  return "Mixed conditions";
}

function nearestHourIndex(
  hours: string[],
  current: string,
) {
  const target = new Date(current).getTime();
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;
  hours.forEach((hour, index) => {
    const next = Math.abs(new Date(hour).getTime() - target);
    if (next < distance) {
      distance = next;
      best = index;
    }
  });
  return best;
}

function seasonFromDate(date: Date): Season {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}
