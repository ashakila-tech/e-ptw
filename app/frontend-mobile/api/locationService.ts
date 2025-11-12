import { apiFetch } from "./client";

export const fetchLocations = () =>
  apiFetch("api/locations/");

export const fetchLocationManagersByLocation = (locationId: number) =>
  apiFetch(`api/location-managers/filter?location_id=${locationId}`);