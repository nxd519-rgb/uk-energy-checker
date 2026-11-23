
"use client";

import { useEffect, useRef, useState } from "react"; const [mapReady, setMapReady] = useState(false);
type ChargerLocation = {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  coordinates?: {
    latitude: string;
    longitude: string;
  };
  evses?: {
    uid: string;
    status: string;
    connectors?: {
      standard?: string;
      power_type?: string;
      max_electric_power?: number;
    }[];
  }[];
};

export default function EVChargingMap() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const [locations, setLocations] = useState<ChargerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  async function loadChargers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chargers", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !Array.isArray(data.locations)) {
        throw new Error(data.error || "Unable to load charging locations.");
      }

      setLocations(data.locations);
      setLastUpdated(new Date().toLocaleTimeString("en-GB"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load chargers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChargers();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialiseMap() {
      if (!mapElement.current || mapInstance.current) return;

      const L = await import("leaflet");

      if (cancelled || !mapElement.current) return;

      const map = L.map(mapElement.current).setView([54.5, -3], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      markersLayer.current = L.layerGroup().addTo(map);
    }

    initialiseMap();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersLayer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function updateMarkers() {
      if (!mapInstance.current || !markersLayer.current) return;

      const L = await import("leaflet");

      if (cancelled) return;

      markersLayer.current.clearLayers();

      const bounds: [number, number][] = [];

      locations.forEach((location) => {
        const latitude = Number(location.coordinates?.latitude);
        const longitude = Number(location.coordinates?.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

        const position: [number, number] = [latitude, longitude];
        bounds.push(position);

        const statuses = location.evses?.map((evse) => evse.status) ?? [];
        const available = statuses.filter(
          (status) => status === "AVAILABLE"
        ).length;
        const total = statuses.length;

        const marker = L.marker(position);

        const popup = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = location.name || "Charging station";
        popup.appendChild(title);

        const address = document.createElement("p");
        address.textContent = [
          location.address,
          location.city,
          location.postal_code,
        ].filter(Boolean).join(", ");
        popup.appendChild(address);

        const status = document.createElement("p");
        status.textContent = total
          ? `${available} available EVSEs out of ${total}`
          : "Availability information not supplied";
        popup.appendChild(status);

        marker.bindPopup(popup);
        marker.addTo(markersLayer.current);
      });

      if (bounds.length === 1) {
        mapInstance.current.setView(bounds[0], 13);
      } else if (bounds.length > 1) {
        mapInstance.current.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    updateMarkers();

    return () => {
      cancelled = true;
    };
  }, [locations]);

  const totalStations = locations.length;

  return (
    <section className="my-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            UK Public EV Charging Finder
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Explore charging locations supplied by PLUG Charging.
          </p>
        </div>

        <button
          onClick={loadChargers}
          disabled={loading}
          className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh chargers"}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
          {totalStations} charging locations loaded
        </span>
        {lastUpdated && (
          <span className="px-2 py-2 text-gray-500">
            Updated at {lastUpdated}
          </span>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div
        ref={mapElement}
        className="z-0 h-[500px] w-full rounded-xl border border-gray-200"
      />

      <p className="mt-3 text-xs text-gray-500">
        Map data © OpenStreetMap contributors. Charging data supplied by PLUG
        Charging. Availability depends on the information provided by the
        network.
      </p>
    </section>
  );
}
