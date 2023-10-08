// TODO: namespace units by entity (e.g. mash, water, etc.)
const unitDefaults: {[field: string]: {
  type?: string;
  default: string;
  canonical: string;
}} = {
  batchSize: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  tunVolume: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  tunWeight: {
    type: "mass",
    default: "lb",
    canonical: "kg"
  },
  tunLoss: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  tunSpecificHeat: {
    type: "energy/mass*temperature",
    default: "J/kg*C",
    canonical: "cal/kg*C"
  },
  lauterDeadspace: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  topUpWater: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  trubChillerLoss: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  evaporationRate: {
    type: "volume/time",
    default: "gal/h",
    canonical: "l/h"
  },
  kettleVol: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  miscLoss: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  extractEfficiency: {
    type: "percentage",
    default: null,
    canonical: null
  },
  grainAbsorptionRate: {
    type: "volume/mass",
    default: "qt/lb",
    canonical: "l/kg"
  },
  hopUtilization: {
    type: "percentage",
    default: null,
    canonical: null
  },
  controlledNumberWithUnitsTest: {
    default: "gal",
    canonical: "l"
  },
  calcium: {
    default: "ppm",
    canonical: "ppm"
  },
  bicarbonate: {
    default: "ppm",
    canonical: "ppm"
  },
  sulfate: {
    default: "ppm",
    canonical: "ppm",
  },
  chloride: {
    default: "ppm",
    canonical: "ppm"
  },
  sodium: {
    default: "ppm",
    canonical: "ppm"
  },
  magnesium: {
    default: "ppm",
    canonical: "ppm"
  },
  grainTemp: {
    type: "temperature",
    default: "F",
    canonical: "C"
  },
  tunTemp: {
    type: "temperature",
    default: "F",
    canonical: "C"
  },
  spargeTemp: {
    type: "temperature",
    default: "F",
    canonical: "C"
  },
  infuseAmount: {
    type: "volume",
    default: "gal",
    canonical: "l"
  },
  stepTemp: {
    type: "temperature",
    default: "F",
    canonical: "C"
  },
  stepTime: {
    type: "time",
    default: "min",
    canonical: "min"
  },
  rampTime: {
    type: "time",
    default: "min",
    canonical: "min"
  },
  endTemp: {
    type: "temperature",
    default: "F",
    canonical: "C"
  },

}

export default unitDefaults;