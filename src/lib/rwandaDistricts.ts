import type { District } from "./types";

// All 30 districts of Rwanda, grouped by province.
// Source: Government of Rwanda administrative divisions.
export const RWANDA_DISTRICTS: District[] = [
  // Kigali (City of Kigali) — 3 districts
  { name: "Gasabo", province: "Kigali" },
  { name: "Kicukiro", province: "Kigali" },
  { name: "Nyarugenge", province: "Kigali" },
  // Northern Province — 5 districts
  { name: "Burera", province: "Northern" },
  { name: "Gakenke", province: "Northern" },
  { name: "Gicumbi", province: "Northern" },
  { name: "Musanze", province: "Northern" },
  { name: "Rulindo", province: "Northern" },
  // Southern Province — 8 districts
  { name: "Gisagara", province: "Southern" },
  { name: "Huye", province: "Southern" },
  { name: "Kamonyi", province: "Southern" },
  { name: "Muhanga", province: "Southern" },
  { name: "Nyamagabe", province: "Southern" },
  { name: "Nyanza", province: "Southern" },
  { name: "Nyaruguru", province: "Southern" },
  { name: "Ruhango", province: "Southern" },
  // Eastern Province — 7 districts
  { name: "Bugesera", province: "Eastern" },
  { name: "Gatsibo", province: "Eastern" },
  { name: "Kayonza", province: "Eastern" },
  { name: "Kirehe", province: "Eastern" },
  { name: "Ngoma", province: "Eastern" },
  { name: "Nyagatare", province: "Eastern" },
  { name: "Rwamagana", province: "Eastern" },
  // Western Province — 7 districts
  { name: "Karongi", province: "Western" },
  { name: "Ngororero", province: "Western" },
  { name: "Nyabihu", province: "Western" },
  { name: "Nyamasheke", province: "Western" },
  { name: "Rubavu", province: "Western" },
  { name: "Rusizi", province: "Western" },
  { name: "Rutsiro", province: "Western" },
];

export const RWANDA_PROVINCES = [
  "Kigali",
  "Northern",
  "Southern",
  "Eastern",
  "Western",
] as const;
