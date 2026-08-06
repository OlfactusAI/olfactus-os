"use client";

import { useCallback, useEffect, useState } from "react";

import {
  defaultWeatherPreferences,
  type WeatherPreferences,
  type WeatherSnapshot,
  type WeatherStatus,
} from "@/lib/weather/types";
import {
  fetchWeatherSnapshot,
  geocodeCity,
  seasonalFallback,
} from "@/lib/weather/weather-service";

const PREF_KEY = "olfactus.weather.preferences.v1";
const CACHE_KEY = "olfactus.weather.cache.v1";
const CACHE_DURATION = 20 * 60 * 1000;

export function useWeatherIntelligence() {
  const [preferences, setPreferences] =
    useState<WeatherPreferences>(
      defaultWeatherPreferences,
    );
  const [weather, setWeather] =
    useState<WeatherSnapshot | null>(null);
  const [status, setStatus] =
    useState<WeatherStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PREF_KEY);
      const cache = window.localStorage.getItem(CACHE_KEY);
      if (saved) {
        setPreferences({
          ...defaultWeatherPreferences,
          ...(JSON.parse(saved) as Partial<WeatherPreferences>),
        });
      }
      if (cache) {
        const parsed = JSON.parse(cache) as {
          timestamp: number;
          weather: WeatherSnapshot;
        };
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          setWeather(parsed.weather);
          setStatus("ready");
        }
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  const saveWeather = useCallback(
    (snapshot: WeatherSnapshot) => {
      setWeather(snapshot);
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          weather: snapshot,
        }),
      );
    },
    [],
  );

  const refresh = useCallback(
    async (nextPreferences = preferences) => {
      setError(null);

      if (nextPreferences.mode === "disabled") {
        const fallback = seasonalFallback(nextPreferences);
        saveWeather(fallback);
        setStatus("fallback");
        return;
      }

      try {
        let latitude = nextPreferences.savedLatitude;
        let longitude = nextPreferences.savedLongitude;
        let label = nextPreferences.savedLabel;

        if (
          nextPreferences.mode === "manual" &&
          nextPreferences.manualCity.trim()
        ) {
          setStatus("locating");
          const result = await geocodeCity(
            nextPreferences.manualCity.trim(),
          );
          latitude = result.latitude;
          longitude = result.longitude;
          label = result.label;
          const updated = {
            ...nextPreferences,
            savedLatitude: latitude,
            savedLongitude: longitude,
            savedLabel: label,
          };
          setPreferences(updated);
          window.localStorage.setItem(
            PREF_KEY,
            JSON.stringify(updated),
          );
        } else if (
          nextPreferences.mode === "automatic" &&
          (!latitude || !longitude)
        ) {
          setStatus("locating");
          const position = await getBrowserPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          label = "Current location";
        }

        if (latitude == null || longitude == null) {
          throw new Error("Location is unavailable.");
        }

        setStatus("loading");
        const snapshot = await fetchWeatherSnapshot({
          latitude,
          longitude,
          locationLabel: label || "Selected location",
        });
        saveWeather(snapshot);
        setStatus("ready");
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Weather could not be loaded.";
        setError(message);
        saveWeather(seasonalFallback(nextPreferences));
        setStatus("fallback");
      }
    },
    [preferences, saveWeather],
  );

  useEffect(() => {
    if (
      hydrated &&
      status === "idle" &&
      !weather
    ) {
      void refresh(preferences);
    }
  }, [hydrated, preferences, refresh, status, weather]);

  function updatePreferences(
    next: WeatherPreferences,
  ) {
    setPreferences(next);
    window.localStorage.setItem(
      PREF_KEY,
      JSON.stringify(next),
    );
    void refresh(next);
  }

  return {
    weather:
      weather ?? seasonalFallback(preferences),
    preferences,
    status,
    error,
    hydrated,
    refresh: () => refresh(preferences),
    updatePreferences,
  };
}

function getBrowserPosition() {
  return new Promise<GeolocationPosition>(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is unsupported."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        resolve,
        () =>
          reject(
            new Error(
              "Location permission was denied. Choose a city manually.",
            ),
          ),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30 * 60 * 1000,
        },
      );
    },
  );
}
