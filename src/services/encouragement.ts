import type { EncouragementStyle } from "../types/models";

export const encouragements: Record<EncouragementStyle, string[]> = {
  calm: [
    "You showed up. That counts.",
    "Still here when you're ready.",
    "Tiny steps still move you forward."
  ],
  cheerleader: [
    "Starting is often the hardest part.",
    "Progress noted.",
    "You made space for this."
  ],
  funny: [
    "Good enough works for now.",
    "Step recorded.",
    "Completed and logged."
  ],
  straightforward: [
    "That counts.",
    "You made progress.",
    "Pause, reset, continue when ready."
  ]
};

export function getEncouragement(style: EncouragementStyle = "calm") {
  const options = encouragements[style];
  return options[Math.floor(Math.random() * options.length)];
}
