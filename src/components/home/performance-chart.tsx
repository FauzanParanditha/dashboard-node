import { Card, DatePicker, Segmented, Skeleton } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Text } from "../text";

type Period = "day" | "month" | "year";

type ChartSeries = {
  name: string;
  data: number[];
};

type HoveredPoint = {
  x: number;
  y: number;
  index: number;
  seriesName: string;
  value: number;
  label: string;
  color: string;
};

const SERIES_STYLES: Record<string, { color: string; label: string }> = {
  totalAmountSuccess: {
    color: "#722ED1",
    label: "Total Amount Success",
  },
  totalTransactionSuccess: {
    color: "#13C2C2",
    label: "Total Transaction Success",
  },
};

const formatLabel = (value: string, period: Period) => {
  const date = dayjs(value);
  if (!date.isValid()) return value;

  if (period === "day") return date.format("HH:mm");
  if (period === "month") return date.format("DD MMM");
  return date.format("MMM YYYY");
};

const formatValue = (name: string, value: number) => {
  if (name === "totalAmountSuccess") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  return (value || 0).toLocaleString("id-ID");
};

const getSeriesLabel = (name: string) =>
  SERIES_STYLES[name]?.label ? SERIES_STYLES[name].label : name;

const buildSmoothPath = (points: Array<{ x: number; y: number }>) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
};

const getVisibleLabelIndexes = (length: number) => {
  if (length <= 6) return Array.from({ length }, (_, index) => index);

  const step = Math.ceil(length / 6);
  const indexes = Array.from({ length }, (_, index) => index).filter(
    (index) => index % step === 0,
  );

  if (indexes[indexes.length - 1] !== length - 1) {
    indexes.push(length - 1);
  }

  return indexes;
};

