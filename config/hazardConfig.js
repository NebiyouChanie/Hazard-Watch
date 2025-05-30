
import { CloudRain, Thermometer } from "lucide-react";

export const hazardConfig = [
  {
    title: "Rainfall",
    slug: "rainfall",
    icon: CloudRain,
    periods: [
      { label: "Daily", value: "daily", needsDate: true },
      { label: "Monthly", value: "monthly", needsDate: true },
      { label: "Seasonal", value: "seasonal", needsDate: false },
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
      { label: "Seasonal", value: "seasonal", needsDate: false },
      { label: "Annual", value: "annual", needsDate: true },
    ],
  },
];