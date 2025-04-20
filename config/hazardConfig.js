// config/hazardConfig.js
import { CloudRain, Thermometer } from "lucide-react";

export const hazardConfig = [
  {
    title: "Rainfall",
    slug: "rainfall",
    icon: CloudRain,
    periods: [
      { label: "Daily", value: "daily", needsDate: true },
      { label: "Monthly", value: "monthly", needsDate: true },
      { label: "Seasonal", value: "belg", needsDate: false },
      { label: "Annual", value: "annual", needsDate: true },
    ],
  },
  {
    title: "Temperature",
    slug: "temperature",
    icon: Thermometer,
    periods: [
      { label: "Daily", value: "daily", needsDate: true },
      { label: "Monthly", value: "monthly", needsDate: true },
      { label: "Seasonal", value: "summer", needsDate: false },
      { label: "Annual", value: "annual", needsDate: true },
    ],
  },
];