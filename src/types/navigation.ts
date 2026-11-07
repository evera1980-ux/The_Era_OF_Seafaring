import { GeoPosition, Knots, NauticalMiles } from "./index";

export interface NavigationCalculations {
  headingDeg: number;
  cogDeg: number;
  sogKn: Knots;
  distanceNM: NauticalMiles;
  bearingDeg: number;
}

export interface PolarCurveSample {
  awaDeg: number;
  efficiency: number;
}

export interface LeewayCalculation {
  leewayDeg: number;
  apparentWindAngleDeg: number;
  apparentWindSpeedKn: number;
}
