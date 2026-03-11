import { Card, Segmented, Skeleton } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Text } from "../text";

type GroupBy = "time" | "client";
type GroupMetric = "totalAmountSuccess" | "totalTransactionSuccess";
type TimeChartType = "line" | "bar";
type TimeMetricView = "both" | "amount" | "transaction";

type ChartSeries = {
  name: string;
  data: number[];
};

type GroupByClientRow = {
  clientId: string;
  totalAmountSuccess: number;
  totalRealAmountSuccess: number;
  totalTransactionSuccess: number;
};

type HoveredLinePoint = {
  x: number;
  y: number;
  index: number;
  seriesName: string;
  label: string;
  color: string;
};

type HoveredBar = {
  x: number;
  y: number;
  clientId: string;
  totalAmountSuccess: number;
  totalRealAmountSuccess: number;
  totalTransactionSuccess: number;
  color: string;
};

type Props = {
  chartData: any;
  isLoading: boolean;
  groupBy: GroupBy;
  setGroupBy: (groupBy: GroupBy) => void;
  canFilterClient: boolean;
  status?: string;
};

const SERIES_STYLES: Record<string, { color: string; label: string }> = {
  totalAmountSuccess: {
    color: "#722ED1",
    label: "Total Amount Success",
  },
  totalRealAmountSuccess: {
    color: "#FA8C16",
    label: "Net Amount Success",
  },
  totalTransactionSuccess: {
    color: "#13C2C2",
    label: "Total Transaction Success",
  },
};

const CLIENT_SERIES_COLORS = [
  "#1677FF",
  "#FA8C16",
  "#52C41A",
  "#EB2F96",
  "#2F54EB",
  "#13C2C2",
  "#722ED1",
  "#FA541C",
];

const getSeriesStyle = (name: string, index = 0) =>
  SERIES_STYLES[name] || {
    color: CLIENT_SERIES_COLORS[index % CLIENT_SERIES_COLORS.length],
    label: name,
  };

const getStatusSuffix = (status?: string) => {
  if (!status) return "Success";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getSeriesLabel = (name: string, status?: string, index = 0) => {
  const suffix = getStatusSuffix(status);

  if (name === "totalAmountSuccess") {
    return `Total Amount ${suffix}`;
  }

  if (name === "totalRealAmountSuccess") {
    return `Net Amount ${suffix}`;
  }

  if (name === "totalTransactionSuccess") {
    return `Total Transaction ${suffix}`;
  }

  return getSeriesStyle(name, index).label;
};

const formatValue = (name: string, value: number) => {
  if (name === "totalAmountSuccess" || name === "totalRealAmountSuccess") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  return Math.round(value || 0).toLocaleString("id-ID");
};

const formatXAxisLabel = (value: string) => {
  if (!value) return "";

  if (/^\d{2}:\d{2}$/.test(value)) return value;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("DD MMM") : value;
  }

  if (/^\d{4}-\d{2}$/.test(value)) {
    const parsed = dayjs(`${value}-01`);
    return parsed.isValid() ? parsed.format("MMM YYYY") : value;
  }

  return value;
};

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

