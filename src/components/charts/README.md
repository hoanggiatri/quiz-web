# Chart Components

A collection of simple chart components for data visualization in React applications.

## Available Components

### BarChart

A bar chart component for visualizing data with vertical bars.

```tsx
import { BarChart } from '@/components/charts';
import type { ChartDataItem } from '@/types/chart';

const data: ChartDataItem[] = [
  { label: "Category A", value: 85 },
  { label: "Category B", value: 92 },
  { label: "Category C", value: 78 }
];

<BarChart 
  data={data}
  height={180}  // Optional, default is 150px
  legend={true} // Optional, show legend
  title="My Bar Chart" // Optional
/>
```

### PieChart

A pie chart component for visualizing proportions.

```tsx
import { PieChart } from '@/components/charts';
import type { ChartDataItem } from '@/types/chart';

const data: ChartDataItem[] = [
  { name: "Segment A", value: 35, label: "Segment A" },
  { name: "Segment B", value: 25, label: "Segment B" },
  { name: "Segment C", value: 40, label: "Segment C" }
];

<PieChart 
  data={data}
  size={180}   // Optional, default is 120px
  legend={true} // Optional, show legend
  title="My Pie Chart" // Optional
/>
```

### LineChart

A line chart component for visualizing trends over time or categories.

```tsx
import { LineChart } from '@/components/charts';
import type { ChartDataItem } from '@/types/chart';

const data: ChartDataItem[] = [
  { label: "Jan", value: 30 },
  { label: "Feb", value: 45 },
  { label: "Mar", value: 60 },
  { label: "Apr", value: 52 },
  { label: "May", value: 75 }
];

<LineChart 
  data={data}
  height={100} // Optional, default is 100px
  title="My Line Chart" // Optional
/>
```

## Data Format

All charts use the same data format defined in `src/types/chart.ts`:

```typescript
interface ChartDataItem {
  label?: string; // Label for the data point
  value: number;  // Value of the data point (required)
  name?: string;  // Alternative name for the legend
}
```

## Styling

Chart colors are defined using CSS variables in `src/components/charts/styles.css`:

```css
:root {
  --chart-1: rgba(79, 70, 229, 1); /* Indigo */
  --chart-2: rgba(16, 185, 129, 1); /* Emerald */
  --chart-3: rgba(245, 158, 11, 1); /* Amber */
  --chart-4: rgba(239, 68, 68, 1);  /* Red */
  --chart-5: rgba(168, 85, 247, 1); /* Purple */
}

.dark {
  --chart-1: rgba(165, 180, 252, 1); /* Light Indigo */
  --chart-2: rgba(110, 231, 183, 1);  /* Light Emerald */
  --chart-3: rgba(252, 211, 77, 1);  /* Light Amber */
  --chart-4: rgba(252, 165, 165, 1); /* Light Red */
  --chart-5: rgba(216, 180, 254, 1); /* Light Purple */
}
```

You can customize these colors by overriding these CSS variables in your own stylesheets. 