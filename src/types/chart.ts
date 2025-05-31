/**
 * Common interfaces for chart components
 */

// Base data item for all charts
export interface ChartDataItem {
  label?: string;
  value: number;
  name?: string;
}

// Props for the bar chart component
export interface BarChartProps {
  data: ChartDataItem[];
  title?: string;
  legend?: boolean;
  height?: number;
}

// Props for the pie chart component
export interface PieChartProps {
  data: ChartDataItem[];
  title?: string;
  legend?: boolean;
  size?: number;
}

// Props for the line chart component
export interface LineChartProps {
  data: ChartDataItem[];
  title?: string;
  height?: number;
}
