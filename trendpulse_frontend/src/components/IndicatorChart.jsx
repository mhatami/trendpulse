// IndicatorChart.jsx
import React from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatDateLabel, resetDateLabelTracker } from "../utils/dateUtils";

export default function IndicatorChart({ indicatorData, period, selectedIndicators }) {
  let data = indicatorData?.data || [];
  if (!data.length) return <p>No data to display.</p>;

  resetDateLabelTracker();
  const indicatorNames = selectedIndicators.map((i) => i.name);
  const has = (name) => indicatorNames.includes(name);

  // Find the last selected indicator (to show x-axis only on that chart)
  const chartOrder = ["Price", "RSI", "MACD", "ATR"];
  const chartsToShow = chartOrder.filter((chart) => {
    if (chart === "Price") return true;
    return has(chart);
  });
  const lastChart = chartsToShow.at(-1);

  return (
    <div>
      {/* === Price Chart === */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="Date"
            tickFormatter={(tick) => formatDateLabel(tick, period)}
            hide={lastChart !== "Price"}
          />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip labelFormatter={(label) => `Date: ${formatDateLabel(label, period)}`} />
          <Line type="monotone" dataKey="Close" stroke="#8884d8" dot={false} strokeWidth={2} name="Close Price" />
          {has("SMA") && <Line type="monotone" dataKey="SMA" stroke="#e67e22" dot={false} strokeWidth={1.5} />}
          {has("EMA") && <Line type="monotone" dataKey="EMA" stroke="#2ecc71" dot={false} strokeWidth={1.5} />}
    {has("BB") && 
        <Line
          type="monotone"
          dataKey="BB_UBand"
          stroke="#CCCCCC"
          strokeWidth={1}
          dot={false}
          connectNulls
          name="BB Upper"
              strokeDasharray="4 2"  // ← dashed line
        />
    }
    {has("BB") && 
        <Line
          type="monotone"
          dataKey="BB_LBand"
          stroke="#CCCCCC"
          strokeWidth={1}
          dot={false}
          connectNulls
          name="BB Lower"
              strokeDasharray="4 2"  // ← dashed line
      />
    }
        </ComposedChart>
      </ResponsiveContainer>

      {/* === RSI === */}
      {has("RSI") && (
        <>
          <h4 className="text-sm mt-4 mb-1">RSI</h4>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={data}>
              <XAxis
                dataKey="Date"
                tickFormatter={(tick) => formatDateLabel(tick, period)}
                hide={lastChart !== "RSI"}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip labelFormatter={(label) => `Date: ${formatDateLabel(label, period)}`} />
              <Line type="monotone" dataKey="RSI" stroke="#2980b9" dot={false} strokeWidth={1.5} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine y={50} stroke="#cccccc" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}

      {/* === MACD === */}
      {has("MACD") && (
        <>
          <h4 className="text-sm mt-4 mb-1">MACD</h4>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Date"
                tickFormatter={(tick) => formatDateLabel(tick, period)}
                hide={lastChart !== "MACD"}
              />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip labelFormatter={(label) => `Date: ${formatDateLabel(label, period)}`} />
              <Bar dataKey="MACD_Histogram" fill="#6b7280" maxBarSize={10} isAnimationActive={false} />
              <Line type="monotone" dataKey="MACD" stroke="#1e3a8a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="MACD_Signal" stroke="#dc2626" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}

      {/* === ATR === */}
      {has("ATR") && (
        <>
          <h4 className="text-sm mt-4 mb-1">ATR</h4>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Date"
                tickFormatter={(tick) => formatDateLabel(tick, period)}
                hide={lastChart !== "ATR"}
              />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip labelFormatter={(label) => `Date: ${formatDateLabel(label, period)}`} />
              <Line type="monotone" dataKey="ATR" stroke="#9c27b0" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
