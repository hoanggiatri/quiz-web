import React from "react";
import type { BarChartProps } from "@/types/chart";
import "./styles.css";

/**
 * Simple bar chart component for data visualization
 */
const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  legend, 
  height = 150 
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <div 
        className="flex items-end justify-between h-[var(--chart-height)] space-x-2" 
        style={{ "--chart-height": `${height}px` } as React.CSSProperties}
      >
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-end flex-1">
            <div 
              className="w-full rounded-t-md transition-all duration-500 ease-in-out hover:opacity-80 bar-chart-bar"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: `var(--chart-${(index % 5) + 1})`,
                minHeight: '10px'
              }}
            ></div>
            <span className="text-xs text-center mt-1 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      {legend && (
        <div className="flex flex-wrap justify-center mt-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: `var(--chart-${(index % 5) + 1})` }}
              ></div>
              <span>{item.name || item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarChart; 