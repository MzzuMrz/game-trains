/**
 * Real station data for the Tucumán - Retiro railway line
 * Based on the Ferrocarril General Bartolomé Mitre route
 */

export const stations = [
  {
    name: "San Miguel de Tucumán",
    km: 0,
    stopDuration: 300,
    province: "Tucumán",
    zone: "subtropical",
    elevation: 450
  },
  {
    name: "Banda del Río Salí",
    km: 12,
    stopDuration: 60,
    province: "Tucumán",
    zone: "subtropical",
    elevation: 420
  },
  {
    name: "La Cocha",
    km: 155,
    stopDuration: 90,
    province: "Tucumán",
    zone: "subtropical",
    elevation: 380
  },
  {
    name: "Santiago del Estero",
    km: 342,
    stopDuration: 180,
    province: "Santiago del Estero",
    zone: "semi-arid",
    elevation: 200
  },
  {
    name: "La Banda",
    km: 345,
    stopDuration: 60,
    province: "Santiago del Estero",
    zone: "semi-arid",
    elevation: 195
  },
  {
    name: "Pinto",
    km: 465,
    stopDuration: 90,
    province: "Santiago del Estero",
    zone: "semi-arid",
    elevation: 180
  },
  {
    name: "Ceres",
    km: 738,
    stopDuration: 120,
    province: "Santa Fe",
    zone: "pampas",
    elevation: 88
  },
  {
    name: "Rafaela",
    km: 862,
    stopDuration: 120,
    province: "Santa Fe",
    zone: "pampas",
    elevation: 92
  },
  {
    name: "Rosario Norte",
    km: 1080,
    stopDuration: 240,
    province: "Santa Fe",
    zone: "pampas",
    elevation: 25
  },
  {
    name: "San Nicolás",
    km: 1171,
    stopDuration: 90,
    province: "Buenos Aires",
    zone: "urban",
    elevation: 18
  },
  {
    name: "Retiro",
    km: 1298,
    stopDuration: 0,
    province: "Buenos Aires",
    zone: "urban",
    elevation: 5
  }
];

export const TOTAL_DISTANCE = 1298; // km
export const ESTIMATED_JOURNEY_TIME = 24 * 60 * 60; // 24 hours in seconds
