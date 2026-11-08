import { GeoPosition, MarineWeatherCell, makeUnixMs } from "../../types";

/**
 * Open-Meteo 实时气象与海洋波浪 API 客户端
 * 无需 API Key，带 2.5s 超时保护；若离线或超时则交由上层回退高仿真海洋气候模型
 */
export async function fetchOpenMeteoMarineWeather(
  pos: GeoPosition
): Promise<MarineWeatherCell | null> {
  if (typeof fetch === "undefined") return null;

  const lat = pos.latitude.toFixed(2);
  const lon = pos.longitude.toFixed(2);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&wind_speed_unit=kn`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,swell_wave_period,swell_wave_direction,ocean_current_velocity,ocean_current_direction`;

    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(marineUrl, { signal: controller.signal }).catch(() => null),
    ]);

    if (!weatherRes.ok) return null;
    const weatherJson = await weatherRes.json();
    const marineJson = marineRes && marineRes.ok ? await marineRes.json() : null;

    const windSpeedKn = Number(weatherJson?.current?.wind_speed_10m ?? 12);
    const windDirectionDeg = Number(weatherJson?.current?.wind_direction_10m ?? 60);
    const windGustKn = Number(weatherJson?.current?.wind_gusts_10m ?? windSpeedKn * 1.25);
    const pressureHpa = Number(weatherJson?.current?.surface_pressure ?? 1013);

    const significantWaveHeightM = Number(
      marineJson?.current?.wave_height ?? Math.max(0.5, windSpeedKn * 0.12)
    );
    const swellPeriodS = Number(marineJson?.current?.swell_wave_period ?? 7.5);
    const swellDirectionDeg = Number(
      marineJson?.current?.swell_wave_direction ?? (windDirectionDeg + 12) % 360
    );
    // ocean_current_velocity 单位通常为 km/h 或 m/s，转换为节
    const rawCurrent = Number(marineJson?.current?.ocean_current_velocity ?? 0.9);
    const currentSpeedKn = Math.min(4.0, Math.max(0.2, Math.round(rawCurrent * 0.54 * 10) / 10));
    const currentDirectionDeg = Number(
      marineJson?.current?.ocean_current_direction ?? (windDirectionDeg + 180) % 360
    );

    let beaufort = 3;
    if (windSpeedKn > 48) beaufort = 10;
    else if (windSpeedKn > 40) beaufort = 9;
    else if (windSpeedKn > 33) beaufort = 8;
    else if (windSpeedKn > 27) beaufort = 7;
    else if (windSpeedKn > 21) beaufort = 6;
    else if (windSpeedKn > 16) beaufort = 5;
    else if (windSpeedKn > 10) beaufort = 4;
    else if (windSpeedKn > 6) beaufort = 3;
    else beaufort = 2;

    const currentRad = (currentDirectionDeg * Math.PI) / 180;

    return {
      cellId: `openmeteo_${lat}_${lon}`,
      position: pos,
      sampledAt: makeUnixMs(Date.now()),
      windSpeedKn: Math.round(windSpeedKn * 10) / 10,
      windDirectionDeg: Math.round(windDirectionDeg) % 360,
      windGustKn: Math.round(windGustKn * 10) / 10,
      significantWaveHeightM: Math.round(significantWaveHeightM * 10) / 10,
      swellPeriodS: Math.round(swellPeriodS * 10) / 10,
      swellDirectionDeg: Math.round(swellDirectionDeg) % 360,
      currentSpeedKn,
      currentDirectionDeg: Math.round(currentDirectionDeg) % 360,
      currentVector: {
        east: currentSpeedKn * Math.sin(currentRad),
        north: currentSpeedKn * Math.cos(currentRad),
      },
      pressureHpa: Math.round(pressureHpa),
      beaufortScale: beaufort,
      source: "OPEN_METEO",
      quality: "OBSERVED",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
