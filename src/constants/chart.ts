/**
 * Chart-related constants
 */

// Default chart colors
export const DEFAULT_CHART_COLORS = {
  INDIGO: "rgba(79, 70, 229, 1)",
  EMERALD: "rgba(16, 185, 129, 1)",
  AMBER: "rgba(245, 158, 11, 1)",
  RED: "rgba(239, 68, 68, 1)",
  PURPLE: "rgba(168, 85, 247, 1)",
};

// Default chart dimensions
export const CHART_DIMENSIONS = {
  BAR_CHART_HEIGHT: 150,
  PIE_CHART_SIZE: 120,
  LINE_CHART_HEIGHT: 100,
};

// Chart types enum
export enum ChartType {
  BAR = "bar",
  PIE = "pie",
  LINE = "line",
}
