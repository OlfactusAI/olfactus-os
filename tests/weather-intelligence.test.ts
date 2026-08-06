import { describe, expect, it } from "vitest";
import {
  seasonalFallback,
  weatherDescription,
} from "@/lib/weather/weather-service";
import { defaultWeatherPreferences } from "@/lib/weather/types";

describe("Weather Intelligence", () => {
  it("creates a safe seasonal fallback", () => {
    const result = seasonalFallback(
      defaultWeatherPreferences,
    );
    expect(result.source).toBe("seasonal-fallback");
    expect(result.temperatureF).toBeGreaterThan(-20);
    expect(result.humidity).toBeGreaterThanOrEqual(0);
  });

  it("maps weather codes to readable conditions", () => {
    expect(weatherDescription(0)).toBe("Clear");
    expect(weatherDescription(61)).toBe("Rain");
    expect(weatherDescription(95)).toBe(
      "Thunderstorms",
    );
  });
});