const DashboardPerformanceChart = ({
  chartData,
  isLoading,
  groupBy,
  setGroupBy,
  canFilterClient,
  status,
}: Props) => {
  const [groupMetric, setGroupMetric] =
    useState<GroupMetric>("totalAmountSuccess");
  const [timeChartType, setTimeChartType] = useState<TimeChartType>("line");

  const [hoveredLinePoint, setHoveredLinePoint] =
    useState<HoveredLinePoint | null>(null);
  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null);

  const chart = chartData;

  const timeLabels: string[] = Array.isArray(chart?.labels)
    ? (chart.labels as string[])
    : [];
  const timeSeries: ChartSeries[] = Array.isArray(chart?.series)
    ? (chart.series as ChartSeries[])
    : [];
  const clientRows: GroupByClientRow[] = Array.isArray(chart?.data)
    ? (chart.data as GroupByClientRow[])
    : [];

  const isClientMode = groupBy === "client" && clientRows.length > 0;

  const lineSeriesByName = useMemo(
    () =>
      timeSeries.reduce<Record<string, ChartSeries>>((acc, item) => {
        acc[item.name] = item;
        return acc;
      }, {}),
    [timeSeries],
  );

  const displayedTimeSeries = useMemo(() => {
    return timeSeries.filter((item) => item.name === "totalAmountSuccess");
  }, [timeSeries]);

  const lineLabelIndexes = getVisibleLabelIndexes(timeLabels.length);
  const clientLabelIndexes = getVisibleLabelIndexes(clientRows.length);

  const lineChartGeometry = useMemo(() => {
    const chartWidth = 1000;
    const chartHeight = 320;
    const padding = { top: 20, right: 66, bottom: 50, left: 72 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const amountValues = displayedTimeSeries
      .filter((item) => item.name !== "totalTransactionSuccess")
      .flatMap((item) => item.data)
      .filter((v) => v >= 0);
    const transactionValues = displayedTimeSeries
      .filter((item) => item.name === "totalTransactionSuccess")
      .flatMap((item) => item.data)
      .filter((v) => v >= 0);

    const maxAmount = Math.max(...amountValues, 1);
    const maxTransaction = Math.max(...transactionValues, 1);
    const useDualAxis = false;
    const leftAxisMax = maxAmount;
    const rightAxisMax = maxTransaction;

    const getPoint = (index: number, value: number, axis: "left" | "right") => {
      const axisMax = axis === "left" ? leftAxisMax : rightAxisMax;
      const x =
        padding.left +
        (timeLabels.length <= 1
          ? 0
          : (index / (timeLabels.length - 1)) * plotWidth);
      const y = padding.top + (1 - value / axisMax) * plotHeight;
      return { x, y };
    };

    const plottedSeries = displayedTimeSeries.map((item) => {
      const axis =
        useDualAxis && item.name === "totalTransactionSuccess"
          ? "right"
          : "left";
      const points = item.data.map((value, index) =>
        getPoint(index, value, axis),
      );
      return {
        ...item,
        axis,
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
      leftAxisMax,
      rightAxisMax,
      maxAmount,
      maxTransaction,
      useDualAxis,
      axisSteps: [1, 0.75, 0.5, 0.25, 0],
      plottedSeries,
    };
  }, [displayedTimeSeries, timeLabels]);

  const clientChartGeometry = useMemo(() => {
    const chartWidth = 1000;
    const chartHeight = 320;
    const padding = { top: 20, right: 20, bottom: 50, left: 72 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const values = clientRows.map((item) =>
      groupMetric === "totalAmountSuccess"
        ? item.totalAmountSuccess || 0
        : item.totalTransactionSuccess || 0,
    );
    const maxValue = Math.max(...values, 1);

    const barGap = 16;
    const barWidth =
      clientRows.length === 0
        ? 0
        : Math.max(
            (plotWidth - barGap * (clientRows.length + 1)) / clientRows.length,
            24,
          );

    const bars = clientRows.map((row, index) => {
      const value =
        groupMetric === "totalAmountSuccess"
          ? row.totalAmountSuccess || 0
          : row.totalTransactionSuccess || 0;
      const height = (value / maxValue) * plotHeight;
      const x = padding.left + barGap + index * (barWidth + barGap);
      const y = padding.top + plotHeight - height;
      return {
        ...row,
        value,
        x,
        y,
        width: barWidth,
        height,
        color: CLIENT_SERIES_COLORS[index % CLIENT_SERIES_COLORS.length],
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
      bars,
    };
  }, [clientRows, groupMetric]);

  const totalAmount = clientRows.reduce(
    (acc, row) => acc + (row.totalAmountSuccess || 0),
    0,
  );
  const totalTransaction = clientRows.reduce(
    (acc, row) => acc + (row.totalTransactionSuccess || 0),
    0,
  );

  return (
    <Card
      styles={{
        header: { padding: "12px 16px" },
        body: { padding: "12px 16px" },
      }}
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
            {canFilterClient && (
              <Segmented
                options={[
                  { label: "By Time", value: "time" },
                  { label: "By Client", value: "client" },
                ]}
                value={groupBy}
                onChange={(value) => setGroupBy(value as GroupBy)}
              />
            )}

            {canFilterClient && groupBy === "client" && (
              <Segmented
                options={[
                  { label: "Amount", value: "totalAmountSuccess" },
                  { label: "Transaction", value: "totalTransactionSuccess" },
                ]}
                value={groupMetric}
                onChange={(value) => setGroupMetric(value as GroupMetric)}
              />
            )}

            {groupBy === "time" && (
              <Segmented
                options={[
                  { label: "Line", value: "line" },
                  { label: "Bar", value: "bar" },
                ]}
                value={timeChartType}
                onChange={(value) => setTimeChartType(value as TimeChartType)}
              />
            )}
          </div>
        </div>
      }
      className="dark:bg-black"
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (groupBy === "time" &&
          (timeLabels.length === 0 || timeSeries.length === 0)) ||
        (groupBy === "client" && clientRows.length === 0) ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "48px 0",
          }}
        >
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
            {isClientMode ? (
              <>
                <Text className="dark:text-white">
                  {`${getSeriesLabel("totalAmountSuccess", status)}: `}
                  <strong>
                    {formatValue("totalAmountSuccess", totalAmount)}
                  </strong>
                </Text>
                <Text className="dark:text-white">
                  {`${getSeriesLabel("totalTransactionSuccess", status)}: `}
                  <strong>
                    {formatValue("totalTransactionSuccess", totalTransaction)}
                  </strong>
                </Text>
              </>
            ) : (
              displayedTimeSeries.map((item, seriesIndex) => {
                const style = getSeriesStyle(item.name, seriesIndex);
                const summaryValue = item.data.reduce(
                  (acc, value) => acc + (value || 0),
                  0,
                );

                return (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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
                      {getSeriesLabel(item.name, status, seriesIndex)} (Total periode):{" "}
                      <strong>{formatValue(item.name, summaryValue)}</strong>
                    </Text>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg
              width="100%"
              height="320"
              viewBox={`0 0 ${
                isClientMode
                  ? clientChartGeometry.chartWidth
                  : lineChartGeometry.chartWidth
              } 320`}
              role="img"
              style={{ minWidth: "720px", touchAction: "pan-x pan-y" }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setHoveredBar(null);
                  setHoveredLinePoint(null);
                }
              }}
            >
              {isClientMode
                ? clientChartGeometry.axisSteps.map((ratio, idx) => {
                    const y =
                      clientChartGeometry.padding.top +
                      (1 - ratio) * clientChartGeometry.plotHeight;
                    const axisValue = clientChartGeometry.maxValue * ratio;

                    return (
                      <g key={idx}>
                        <line
                          x1={clientChartGeometry.padding.left}
                          y1={y}
                          x2={
                            clientChartGeometry.padding.left +
                            clientChartGeometry.plotWidth
                          }
                          y2={y}
                          stroke="#f0f0f0"
                          strokeWidth="1"
                        />
                        <text
                          x={clientChartGeometry.padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#8c8c8c"
                        >
                          {formatValue(groupMetric, axisValue)}
                        </text>
                      </g>
                    );
                  })
                : lineChartGeometry.axisSteps.map((ratio, idx) => {
                    const y =
                      lineChartGeometry.padding.top +
                      (1 - ratio) * lineChartGeometry.plotHeight;
                    const leftAxisValue = lineChartGeometry.leftAxisMax * ratio;

                    return (
                      <g key={idx}>
                        <line
                          x1={lineChartGeometry.padding.left}
                          y1={y}
                          x2={
                            lineChartGeometry.padding.left +
                            lineChartGeometry.plotWidth
                          }
                          y2={y}
                          stroke="#f0f0f0"
                          strokeWidth="1"
                        />
                        <text
                          x={lineChartGeometry.padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#8c8c8c"
                        >
                          {formatValue("totalAmountSuccess", leftAxisValue)}
                        </text>
                      </g>
                    );
                  })}

              {isClientMode
                ? clientChartGeometry.bars.map((bar, index) => (
                    <g key={bar.clientId}>
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        rx="6"
                        fill={bar.color}
                      />
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        rx="6"
                        fill="transparent"
                        onMouseEnter={() =>
                          setHoveredBar({
                            x: bar.x + bar.width / 2,
                            y: bar.y,
                            clientId: bar.clientId,
                            totalAmountSuccess: bar.totalAmountSuccess,
                            totalRealAmountSuccess:
                              bar.totalRealAmountSuccess ?? 0,
                            totalTransactionSuccess:
                              bar.totalTransactionSuccess,
                            color: bar.color,
                          })
                        }
                        onTouchStart={() =>
                          setHoveredBar({
                            x: bar.x + bar.width / 2,
                            y: bar.y,
                            clientId: bar.clientId,
                            totalAmountSuccess: bar.totalAmountSuccess,
                            totalRealAmountSuccess:
                              bar.totalRealAmountSuccess ?? 0,
                            totalTransactionSuccess:
                              bar.totalTransactionSuccess,
                            color: bar.color,
                          })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      <text
                        x={bar.x + bar.width / 2}
                        y={clientChartGeometry.chartHeight - 18}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#8c8c8c"
                      >
                        {clientLabelIndexes.includes(index) ? bar.clientId : ""}
                      </text>
                    </g>
                  ))
                : lineChartGeometry.plottedSeries.map((item, seriesIndex) => {
                    const style = getSeriesStyle(item.name, seriesIndex);

                    return (
                      <g key={item.name}>
                        {timeChartType === "line" ? (
                          <path
                            d={item.path}
                            fill="none"
                            stroke={style.color}
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        ) : (
                          item.points.map((point, index) => {
                            const value = item.data[index] || 0;
                            const axisMax = lineChartGeometry.leftAxisMax;
                            const barHeight =
                              axisMax === 0
                                ? 0
                                : (value / axisMax) *
                                  lineChartGeometry.plotHeight;
                            const barWidth = 12;
                            const xOffset = seriesIndex === 0 ? -7 : 7;
                            const barX = point.x + xOffset - barWidth / 2;
                            const barY =
                              lineChartGeometry.padding.top +
                              lineChartGeometry.plotHeight -
                              barHeight;

                            const pointLabel = formatXAxisLabel(
                              timeLabels[index] || "",
                            );
                            const totalVisibleSeries =
                              lineChartGeometry.plottedSeries.length;
                            const markerOffsetX =
                              totalVisibleSeries > 1
                                ? (seriesIndex - (totalVisibleSeries - 1) / 2) *
                                  6
                                : 0;
                            const pointX = point.x + markerOffsetX;

                            return (
                              <g key={`${item.name}-bar-${index}`}>
                                <rect
                                  x={barX}
                                  y={barY}
                                  width={barWidth}
                                  height={Math.max(barHeight, 1)}
                                  rx="3"
                                  fill={style.color}
                                  opacity={0.9}
                                />
                                <rect
                                  key={`${item.name}-bar-hover-${index}`}
                                  x={barX}
                                  y={barY}
                                  width={barWidth}
                                  height={Math.max(barHeight, 1)}
                                  rx="3"
                                  fill="transparent"
                                  onMouseEnter={() =>
                                    setHoveredLinePoint({
                                      x: pointX,
                                      y: barY,
                                      index,
                                      seriesName: item.name,
                                      label: pointLabel,
                                      color: style.color,
                                    })
                                  }
                                  onTouchStart={() =>
                                    setHoveredLinePoint({
                                      x: pointX,
                                      y: barY,
                                      index,
                                      seriesName: item.name,
                                      label: pointLabel,
                                      color: style.color,
                                    })
                                  }
                                  onMouseLeave={() => setHoveredLinePoint(null)}
                                />
                              </g>
                            );
                          })
                        )}
                        {item.points.map((point, index) => {
                          const pointLabel = formatXAxisLabel(
                            timeLabels[index] || "",
                          );
                          const totalVisibleSeries =
                            lineChartGeometry.plottedSeries.length;
                          const markerOffsetX =
                            totalVisibleSeries > 1
                              ? (seriesIndex - (totalVisibleSeries - 1) / 2) * 6
                              : 0;
                          const pointX = point.x + markerOffsetX;

                          return (
                            <g key={`${item.name}-${index}`}>
                              {timeChartType === "line" && (
                                <>
                                  <circle
                                    cx={pointX}
                                    cy={point.y}
                                    r={4}
                                    fill={style.color}
                                  />
                                  <circle
                                    cx={pointX}
                                    cy={point.y}
                                    r="12"
                                    fill="transparent"
                                    onMouseEnter={() =>
                                      setHoveredLinePoint({
                                        x: pointX,
                                        y: point.y,
                                        index,
                                        seriesName: item.name,
                                        label: pointLabel,
                                        color: style.color,
                                      })
                                    }
                                    onTouchStart={() =>
                                      setHoveredLinePoint({
                                        x: pointX,
                                        y: point.y,
                                        index,
                                        seriesName: item.name,
                                        label: pointLabel,
                                        color: style.color,
                                      })
                                    }
                                    onMouseLeave={() =>
                                      setHoveredLinePoint(null)
                                    }
                                  />
                                </>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}

              {hoveredBar && (
                <g pointerEvents="none">
                  <line
                    x1={hoveredBar.x}
                    y1={clientChartGeometry.padding.top}
                    x2={hoveredBar.x}
                    y2={
                      clientChartGeometry.padding.top +
                      clientChartGeometry.plotHeight
                    }
                    stroke={hoveredBar.color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.45"
                  />
                  <g
                    transform={`translate(${Math.min(
                      Math.max(
                        hoveredBar.x + 12,
                        clientChartGeometry.padding.left + 8,
                      ),
                      clientChartGeometry.chartWidth - 290,
                    )}, ${Math.max(hoveredBar.y - 88, clientChartGeometry.padding.top + 4)})`}
                  >
                    <rect
                      width="278"
                      height="82"
                      rx="8"
                      fill="#111827"
                      fillOpacity="0.95"
                    />
                    <text x="10" y="18" fontSize="12" fill="#e5e7eb">
                      {hoveredBar.clientId}
                    </text>
                    <text x="10" y="36" fontSize="12" fill="#ffffff">
                      {`${getSeriesLabel("totalAmountSuccess", status)}: ${formatValue("totalAmountSuccess", hoveredBar.totalAmountSuccess)}`}
                    </text>
                    <text x="10" y="53" fontSize="12" fill="#ffffff">
                      {`${getSeriesLabel("totalRealAmountSuccess", status)}: ${formatValue("totalRealAmountSuccess", hoveredBar.totalRealAmountSuccess)}`}
                    </text>
                    <text x="10" y="70" fontSize="12" fill="#ffffff">
                      {`${getSeriesLabel("totalTransactionSuccess", status)}: ${formatValue(
                        "totalTransactionSuccess",
                        hoveredBar.totalTransactionSuccess,
                      )}`}
                    </text>
                  </g>
                </g>
              )}

              {hoveredLinePoint && (
                <g pointerEvents="none">
                  {(() => {
                    const rectHeight = 36 + timeSeries.length * 20;

                    return (
                      <g
                        transform={`translate(${Math.min(
                          Math.max(
                            hoveredLinePoint.x + 12,
                            lineChartGeometry.padding.left + 8,
                          ),
                          lineChartGeometry.chartWidth - 290,
                        )}, ${Math.max(hoveredLinePoint.y - 72, lineChartGeometry.padding.top + 4)})`}
                      >
                        <rect
                          width="278"
                          height={rectHeight}
                          rx="8"
                          fill="#111827"
                          fillOpacity="0.95"
                        />
                        <text
                          x="10"
                          y="20"
                          fontSize="12"
                          fill="#e5e7eb"
                          fontWeight="bold"
                        >
                          {hoveredLinePoint.label}
                        </text>
                        {timeSeries.map((series, idx) => {
                          const val = series.data[hoveredLinePoint.index] || 0;
                          return (
                            <text
                              key={series.name}
                              x="10"
                              y={44 + idx * 20}
                              fontSize="12"
                              fill="#ffffff"
                            >
                              {`${getSeriesLabel(series.name, status, idx)}: ${formatValue(series.name, val)}`}
                            </text>
                          );
                        })}
                      </g>
                    );
                  })()}
                  <line
                    x1={hoveredLinePoint.x}
                    y1={lineChartGeometry.padding.top}
                    x2={hoveredLinePoint.x}
                    y2={
                      lineChartGeometry.padding.top +
                      lineChartGeometry.plotHeight
                    }
                    stroke={hoveredLinePoint.color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.45"
                  />
                  {timeChartType === "line" && (
                    <circle
                      cx={hoveredLinePoint.x}
                      cy={hoveredLinePoint.y}
                      r={6}
                      fill={hoveredLinePoint.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )}

              {!isClientMode &&
                timeLabels.map((label, index) => {
                  if (!lineLabelIndexes.includes(index)) return null;
                  const x =
                    lineChartGeometry.padding.left +
                    (timeLabels.length <= 1
                      ? 0
                      : (index / (timeLabels.length - 1)) *
                        lineChartGeometry.plotWidth);
                  const y = lineChartGeometry.chartHeight - 18;

                  return (
                    <text
                      key={`${label}-${index}`}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#8c8c8c"
                    >
                      {formatXAxisLabel(label)}
                    </text>
                  );
                })}
              {!isClientMode && (
                <text
                  x={lineChartGeometry.padding.left}
                  y={14}
                  textAnchor="start"
                  fontSize="11"
                  fill="#8c8c8c"
                >
                  {`Y Left: ${getSeriesLabel("totalAmountSuccess", status)}`}
                </text>
              )}
              {!isClientMode && lineChartGeometry.useDualAxis && (
                <text
                  x={
                    lineChartGeometry.padding.left + lineChartGeometry.plotWidth
                  }
                  y={14}
                  textAnchor="end"
                  fontSize="11"
                  fill="#8c8c8c"
                >
                  Y Right: Total Transaction Success
                </text>
              )}
            </svg>
          </div>
        </>
      )}
    </Card>
  );
};

export default DashboardPerformanceChart;
