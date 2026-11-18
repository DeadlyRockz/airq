"use client";

import { useEffect, useState } from "react";
import { Loader, LocateFixed, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserContext } from "@/lib/aqi/types";

type CitySuggestion = {
  label: string;
  latitude: number;
  longitude: number;
};

type SelectFieldKey =
  "preferredScale" | "sensitivityGroup" | "activityGoal" | "commuteMode" | "indoorFuelSource";

type SelectFieldConfig = {
  id: string;
  key: SelectFieldKey;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};

const SELECT_FIELDS: readonly SelectFieldConfig[] = [
  {
    id: "aqi-scale",
    key: "preferredScale",
    label: "AQI Scale",
    options: [
      { value: "INDIA_CPCB", label: "India CPCB AQI (0–500)" },
      { value: "US_EPA", label: "US EPA AQI (0–500)" },
    ],
  },
  {
    id: "sensitivity-group",
    key: "sensitivityGroup",
    label: "Health & Sensitivity Group",
    options: [
      { value: "general", label: "General Adult" },
      {
        value: "sensitive_respiratory",
        label: "Asthma / Respiratory Sensitivity",
      },
      { value: "children_elderly", label: "Children or Older Adults" },
      { value: "outdoor_worker", label: "Outdoor Worker" },
    ],
  },
  {
    id: "activity-goal",
    key: "activityGoal",
    label: "Primary Plan Today",
    options: [
      { value: "commute", label: "Daily Commute" },
      { value: "outdoor_exercise", label: "Outdoor Exercise" },
      { value: "errands", label: "Short Errands" },
      { value: "indoor_day", label: "Mostly Indoors" },
    ],
  },
  {
    id: "commute-mode",
    key: "commuteMode",
    label: "Travel Mode",
    options: [
      { value: "walk_cycle", label: "Walking or Cycling" },
      { value: "public_transit", label: "Public Transit" },
      { value: "car_ac_recirculate", label: "Car (AC Recirculate)" },
      { value: "work_from_home", label: "Work from Home" },
    ],
  },
  {
    id: "indoor-fuel",
    key: "indoorFuelSource",
    label: "Indoor Cooking / Fuel Source",
    options: [
      { value: "none_electric", label: "Electric / Induction Only" },
      {
        value: "gas_stove_unvented",
        label: "Gas Stove (Unvented or Low Exhaust)",
      },
      { value: "solid_fuel_or_kerosene", label: "Solid Fuel or Kerosene" },
    ],
  },
];

type ContextBuilderFormProps = {
  context: UserContext;
  isLoading: boolean;
  isLocating: boolean;
  locationHint?: string;
  onContextChange: (next: UserContext) => void;
  onRequestLocation: () => void;
  onSelectCity: (next: UserContext) => void;
  onSubmit: () => void;
};

/**
 * Interactive form for configuring city location (with browser geolocation and search
 * suggestions), AQI scale, sensitivity, commute mode, and indoor environment context.
 *
 * @param props - Controlled form state and event handlers.
 * @returns ContextBuilderForm card.
 * @example
 * <ContextBuilderForm context={context} isLoading={false} isLocating={false} ... />
 */
export function ContextBuilderForm({
  context,
  isLoading,
  isLocating,
  locationHint,
  onContextChange,
  onRequestLocation,
  onSelectCity,
  onSubmit,
}: ContextBuilderFormProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const updateField = <K extends keyof UserContext>(key: K, value: UserContext[K]) => {
    onContextChange({ ...context, [key]: value });
  };

  useEffect(() => {
    const query = context.locationLabel.trim();
    if (!showSuggestions || query.length < 2 || context.coordinates) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: CitySuggestion[] };
        setSuggestions(data.suggestions ?? []);
      } catch {
        // Ignore aborted or failed suggestion requests.
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [context.locationLabel, context.coordinates, showSuggestions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold">
          <SlidersHorizontal className="size-4 text-primary" />
          Your Context
        </CardTitle>
        <CardDescription>
          Uses your browser location or city search for live air quality, with labeled sample data
          as fallback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="city-input">City or Urban Area</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLocating || isLoading}
              onClick={onRequestLocation}
            >
              {isLocating ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <LocateFixed className="size-4" />
              )}
              Use My Location
            </Button>
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
            <Input
              id="city-input"
              className="pl-9"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls="city-suggestions-listbox"
              placeholder="Type a city (e.g. Thanjavur, London)"
              value={context.locationLabel}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              onChange={(e) => {
                setShowSuggestions(true);
                onContextChange({
                  ...context,
                  locationLabel: e.target.value,
                  coordinates: undefined,
                });
              }}
            />

            {showSuggestions && suggestions.length > 0 && (
              <div
                id="city-suggestions-listbox"
                role="listbox"
                aria-label="City suggestions"
                className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
              >
                {suggestions.map((item) => (
                  <Button
                    key={`${item.label}-${item.latitude}-${item.longitude}`}
                    type="button"
                    role="option"
                    aria-selected={context.locationLabel === item.label}
                    variant="ghost"
                    className="h-auto w-full justify-start px-3 py-2 text-left text-sm font-normal"
                    onClick={() => {
                      const nextContext: UserContext = {
                        ...context,
                        locationLabel: item.label,
                        coordinates: {
                          latitude: item.latitude,
                          longitude: item.longitude,
                        },
                      };
                      setSuggestions([]);
                      setShowSuggestions(false);
                      onSelectCity(nextContext);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {locationHint && (
            <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
              {locationHint}
            </p>
          )}
        </div>

        {SELECT_FIELDS.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={context[field.key]}
              onValueChange={(value) =>
                updateField(field.key, value as UserContext[typeof field.key])
              }
            >
              <SelectTrigger id={field.id}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={context.hasHepaPurifier ? "secondary" : "outline"}
            onClick={() => updateField("hasHepaPurifier", !context.hasHepaPurifier)}
          >
            {context.hasHepaPurifier ? "HEPA Purifier: Yes" : "HEPA Purifier: No"}
          </Button>
          <Button
            type="button"
            variant={context.hasIndoorSensor ? "secondary" : "outline"}
            onClick={() => updateField("hasIndoorSensor", !context.hasIndoorSensor)}
          >
            {context.hasIndoorSensor ? "Indoor Sensor: Yes" : "Indoor Sensor: No"}
          </Button>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={isLoading || !context.locationLabel.trim()}
          onClick={() => {
            setShowSuggestions(false);
            onSubmit();
          }}
        >
          {isLoading && <Loader className="size-4 animate-spin" />}
          Check Air Quality
        </Button>
      </CardContent>
    </Card>
  );
}
