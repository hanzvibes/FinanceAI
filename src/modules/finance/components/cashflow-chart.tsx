"use client";

import { useState } from "react";
import type { MonthlyCashflowPoint } from "@/modules/finance/calculations";
import { formatCurrency } from "@/shared/utils/format";

function compact(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(Math.round(value));
}

export function CashflowChart({ data }: { data: MonthlyCashflowPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, data.length - 1));
  const width = 720;
  const height = 230;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(1, ...data.flatMap((point) => [point.income, point.expense]));
  const groupWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(24, groupWidth * 0.28);
  const ticks = [0, 0.5, 1];
  const resolvedIndex = Math.min(activeIndex, Math.max(0, data.length - 1));
  const active = data[resolvedIndex];

  if (!data.length) {
    return <div className="chart-empty" role="status"><strong>Belum ada data cashflow</strong><span>Grafik akan terbentuk setelah transaksi dicatat.</span></div>;
  }

  return (
    <figure className="cashflow-figure">
      {active ? <div className="chart-spotlight" aria-live="polite">
        <div><span>Periode</span><strong>{active.label}</strong></div>
        <div><span>Pemasukan</span><strong className="positive-text">{formatCurrency(active.income, true)}</strong></div>
        <div><span>Pengeluaran</span><strong className="negative-text">{formatCurrency(active.expense, true)}</strong></div>
        <div><span>Net</span><strong className={active.net < 0 ? "negative-text" : "positive-text"}>{active.net >= 0 ? "+" : ""}{formatCurrency(active.net, true)}</strong></div>
      </div> : null}
      <div className="cashflow-chart-wrap">
        <svg className="cashflow-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Grafik pemasukan dan pengeluaran ${data.length} bulan terakhir`}>
          {ticks.map((tick) => {
            const y = top + chartHeight - chartHeight * tick;
            return <g key={tick} className="chart-gridline"><line x1={left} x2={width - right} y1={y} y2={y}/><text x={left - 8} y={y + 4} textAnchor="end">{compact(max * tick)}</text></g>;
          })}
          <line className="chart-baseline" x1={left} x2={width - right} y1={top + chartHeight} y2={top + chartHeight}/>
          {data.map((point, index) => {
            const center = left + groupWidth * index + groupWidth / 2;
            const incomeHeight = (point.income / max) * chartHeight;
            const expenseHeight = (point.expense / max) * chartHeight;
            const isActive = index === resolvedIndex;
            return (
              <g
                key={point.key}
                className={isActive ? "chart-group active" : "chart-group"}
                role="button"
                tabIndex={0}
                aria-label={`${point.label}: pemasukan ${formatCurrency(point.income)}, pengeluaran ${formatCurrency(point.expense)}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              >
                <rect className="chart-hit-area" x={center - groupWidth / 2 + 2} y={top} width={Math.max(8, groupWidth - 4)} height={chartHeight} rx="7"/>
                <rect className="chart-bar income" x={center - barWidth - 3} y={top + chartHeight - incomeHeight} width={barWidth} height={incomeHeight} rx="5"/>
                <rect className="chart-bar expense" x={center + 3} y={top + chartHeight - expenseHeight} width={barWidth} height={expenseHeight} rx="5"/>
                <text className="chart-label" x={center} y={height - 10} textAnchor="middle">{point.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="chart-legend"><span><i className="legend-dot income"/>Pemasukan</span><span><i className="legend-dot expense"/>Pengeluaran</span><span className="chart-hint">Arahkan atau fokuskan bulan untuk detail</span></figcaption>
    </figure>
  );
}

export function CashflowSparkline({ data }: { data: MonthlyCashflowPoint[] }) {
  const width = 420;
  const height = 62;
  const values = data.map((point) => point.net);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const range = Math.max(1, max - min);
  const xStep = data.length > 1 ? width / (data.length - 1) : width;
  const y = (value: number) => 5 + (height - 10) * (1 - (value - min) / range);
  const points = values.map((value, index) => `${index * xStep},${y(value)}`).join(" ");
  const area = `0,${height} ${points} ${width},${height}`;

  return (
    <svg className="hero-sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polygon className="spark-area" points={area}/>
      <polyline className="spark-line" points={points}/>
      {values.map((value, index) => <circle key={data[index]?.key ?? index} className="spark-dot" cx={index * xStep} cy={y(value)} r="2.6"/>)}
    </svg>
  );
}
