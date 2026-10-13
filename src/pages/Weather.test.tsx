import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Weather from "./Weather";

vi.mock("@/components/AppNav", () => ({ default: () => null }));
const preference = vi.hoisted(() => ({ loading: false, allowed: true }));
vi.mock("@/hooks/useLocationPreference", () => ({ useLocationPreference: () => preference }));

afterEach(() => { preference.allowed = true; vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("fetches a fresh forecast when refreshing at the same coordinates", async () => {
  const forecast = { current: { temperature_2m: 24, apparent_temperature: 24, relative_humidity_2m: 70, wind_speed_10m: 5, weather_code: 0 }, daily: { time: ["2026-10-13"], temperature_2m_min: [18], temperature_2m_max: [26], precipitation_sum: [2], weather_code: [0] } };
  const fetchMock = vi.fn(async (url: string) => ({ ok: true, json: async () => url.includes("forecast?") ? forecast : { locality: "Kigali" } }));
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (success: PositionCallback) => success({ coords: { latitude: -1.95, longitude: 30.11 } } as GeolocationPosition) } });
  render(<Weather />);
  const refresh = await screen.findByRole("button", { name: "Vugurura" });
  await waitFor(() => expect(refresh).not.toBeDisabled());
  const before = fetchMock.mock.calls.filter(([url]) => url.includes("forecast?")).length;
  fireEvent.click(refresh);
  await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url.includes("forecast?")).length).toBeGreaterThan(before));
  await waitFor(() => expect(refresh).not.toBeDisabled());
});

it("does not request GPS when location use is disabled", async () => {
  preference.allowed = false;
  const getCurrentPosition = vi.fn();
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
  render(<Weather />);
  await screen.findByText("Kigali — GPS ntikoreshwa");
  expect(getCurrentPosition).not.toHaveBeenCalled();
});