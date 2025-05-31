import React, { useState, useEffect } from "react";
import type { PieChartProps } from "@/types/chart";
import { useTheme } from "@/components/theme-provider";
import "./styles.css";

/**
 * Simple pie chart component for data visualization
 */
const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  legend,
  size = 120
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="flex flex-col items-center w-full">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={size/2 - 2} 
            fill="var(--muted)" 
            opacity="0.1" 
          />
          {data.map((item, index) => {
            const percentage = item.value / total;
            const startAngle = currentAngle;
            const endAngle = currentAngle + percentage * 360;
            currentAngle = endAngle;
            
            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = size/2 + (size/2 - 2) * Math.cos(startAngleRad);
            const y1 = size/2 + (size/2 - 2) * Math.sin(startAngleRad);
            const x2 = size/2 + (size/2 - 2) * Math.cos(endAngleRad);
            const y2 = size/2 + (size/2 - 2) * Math.sin(endAngleRad);
            
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            const pathData = [
              `M ${size/2} ${size/2}`,
              `L ${x1} ${y1}`,
              `A ${size/2 - 2} ${size/2 - 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            return (
              <path 
                key={index} 
                d={pathData}
                fill={`var(--chart-${(index % 5) + 1})`}
                className={`transition-opacity duration-300 hover:opacity-80 ${theme === 'dark' ? 'opacity-90' : 'opacity-100'} pie-slice`}
              />
            );
          })}
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={size/4} 
            fill="var(--card)" 
            className="drop-shadow-sm"
          />
          <text
            x={size/2}
            y={size/2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-current text-foreground font-medium"
            fontSize={size/8}
          >
            {data.length > 0 ? `${Math.round((data[0].value / total) * 100)}%` : "0%"}
          </text>
        </svg>
      </div>
      {legend && (
        <div className="flex flex-wrap justify-center mt-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: `var(--chart-${(index % 5) + 1})` }}
              ></div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PieChart; 