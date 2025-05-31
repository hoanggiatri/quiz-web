import React from "react";
import type { LineChartProps } from "@/types/chart";
import type { ChartDataItem } from "@/types/chart";
import "./styles.css";

/**
 * Simple line chart component for data visualization
 */
const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 100
}) => {
  if (!data || data.length === 0) return null;
  
  const values = data.map((d: ChartDataItem) => d.value);
  const labels = data.map((d: ChartDataItem) => d.label || '');
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  
  const normalizedValues = values.map((val: number) => 
    range === 0 ? 0.5 : (val - minValue) / range
  );
  
  // Generate points for SVG path
  const points = normalizedValues.map((val: number, i: number) => 
    `${(i / (normalizedValues.length - 1)) * 100}% ${(1 - val) * height}px`
  ).join(' L ');
  
  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <div 
        className="relative w-full" 
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="border-t border-dashed border-muted-foreground/20 h-0"></div>
          <div className="border-t border-dashed border-muted-foreground/20 h-0"></div>
          <div className="border-t border-dashed border-muted-foreground/20 h-0"></div>
        </div>
        
        {/* Line path */}
        <svg 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d={`M 0 ${(1 - normalizedValues[0]) * height} L ${points}`}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {normalizedValues.map((val: number, i: number) => (
            <circle
              key={i}
              cx={`${(i / (normalizedValues.length - 1)) * 100}%`}
              cy={`${(1 - val) * height}px`}
              r="3"
              fill="var(--card)"
              stroke="var(--chart-1)"
              strokeWidth="2"
              className="transition-all duration-300 hover:r-4 line-chart-point"
            />
          ))}
        </svg>
        
        {/* Area under the line */}
        <svg 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
          <path
            d={`M 0 ${(1 - normalizedValues[0]) * height} L ${points} L 100% ${height}px L 0 ${height}px Z`}
            fill="url(#lineGradient)"
          />
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {labels.map((label: string, i: number) => (
          <span key={i} className="text-xs text-muted-foreground">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LineChart; 