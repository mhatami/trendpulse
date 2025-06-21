// src/components/PriceChart.jsx
// This component displays a line chart of stock prices using Recharts.
// Very basic chart using SVG - placeholder
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { preprocessChartDate, formatDateLabel, resetDateLabelTracker } from '../utils/dateUtils';

export default function PriceChart({ data,  period }) {
  resetDateLabelTracker(); // <-- Add this line
  const chartData = preprocessChartDate(data);

  // Y-axis tick calculation
  const closePrices = chartData.map((d) => d.Close);
  const minClose = Math.min(...closePrices);
  const maxClose = Math.max(...closePrices);
  const tickStep = maxClose - minClose > 100 ? 20 : maxClose - minClose > 50 ? 10 : 5;
  const minTick = Math.floor(minClose / tickStep) * tickStep;
  const maxTick = Math.ceil(maxClose / tickStep) * tickStep;
  const yTicks = Array.from(
    { length: Math.floor((maxTick - minTick) / tickStep) + 1 },
    (_, i) => minTick + i * tickStep
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="Date"
          tickFormatter={(value) => formatDateLabel(value, period)}
          tick={{ fontSize: 10 }}
          minTickGap={20}
          interval={Math.floor(chartData.length / 6)}
        //  interval={"preserveStartEnd"}
        />
        <YAxis
          domain={[minTick, maxTick]}
          tick={{ fontSize: 10 }}
          ticks={yTicks}
          width={60}
        />
        <Tooltip
          labelFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleString('en-US');
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="Close" stroke="#2563eb" strokeWidth={2} dot={false} name="Price" />
      </LineChart>
    </ResponsiveContainer>
  );
}
