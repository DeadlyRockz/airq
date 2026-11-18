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
import type {
  ActivityGoal,
  AqiScale,
  CommuteMode,
  IndoorFuelSource,
  SensitivityGroup,
  UserContext,
} from "@/lib/aqi/types";

type CitySuggestion = {
  label: string;
  latitude: number;
  longitude: number;
};

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
 * Interactive form for configuring city location (with browser geolocation & search suggestions),
 * AQI scale, sensitivity, commute mode, and indoor environment context.
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
              placeholder="Type a city (e.g. Thanjavur, London)"
              value={context.locationLabel}
              onFocus={() => setShowSuggestions(true)}
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
                role="listbox"
                aria-label="City suggestions"
                className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
              >
                {suggestions.map((item) => (
                  <Button
                    key={`${item.label}-${item.latitude}-${item.longitude}`}
                    type="button"
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

          {locationHint && <p className="text-xs text-muted-foreground">{locationHint}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aqi-scale">AQI Scale</Label>
          <Select
            value={context.preferredScale}
            onValueChange={(v) => updateField("preferredScale", v as AqiScale)}
          >
            <SelectTrigger id="aqi-scale">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INDIA_CPCB">India CPCB AQI (0–500)</SelectItem>
              <SelectItem value="US_EPA">US EPA AQI (0–500)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sensitivity-group">Health & Sensitivity Group</Label>
          <Select
            value={context.sensitivityGroup}
            onValueChange={(v) => updateField("sensitivityGroup", v as SensitivityGroup)}
          >
            <SelectTrigger id="sensitivity-group">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Adult</SelectItem>
              <SelectItem value="sensitive_respiratory">
                Asthma / Respiratory Sensitivity
              </SelectItem>
              <SelectItem value="children_elderly">Children or Older Adults</SelectItem>
              <SelectItem value="outdoor_worker">Outdoor Worker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="activity-goal">Primary Plan Today</Label>
          <Select
            value={context.activityGoal}
            onValueChange={(v) => updateField("activityGoal", v as ActivityGoal)}
          >
            <SelectTrigger id="activity-goal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commute">Daily Commute</SelectItem>
              <SelectItem value="outdoor_exercise">Outdoor Exercise</SelectItem>
              <SelectItem value="errands">Short Errands</SelectItem>
              <SelectItem value="indoor_day">Mostly Indoors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="commute-mode">Travel Mode</Label>
          <Select
            value={context.commuteMode}
            onValueChange={(v) => updateField("commuteMode", v as CommuteMode)}
          >
            <SelectTrigger id="commute-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk_cycle">Walking or Cycling</SelectItem>
              <SelectItem value="public_transit">Public Transit</SelectItem>
              <SelectItem value="car_ac_recirculate">Car (AC Recirculate)</SelectItem>
              <SelectItem value="work_from_home">Work from Home</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="indoor-fuel">Indoor Cooking / Fuel Source</Label>
          <Select
            value={context.indoorFuelSource}
            onValueChange={(v) => updateField("indoorFuelSource", v as IndoorFuelSource)}
          >
            <SelectTrigger id="indoor-fuel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none_electric">Electric / Induction Only</SelectItem>
              <SelectItem value="gas_stove_unvented">
                Gas Stove (Unvented or Low Exhaust)
              </SelectItem>
              <SelectItem value="solid_fuel_or_kerosene">Solid Fuel or Kerosene</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
