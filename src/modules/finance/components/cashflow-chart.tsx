"use client";

import { useMemo, useState } from "react";
import type { MonthlyCashflowPoint } from "@/modules/finance/calculations";
import { formatCurrency } from "@/shared/utils/format";

function compact(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(Math.round(value));
}

function cashflowMessage(net: number) {
  if (net > 0) return "Masih ada uang tersisa bulan ini";
  if (net < 0) return "Pengeluaran lebih besar dari pemasukan";
  return "Pemasukan dan pengeluaran seimbang";
}

export function CashflowChart({ data }: { data: MonthlyCashflowPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, data.length - 1));
  const width = 720;
  const height = 248;
  const left = 50;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(1, ...data.flatMap((point) => [point.income, point.expense]));
  const groupWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(19, Math.max(11, groupWidth * 0.22));
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const resolvedIndex = Math.min(activeIndex, Math.max(0, data.length - 1));
  const active = data[resolvedIndex];

  const period = useMemo(() => {
    const income = data.reduce((sum, point) => sum + point.income, 0);
    const expense = data.reduce((sum, point) => sum + point.expense, 0);
    return { income, expense, remaining: income - expense };
  }, [data]);

  if (!data.length) {
    return <div className="chart-empty" role="status"><strong>Belum ada data arus kas</strong><span>Catat pemasukan atau pengeluaran untuk melihat pergerakan uang per bulan.</span></div>;
  }

  return (
    <figure className="cashflow-figure fintech">
      {active ? <section className="cashflow-month-summary" aria-live="polite">
        <div className="cashflow-month-copy">
          <span>Bulan dipilih</span>
          <strong>{active.label}</strong>
          <small>{cashflowMessage(active.net)}</small>
        </div>
        <div className="cashflow-month-metrics">
          <div><span>Masuk</span><strong className="positive-text">{formatCurrency(active.income, true)}</strong></div>
          <div><span>Keluar</span><strong className="negative-text">{formatCurrency(active.expense, true)}</strong></div>
          <div className="remaining"><span>Sisa</span><strong className={active.net < 0 ? "negative-text" : "positive-text"}>{active.net >= 0 ? "+" : ""}{formatCurrency(active.net, true)}</strong></div>
        </div>
      </section> : null}

      <div className="cashflow-period-summary" aria-label="Ringkasan periode">
        <span><i className="legend-dot income"/>Total masuk <strong>{formatCurrency(period.income, true)}</strong></span>
        <span><i className="legend-dot expense"/>Total keluar <strong>{formatCurrency(period.expense, true)}</strong></span>
        <span className={`period-balance ${period.remaining < 0 ? "negative" : "positive"}`}>Sisa periode {period.remaining >= 0 ? "+" : ""}{formatCurrency(period.remaining, true)}</span>
      </div>

      <div className="cashflow-chart-wrap fintech">
        <svg className="cashflow-chart fintech" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Grafik uang masuk dan keluar ${data.length} bulan terakhir`}>
          {ticks.map((tick) => {
            const y = top + chartHeight - chartHeight * tick;
            return <g key={tick} className="chart-gridline"><line x1={left} x2={width - right} y1={y} y2={y}/><text x={left - 10} y={y + 4} textAnchor="end">{tick === 0 ? "0" : compact(max * tick)}</text></g>;
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
                aria-label={`${point.label}: uang masuk ${formatCurrency(point.income)}, uang keluar ${formatCurrency(point.expense)}, sisa ${formatCurrency(point.net, true)}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              >
                <rect className="chart-hit-area" x={center - groupWidth / 2 + 4} y={top - 4} width={Math.max(12, groupWidth - 8)} height={chartHeight + 10} rx="12"/>
                <rect className="chart-bar income" x={center - barWidth - 4} y={top + chartHeight - incomeHeight} width={barWidth} height={Math.max(incomeHeight, 2)} rx="7"/>
                <rect className="chart-bar expense" x={center + 4} y={top + chartHeight - expenseHeight} width={barWidth} height={Math.max(expenseHeight, 2)} rx="7"/>
                <text className={`chart-label ${isActive ? "active" : ""}`} x={center} y={height - 9} textAnchor="middle">{point.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="chart-legend fintech">
        <span><i className="legend-dot income"/>Uang masuk</span>
        <span><i className="legend-dot expense"/>Uang keluar</span>
        <span className="chart-hint">Tap bulan untuk melihat detail</span>
      </figcaption>
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
