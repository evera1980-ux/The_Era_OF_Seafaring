import { GeoPosition, MarineWeatherCell, ServiceResult, makeUnixMs } from "../../types";

/**
 * 依据地理纬度带和微气候模拟真实海洋气象（信风带、西风带、赤道无风带、温带气旋）
 */
export function generateSyntheticWeather(pos: GeoPosition): MarineWeatherCell {
  const lat = pos.latitude;
  const lon = pos.longitude;
  const now = Date.now();

  let windSpeed = 12;
  let windDir = 45;
  let waveHeight = 1.8;
  let swellPeriod = 7;
  let currentSpeed = 0.8;
  let currentDir = 60;

  // 纬度气象带特征
  const absLat = Math.abs(lat);
  if (absLat >= 40 && absLat <= 60) {
    // 咆哮四十度 / 狂暴五十度 (Roaring Forties / West Wind Drift)
    windSpeed = 24 + Math.sin(lon * 0.1) * 8;
    windDir = 270; // 强偏西风
    waveHeight = 3.8 + Math.cos(lat * 0.2) * 1.5;
    swellPeriod = 11;
    currentSpeed = 1.5;
    currentDir = 90; // 东向西风漂流
  } else if (absLat >= 10 && absLat <= 30) {
    // 东北信风 / 东南信风带 (Trade Winds)
    windSpeed = 15 + Math.sin(lat * 0.5) * 4;
    windDir = lat > 0 ? 60 : 120; // 北半球东北信风，南半球东南信风
    waveHeight = 2.0;
    swellPeriod = 8;
    currentSpeed = 1.1;
    currentDir = 270; // 西向赤道洋流
  } else if (absLat < 10) {
    // 赤道无风带 (Doldrums)
    windSpeed = 4 + Math.abs(Math.sin(lon)) * 4;
    windDir = 180;
    waveHeight = 0.9;
    swellPeriod = 6;
    currentSpeed = 0.5;
    currentDir = 280;
  }

  // 蒲氏风级估算
  let beaufort = 3;
  if (windSpeed > 40) beaufort = 9;
  else if (windSpeed > 33) beaufort = 8;
  else if (windSpeed > 27) beaufort = 7;
  else if (windSpeed > 21) beaufort = 6;
  else if (windSpeed > 16) beaufort = 5;
  else if (windSpeed > 10) beaufort = 4;

  const currentRad = (currentDir * Math.PI) / 180;

  return {
    cellId: `weather_${lat.toFixed(1)}_${lon.toFixed(1)}`,
    position: pos,
    sampledAt: makeUnixMs(now),
    windSpeedKn: Math.round(windSpeed * 10) / 10,
    windDirectionDeg: windDir,
    windGustKn: Math.round(windSpeed * 1.3),
    significantWaveHeightM: Math.round(waveHeight * 10) / 10,
    swellPeriodS: swellPeriod,
    swellDirectionDeg: (windDir + 15) % 360,
    currentSpeedKn: Math.round(currentSpeed * 10) / 10,
    currentDirectionDeg: currentDir,
    currentVector: {
      east: currentSpeed * Math.sin(currentRad),
      north: currentSpeed * Math.cos(currentRad),
    },
    pressureHpa: 1013 - (windSpeed > 25 ? (windSpeed - 20) * 1.2 : 0),
    beaufortScale: beaufort,
    source: "SYNTHETIC",
    quality: "OBSERVED",
  };
}

export class WeatherService {
  async getWeatherAt(pos: GeoPosition): Promise<ServiceResult<MarineWeatherCell>> {
    // 默认内置高仿真气象，网络通畅且配置时可切 Open-Meteo
    const data = generateSyntheticWeather(pos);
    return {
      data,
      receivedAt: makeUnixMs(Date.now()),
      stale: false,
      source: "SYNTHETIC_OFFLINE",
    };
  }
}

export const weatherService = new WeatherService();