const DashboardPerformanceChart = () => {
  const [period, setPeriod] = useState<Period>("month");
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs());
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set("period", period);

    if (period === "day") {
      params.set("date", selectedDay.format("YYYY-MM-DD"));
    }

    if (period === "month") {
      params.set("month", String(selectedMonth.month() + 1));
      params.set("year", String(selectedMonth.year()));
    }

    if (period === "year") {
      params.set("year", String(selectedYear.year()));
    }

    return `/api/v1/adm/dashboard/chart?${params.toString()}`;
  }, [period, selectedDay, selectedMonth, selectedYear]);

  useEffect(() => {
    setHoveredPoint(null);
  }, [endpoint]);

  const { data: response, isLoading } = useSWR(endpoint);

  const chart = response?.data;
  const labels: string[] = chart?.labels || [];
  const series: ChartSeries[] = chart?.series || [];
  const seriesByName = useMemo(
    () =>
      series.reduce<Record<string, ChartSeries>>((acc, item) => {
        acc[item.name] = item;
        return acc;
      }, {}),
    [series],
  );
  const labelIndexes = getVisibleLabelIndexes(labels.length);

  const chartGeometry = useMemo(() => {
    const chartWidth = 1000;
    const chartHeight = 320;
    const padding = { top: 20, right: 20, bottom: 50, left: 56 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const allValues = series.flatMap((item) => item.data).filter((v) => v >= 0);
    const maxValue = Math.max(...allValues, 1);

    const getPoint = (index: number, value: number) => {
      const x =
        padding.left +
        (labels.length <= 1 ? 0 : (index / (labels.length - 1)) * plotWidth);
      const y = padding.top + (1 - value / maxValue) * plotHeight;
      return { x, y };
    };

    const plottedSeries = series.map((item) => {
      const points = item.data.map((value, index) => getPoint(index, value));
      return {
        ...item,
        points,
        path: buildSmoothPath(points),
      };
    });

    return {
      chartWidth,
      chartHeight,
      padding,
      plotWidth,
      plotHeight,
      maxValue,
      axisSteps: [1, 0.75, 0.5, 0.25, 0],
      plottedSeries,
    };
  }, [labels, series]);

  return (
    <Card
      style={{ marginTop: "8px" }}
      styles={{ header: { padding: "12px 16px" }, body: { padding: "12px 16px" } }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <Text size="sm" strong className="dark:text-white">
            Dashboard Chart
          </Text>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Segmented
              options={[
                { label: "Day", value: "day" },
                { label: "Month", value: "month" },
                { label: "Year", value: "year" },
              ]}
              value={period}
              onChange={(value) => setPeriod(value as Period)}
            />
            {period === "day" && (
              <DatePicker
                value={selectedDay}
                onChange={(value) => {
                  if (value) setSelectedDay(value);
                }}
                format="YYYY-MM-DD"
                allowClear={false}
              />
            )}
            {period === "month" && (
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(value) => {
                  if (value) setSelectedMonth(value);
                }}
                format="MM-YYYY"
                allowClear={false}
              />
            )}
            {period === "year" && (
              <DatePicker
                picker="year"
                value={selectedYear}
                onChange={(value) => {
                  if (value) setSelectedYear(value);
                }}
                format="YYYY"
                allowClear={false}
              />
            )}
          </div>
        </div>
      }
      className="dark:bg-black"
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : labels.length === 0 || series.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Text className="dark:text-white">No chart data</Text>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            {series.map((item) => {
              const style = SERIES_STYLES[item.name] || {
                color: "#1677FF",
                label: item.name,
              };
              const lastValue = item.data[item.data.length - 1] || 0;

              return (
                <div
                  key={item.name}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: style.color,
                      display: "inline-block",
                    }}
                  />
                  <Text className="dark:text-white">
                    {style.label}: <strong>{formatValue(item.name, lastValue)}</strong>
                  </Text>
                </div>
              );
            })}
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg
              width="100%"
              height="320"
              viewBox={`0 0 ${chartGeometry.chartWidth} ${chartGeometry.chartHeight}`}
              role="img"
              style={{ minWidth: "720px" }}
            >
              {chartGeometry.axisSteps.map((ratio, idx) => {
                const y =
                  chartGeometry.padding.top +
                  (1 - ratio) * chartGeometry.plotHeight;
                const axisValue = Math.round(chartGeometry.maxValue * ratio);

                return (
                  <g key={idx}>
                    <line
                      x1={chartGeometry.padding.left}
                      y1={y}
                      x2={chartGeometry.padding.left + chartGeometry.plotWidth}
                      y2={y}
                      stroke="#f0f0f0"
                      strokeWidth="1"
                    />
                    <text
                      x={chartGeometry.padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#8c8c8c"
                    >
                      {axisValue.toLocaleString("id-ID")}
                    </text>
                  </g>
                );
              })}

              {chartGeometry.plottedSeries.map((item) => {
                const style = SERIES_STYLES[item.name] || {
                  color: "#1677FF",
                  label: item.name,
                };

                return (
                  <g key={item.name}>
                    <path
                      d={item.path}
                      fill="none"
                      stroke={style.color}
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {item.points.map((point, index) => {
                      const pointLabel = formatLabel(labels[index] || "", period);
                      const pointValue = item.data[index] || 0;

                      return (
                        <g key={`${item.name}-${index}`}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={style.color}
                          />
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            fill="transparent"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                x: point.x,
                                y: point.y,
                                index,
                                seriesName: item.name,
                                value: pointValue,
                                label: pointLabel,
                                color: style.color,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {hoveredPoint && (
                <g pointerEvents="none">
                  {(() => {
                    const amountValue =
                      seriesByName.totalAmountSuccess?.data[hoveredPoint.index] || 0;
                    const transactionValue =
                      seriesByName.totalTransactionSuccess?.data[hoveredPoint.index] || 0;

                    return (
                      <g
                        transform={`translate(${Math.min(
                          Math.max(hoveredPoint.x + 12, chartGeometry.padding.left + 8),
                          chartGeometry.chartWidth - 290,
                        )}, ${Math.max(hoveredPoint.y - 72, chartGeometry.padding.top + 4)})`}
                      >
                        <rect
                          width="278"
                          height="64"
                          rx="8"
                          fill="#111827"
                          fillOpacity="0.95"
                        />
                        <text x="10" y="18" fontSize="12" fill="#e5e7eb">
                          {hoveredPoint.label}
                        </text>
                        <text x="10" y="36" fontSize="12" fill="#ffffff">
                          {`Total Amount Success: ${formatValue("totalAmountSuccess", amountValue)}`}
                        </text>
                        <text x="10" y="53" fontSize="12" fill="#ffffff">
                          {`Total Transaction Success: ${formatValue("totalTransactionSuccess", transactionValue)}`}
                        </text>
                      </g>
                    );
                  })()}
                  <line
                    x1={hoveredPoint.x}
                    y1={chartGeometry.padding.top}
                    x2={hoveredPoint.x}
                    y2={chartGeometry.padding.top + chartGeometry.plotHeight}
                    stroke={hoveredPoint.color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.45"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="6"
                    fill={hoveredPoint.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              )}

              {labels.map((label, index) => {
                if (!labelIndexes.includes(index)) return null;
                const x =
                  chartGeometry.padding.left +
                  (labels.length <= 1
                    ? 0
                    : (index / (labels.length - 1)) * chartGeometry.plotWidth);
                const y = chartGeometry.chartHeight - 18;

                return (
                  <text
                    key={`${label}-${index}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#8c8c8c"
                  >
                    {formatLabel(label, period)}
                  </text>
                );
              })}
            </svg>
          </div>
        </>
      )}
    </Card>
  );
};

export default DashboardPerformanceChart;
