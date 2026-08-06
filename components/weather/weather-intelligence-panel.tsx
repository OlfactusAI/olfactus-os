"use client";

import {
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  WeatherPreferences,
  WeatherSnapshot,
  WeatherStatus,
} from "@/lib/weather/types";
import { weatherDescription } from "@/lib/weather/weather-service";

export function WeatherIntelligencePanel({
  weather,
  status,
  error,
  preferences,
  onRefresh,
  onUpdatePreferences,
}: {
  weather: WeatherSnapshot;
  status: WeatherStatus;
  error: string | null;
  preferences: WeatherPreferences;
  onRefresh: () => void;
  onUpdatePreferences: (
    next: WeatherPreferences,
  ) => void;
}) {
  return (
    <section className="weather-intelligence-panel rounded-[30px] border border-[var(--border)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="weather-mark">
            <CloudSun size={18} />
          </span>
          <div>
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              Weather Intelligence
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {weather.locationLabel} · {weatherDescription(weather.weatherCode)}
            </p>
          </div>
        </div>
        <Button onClick={onRefresh}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <WeatherMetric
          icon={<CloudSun size={16} />}
          label="Temperature"
          value={`${weather.temperatureF}°F`}
          detail={`Feels ${weather.apparentTemperatureF}°`}
        />
        <WeatherMetric
          icon={<Droplets size={16} />}
          label="Humidity"
          value={`${weather.humidity}%`}
          detail="Projection modifier"
        />
        <WeatherMetric
          icon={<CloudRain size={16} />}
          label="Rain"
          value={`${weather.precipitationProbability}%`}
          detail="Next-hour probability"
        />
        <WeatherMetric
          icon={<Wind size={16} />}
          label="Wind"
          value={`${weather.windMph} mph`}
          detail="Outdoor diffusion"
        />
        <WeatherMetric
          icon={<Sun size={16} />}
          label="UV"
          value={String(weather.uvIndex)}
          detail="Heat exposure"
        />
      </div>

      <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-6 lg:grid-cols-[170px_1fr_auto]">
        <select
          className="weather-control"
          value={preferences.mode}
          onChange={(event) =>
            onUpdatePreferences({
              ...preferences,
              mode: event.target
                .value as WeatherPreferences["mode"],
            })
          }
        >
          <option value="automatic">Automatic location</option>
          <option value="manual">Manual city</option>
          <option value="disabled">Weather disabled</option>
        </select>

        {preferences.mode === "manual" ? (
          <input
            className="weather-control"
            value={preferences.manualCity}
            placeholder="Enter city, e.g. Houston"
            onChange={(event) =>
              onUpdatePreferences({
                ...preferences,
                manualCity: event.target.value,
              })
            }
          />
        ) : (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <MapPin size={14} />
            {preferences.mode === "disabled"
              ? "Using seasonal preferences"
              : "Location is used only for weather retrieval"}
          </div>
        )}

        <span className="weather-source-chip">
          {status === "ready"
            ? "Live"
            : status === "fallback"
              ? "Fallback"
              : "Updating"}
        </span>
      </div>

      {error ? (
        <p className="mt-4 text-xs text-[var(--warning)]">
          {error}
        </p>
      ) : null}
      <p className="mt-4 text-[.62rem] text-[var(--muted)]">
        Weather data by Open-Meteo.
      </p>
    </section>
  );
}

function WeatherMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="weather-metric rounded-[20px] border border-[var(--border)] p-4">
      <div className="flex items-center gap-2 text-[var(--gold)]">
        {icon}
        <p className="text-[.52rem] font-bold uppercase tracking-[.12em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-3 text-3xl text-[var(--gold-bright)]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {detail}
      </p>
    </div>
  );
}
