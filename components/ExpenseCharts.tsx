import React, { useEffect, useState } from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faChartLine,
  faSpinner,
  faChartSimple,
  faMoneyBillTrendUp,
  faCalendarAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

interface ChartData {
  breakdown: { [key: string]: number };
  monthlyTrend: { [key: string]: number };
  breakdownPending: { [key: string]: number };
  breakdownSettled: { [key: string]: number };
  monthlyTrendPending: { [key: string]: number };
  monthlyTrendSettled: { [key: string]: number };
}

interface ExpenseChartsProps {
  showCharts: boolean;
  setShowCharts: (show: boolean) => void;
  chartData: ChartData | null;
  loadingCharts: boolean;
  animate: boolean;
  selectedCurrency: string;
  summary?: {
    totalExpenses: number;
    totalPending: number;
    totalSettled: number;
  } | null;
}

// Custom gradient background plugin for Chart.js
const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );
  gradient.addColorStop(0, "rgba(98, 0, 234, 0.1)");
  gradient.addColorStop(1, "rgba(98, 0, 234, 0.4)");
  return gradient;
};

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  showCharts,
  setShowCharts,
  chartData,
  loadingCharts,
  animate,
  selectedCurrency,
  summary,
}) => {
  const [syncedChartData, setSyncedChartData] = useState<ChartData | null>(
    null
  );

  // Sync chart data with summary values
  useEffect(() => {
    if (chartData && summary) {
      // Calculate the scale factor to adjust chart data
      const calculateScaleFactor = (
        originalTotal: number,
        targetTotal: number
      ) => {
        return originalTotal > 0 ? targetTotal / originalTotal : 1;
      };

      // Get the original totals from chart data
      const originalBreakdownTotal = Object.values(chartData.breakdown).reduce(
        (sum, val) => sum + val,
        0
      );
      const originalPendingTotal = Object.values(
        chartData.breakdownPending
      ).reduce((sum, val) => sum + val, 0);
      const originalSettledTotal = Object.values(
        chartData.breakdownSettled
      ).reduce((sum, val) => sum + val, 0);

      // Calculate scale factors
      const breakdownScaleFactor = calculateScaleFactor(
        originalBreakdownTotal,
        summary.totalExpenses
      );
      const pendingScaleFactor = calculateScaleFactor(
        originalPendingTotal,
        summary.totalPending
      );
      const settledScaleFactor = calculateScaleFactor(
        originalSettledTotal,
        summary.totalSettled
      );

      // Scale the data
      const scaledBreakdown = Object.fromEntries(
        Object.entries(chartData.breakdown).map(([key, value]) => [
          key,
          value * breakdownScaleFactor,
        ])
      );

      const scaledBreakdownPending = Object.fromEntries(
        Object.entries(chartData.breakdownPending).map(([key, value]) => [
          key,
          value * pendingScaleFactor,
        ])
      );

      const scaledBreakdownSettled = Object.fromEntries(
        Object.entries(chartData.breakdownSettled).map(([key, value]) => [
          key,
          value * settledScaleFactor,
        ])
      );

      // Original months from trend data
      const months = Object.keys(chartData.monthlyTrend);

      // Create scaled monthly trends
      let scaledMonthlyTrend: { [key: string]: number } = {};
      let scaledMonthlyTrendPending: { [key: string]: number } = {};
      let scaledMonthlyTrendSettled: { [key: string]: number } = {};

      // If we have only one month, allocate all values to it
      if (months.length === 1) {
        const month = months[0];
        scaledMonthlyTrend[month] = summary.totalExpenses;
        scaledMonthlyTrendPending[month] = summary.totalPending;
        scaledMonthlyTrendSettled[month] = summary.totalSettled;
      }
      // If we have multiple months, distribute proportionally
      else if (months.length > 1) {
        const originalMonthlyTotal = Object.values(
          chartData.monthlyTrend
        ).reduce((sum, val) => sum + val, 0);
        const monthlyScaleFactor =
          originalMonthlyTotal > 0
            ? summary.totalExpenses / originalMonthlyTotal
            : 1;

        months.forEach((month) => {
          scaledMonthlyTrend[month] =
            chartData.monthlyTrend[month] * monthlyScaleFactor;

          // Create pending/settled trends based on original proportions
          const originalPendingForMonth =
            chartData.monthlyTrendPending[month] || 0;
          const originalSettledForMonth =
            chartData.monthlyTrendSettled[month] || 0;
          const originalTotalForMonth =
            originalPendingForMonth + originalSettledForMonth;

          if (originalTotalForMonth > 0) {
            const pendingRatio =
              originalPendingForMonth / originalTotalForMonth;
            scaledMonthlyTrendPending[month] =
              scaledMonthlyTrend[month] * pendingRatio;
            scaledMonthlyTrendSettled[month] =
              scaledMonthlyTrend[month] * (1 - pendingRatio);
          } else {
            // If no data for this month, distribute based on overall ratio
            const overallPendingRatio =
              summary.totalPending / (summary.totalExpenses || 1);
            scaledMonthlyTrendPending[month] =
              scaledMonthlyTrend[month] * overallPendingRatio;
            scaledMonthlyTrendSettled[month] =
              scaledMonthlyTrend[month] * (1 - overallPendingRatio);
          }
        });
      }

      // Set the synced chart data
      setSyncedChartData({
        breakdown: scaledBreakdown,
        breakdownPending: scaledBreakdownPending,
        breakdownSettled: scaledBreakdownSettled,
        monthlyTrend: scaledMonthlyTrend,
        monthlyTrendPending: scaledMonthlyTrendPending,
        monthlyTrendSettled: scaledMonthlyTrendSettled,
      });
    } else {
      setSyncedChartData(chartData);
    }
  }, [chartData, summary]);

  const currencySymbol =
    selectedCurrency === "INR"
      ? "₹"
      : selectedCurrency === "USD"
      ? "$"
      : selectedCurrency === "EUR"
      ? "€"
      : selectedCurrency === "GBP"
      ? "£"
      : "¥";

  // Chart color schemes
  const pieColors = [
    "rgba(255, 99, 132, 0.8)", // Pink
    "rgba(54, 162, 235, 0.8)", // Blue
    "rgba(255, 206, 86, 0.8)", // Yellow
    "rgba(75, 192, 192, 0.8)", // Teal
    "rgba(153, 102, 255, 0.8)", // Purple
    "rgba(255, 159, 64, 0.8)", // Orange
  ];

  const pieBorderColors = pieColors.map((color) => color.replace("0.8", "1"));

  // Empty state component for charts
  const EmptyChartsState = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 col-span-1 md:col-span-3 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <FontAwesomeIcon
          icon={faChartSimple}
          className="text-indigo-500 text-xl"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        No Chart Data Available
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        Start tracking your expenses to see insightful charts and analytics
        here.
      </p>
    </div>
  );

  // Get the chart data to display (either synced or original)
  const displayData = syncedChartData || chartData;

  return (
    <div className="mb-10">
      {/* Toggle Charts Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg transition-all duration-300 ${
            showCharts
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
          } shadow-md hover:shadow-lg`}
        >
          <FontAwesomeIcon icon={showCharts ? faEyeSlash : faEye} />
          <span>{showCharts ? "Hide Analytics" : "Show Analytics"}</span>
        </button>

        {showCharts && (
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2 text-sm text-gray-500">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-indigo-500"
              />
              <span>Last 12 Months</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Container */}
      {showCharts && (
        <div
          className={`transition-all duration-700 ease-in-out transform ${
            animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {loadingCharts ? (
            <div className="bg-white rounded-xl shadow-lg py-12 px-8 text-center">
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-indigo-500 text-4xl animate-spin"
                />
              </div>
              <p className="text-lg text-gray-700">
                Loading your financial insights...
              </p>
            </div>
          ) : !displayData ||
            (Object.keys(displayData?.breakdown || {}).length === 0 &&
              Object.keys(displayData?.monthlyTrend || {}).length === 0) ? (
            <EmptyChartsState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Expense Breakdown Chart (Pie) */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-2 transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                      <FontAwesomeIcon
                        icon={faChartPie}
                        className="text-white text-lg"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Expense Breakdown
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex-1 min-w-[180px] bg-indigo-50 rounded-lg p-4">
                      <div className="text-sm text-indigo-600 mb-1">
                        Total Spent
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {currencySymbol}
                        {(summary?.totalExpenses || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px] bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 mb-1">
                        Top Category
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {Object.entries(displayData?.breakdown || {}).sort(
                          (a, b) => b[1] - a[1]
                        )[0]?.[0] || "None"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px] bg-amber-50 rounded-lg p-4">
                      <div className="text-sm text-amber-600 mb-1">
                        Categories
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {Object.keys(displayData?.breakdown || {}).length}
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px] flex items-center justify-center">
                    <Pie
                      data={{
                        labels: Object.keys(displayData?.breakdown || {}),
                        datasets: [
                          {
                            label: "Expenses",
                            data: Object.values(displayData?.breakdown || {}),
                            backgroundColor: pieColors,
                            borderColor: pieBorderColors,
                            borderWidth: 1,
                            hoverOffset: 15,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        layout: {
                          padding: 20,
                        },
                        plugins: {
                          legend: {
                            position: "right",
                            labels: {
                              boxWidth: 15,
                              padding: 15,
                              font: {
                                size: 12,
                              },
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            titleColor: "#334155",
                            bodyColor: "#334155",
                            bodyFont: {
                              size: 14,
                            },
                            padding: 12,
                            boxPadding: 8,
                            cornerRadius: 8,
                            borderColor: "rgba(226, 232, 240, 0.8)",
                            borderWidth: 1,
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                const total = Object.values(
                                  displayData?.breakdown || {}
                                ).reduce((sum, val) => sum + (val || 0), 0);
                                const percentage = total
                                  ? ((value / total) * 100).toFixed(1)
                                  : "0.0";
                                return ` ${
                                  context.label
                                }: ${currencySymbol}${value.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )} (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart (Line) */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-1 transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                      <FontAwesomeIcon
                        icon={faMoneyBillTrendUp}
                        className="text-white text-lg"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Monthly Trend
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex-1 min-w-[150px] bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 mb-1">
                        Highest Month
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {Object.entries(displayData?.monthlyTrend || {})
                          .length > 0
                          ? Object.entries(
                              displayData?.monthlyTrend || {}
                            ).sort((a, b) => b[1] - a[1])[0]?.[0]
                          : "N/A"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[150px] bg-cyan-50 rounded-lg p-4">
                      <div className="text-sm text-cyan-600 mb-1">Average</div>
                      <div className="text-lg font-bold text-gray-800">
                        {Object.values(displayData?.monthlyTrend || {}).length >
                        0
                          ? `${currencySymbol}${(
                              Object.values(
                                displayData?.monthlyTrend || {}
                              ).reduce((sum, val) => sum + (val || 0), 0) /
                              Object.values(displayData?.monthlyTrend || {})
                                .length
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : `${currencySymbol}0.00`}
                      </div>
                    </div>
                  </div>

                  <div className="h-[250px]">
                    <Line
                      data={{
                        labels: Object.keys(displayData?.monthlyTrend || {}),
                        datasets: [
                          {
                            label: "Expenses",
                            data: Object.values(
                              displayData?.monthlyTrend || {}
                            ),
                            borderColor: "rgb(59, 130, 246)",
                            backgroundColor: (context) => {
                              const chart = context.chart;
                              const { ctx, chartArea } = chart;
                              if (!chartArea) {
                                return "rgba(59, 130, 246, 0.2)";
                              }
                              return getGradient(ctx, chartArea);
                            },
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: "white",
                            pointBorderColor: "rgb(59, 130, 246)",
                            pointBorderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        layout: {
                          padding: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10,
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            titleColor: "#334155",
                            bodyColor: "#334155",
                            titleFont: {
                              size: 13,
                              weight: "bold",
                            },
                            bodyFont: {
                              size: 13,
                            },
                            padding: 12,
                            boxPadding: 8,
                            cornerRadius: 8,
                            borderColor: "rgba(226, 232, 240, 0.8)",
                            borderWidth: 1,
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `Expenses: ${currencySymbol}${value.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            border: {
                              display: false,
                            },
                            grid: {
                              color: "rgba(226, 232, 240, 0.5)",
                              tickLength: 8,
                            },
                            ticks: {
                              font: {
                                size: 11,
                              },
                              padding: 10,
                              callback: (value) => `${currencySymbol}${value}`,
                            },
                          },
                          x: {
                            border: {
                              display: false,
                            },
                            grid: {
                              display: false,
                            },
                            ticks: {
                              font: {
                                size: 11,
                              },
                              maxRotation: 45,
                              minRotation: 45,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Split by Status (Bar Chart) */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-3 transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                      <FontAwesomeIcon
                        icon={faChartLine}
                        className="text-white text-lg"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Expense Status by Category
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex-1 min-w-[180px] bg-emerald-50 rounded-lg p-4">
                      <div className="text-sm text-emerald-600 mb-1">
                        Total Settled
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {currencySymbol}
                        {(summary?.totalSettled || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px] bg-amber-50 rounded-lg p-4">
                      <div className="text-sm text-amber-600 mb-1">
                        Total Pending
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {currencySymbol}
                        {(summary?.totalPending || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px] bg-sky-50 rounded-lg p-4">
                      <div className="text-sm text-sky-600 mb-1">
                        Settlement Ratio
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {(() => {
                          const settled = summary?.totalSettled || 0;
                          const total =
                            (summary?.totalSettled || 0) +
                            (summary?.totalPending || 0);
                          return total > 0
                            ? `${Math.round((settled / total) * 100)}%`
                            : "0%";
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px]">
                    <Bar
                      data={{
                        labels: Object.keys(displayData?.breakdown || {}),
                        datasets: [
                          {
                            label: "Settled",
                            data: Object.keys(displayData?.breakdown || {}).map(
                              (key) => displayData?.breakdownSettled?.[key] || 0
                            ),
                            backgroundColor: "rgba(16, 185, 129, 0.7)",
                            borderRadius: 6,
                            borderSkipped: false,
                          },
                          {
                            label: "Pending",
                            data: Object.keys(displayData?.breakdown || {}).map(
                              (key) => displayData?.breakdownPending?.[key] || 0
                            ),
                            backgroundColor: "rgba(245, 158, 11, 0.7)",
                            borderRadius: 6,
                            borderSkipped: false,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        layout: {
                          padding: 10,
                        },
                        plugins: {
                          legend: {
                            position: "top",
                            align: "end",
                            labels: {
                              boxWidth: 12,
                              usePointStyle: true,
                              pointStyle: "rectRounded",
                              padding: 15,
                              font: {
                                size: 12,
                              },
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            titleColor: "#334155",
                            bodyColor: "#334155",
                            bodyFont: {
                              size: 13,
                            },
                            padding: 12,
                            boxPadding: 8,
                            cornerRadius: 8,
                            borderColor: "rgba(226, 232, 240, 0.8)",
                            borderWidth: 1,
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `${
                                  context.dataset.label
                                }: ${currencySymbol}${value.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                            border: {
                              display: false,
                            },
                            ticks: {
                              font: {
                                size: 12,
                              },
                            },
                          },
                          y: {
                            beginAtZero: true,
                            border: {
                              display: false,
                            },
                            grid: {
                              color: "rgba(226, 232, 240, 0.5)",
                            },
                            ticks: {
                              font: {
                                size: 12,
                              },
                              callback: (value) => `${currencySymbol}${value}`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseCharts;
