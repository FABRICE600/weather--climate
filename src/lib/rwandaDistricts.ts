import type { District } from "./types";

// All 30 districts of Rwanda, grouped by province. Coordinates are district centres.
export const RWANDA_DISTRICTS: District[] = [
  { name: "Gasabo", province: "Kigali", lat: -1.95, lon: 30.1 },
  { name: "Kicukiro", province: "Kigali", lat: -2.0, lon: 30.13 },
  { name: "Nyarugenge", province: "Kigali", lat: -1.97, lon: 30.06 },
  { name: "Burera", province: "Northern", lat: -1.49, lon: 29.81 },
  { name: "Gakenke", province: "Northern", lat: -1.69, lon: 29.79 },
  { name: "Gicumbi", province: "Northern", lat: -1.57, lon: 30.16 },
  { name: "Musanze", province: "Northern", lat: -1.48, lon: 29.64 },
  { name: "Rulindo", province: "Northern", lat: -1.73, lon: 29.77 },
  { name: "Gisagara", province: "Southern", lat: -2.58, lon: 29.62 },
  { name: "Huye", province: "Southern", lat: -2.37, lon: 29.74 },
  { name: "Kamonyi", province: "Southern", lat: -2.0, lon: 29.67 },
  { name: "Muhanga", province: "Southern", lat: -2.07, lon: 29.64 },
  { name: "Nyamagabe", province: "Southern", lat: -2.3, lon: 29.54 },
  { name: "Nyanza", province: "Southern", lat: -2.35, lon: 29.56 },
  { name: "Nyaruguru", province: "Southern", lat: -2.5, lon: 29.55 },
  { name: "Ruhango", province: "Southern", lat: -2.13, lon: 29.73 },
  { name: "Bugesera", province: "Eastern", lat: -2.1, lon: 30.1 },
  { name: "Gatsibo", province: "Eastern", lat: -1.6, lon: 30.2 },
  { name: "Kayonza", province: "Eastern", lat: -1.87, lon: 30.45 },
  { name: "Kirehe", province: "Eastern", lat: -2.2, lon: 30.6 },
  { name: "Ngoma", province: "Eastern", lat: -2.15, lon: 30.5 },
  { name: "Nyagatare", province: "Eastern", lat: -1.3, lon: 30.33 },
  { name: "Rwamagana", province: "Eastern", lat: -1.95, lon: 30.43 },
  { name: "Karongi", province: "Western", lat: -2.0, lon: 29.02 },
  { name: "Ngororero", province: "Western", lat: -2.0, lon: 29.25 },
  { name: "Nyabihu", province: "Western", lat: -1.67, lon: 29.5 },
  { name: "Nyamasheke", province: "Western", lat: -2.38, lon: 28.87 },
  { name: "Rubavu", province: "Western", lat: -1.68, lon: 29.34 },
  { name: "Rusizi", province: "Western", lat: -2.46, lon: 28.92 },
  { name: "Rutsiro", province: "Western", lat: -1.94, lon: 29.26 },
];

export const RWANDA_PROVINCES = [
  "Kigali",
  "Northern",
  "Southern",
  "Eastern",
  "Western",
] as const;
