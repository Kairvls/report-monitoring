"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type DashboardData = {
  summary: {
    total: number;
    pending: number;
    completed: number;
    delayed: number;
  };
  monthlyTrend: number[];
  monthlyLabels: string[];
  submissionModes: {
    email: number;
    website: number;
    lbc: number;
  };
  reportTypes: {
    annual: number;
    semiAnnual: number;
    quarterly: number;
    monthly: number;
  };
  weeklyActivity: number[];
  weeklyLabels: string[];
  agencyLoads: {
    name: string;
    count: number;
  }[];
};

const defaultData: DashboardData = {
  summary: {
    total: 0,
    pending: 0,
    completed: 0,
    delayed: 0,
  },
  monthlyTrend: [0, 0, 0, 0, 0, 0],
  monthlyLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  submissionModes: {
    email: 0,
    website: 0,
    lbc: 0,
  },
  reportTypes: {
    annual: 0,
    semiAnnual: 0,
    quarterly: 0,
    monthly: 0,
  },
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  agencyLoads: [
    { name: "Agency A", count: 0 },
    { name: "Agency B", count: 0 },
    { name: "Agency C", count: 0 },
    { name: "Agency D", count: 0 },
    { name: "Agency E", count: 0 },
  ],
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(defaultData);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) return;

      const payload = await res.json();

      // You can map your API data here.
      // If your backend still only returns stats, these defaults will still work.
      setData({
        summary: {
          total: Number(payload?.summary?.total ?? payload?.stats?.total ?? 0),
          pending: Number(payload?.summary?.pending ?? payload?.stats?.pending ?? 0),
          completed: Number(payload?.summary?.completed ?? payload?.stats?.completed ?? 0),
          delayed: Number(payload?.summary?.delayed ?? payload?.stats?.delayed ?? 0),
        },
        monthlyTrend: payload?.monthlyTrend ?? [12, 18, 10, 22, 16, 28],
        monthlyLabels: payload?.monthlyLabels ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        submissionModes: {
          email: Number(payload?.submissionModes?.email ?? 12),
          website: Number(payload?.submissionModes?.website ?? 8),
          lbc: Number(payload?.submissionModes?.lbc ?? 5),
        },
        reportTypes: {
          annual: Number(payload?.reportTypes?.annual ?? 3),
          semiAnnual: Number(payload?.reportTypes?.semiAnnual ?? 5),
          quarterly: Number(payload?.reportTypes?.quarterly ?? 9),
          monthly: Number(payload?.reportTypes?.monthly ?? 15),
        },
        weeklyActivity: payload?.weeklyActivity ?? [3, 5, 2, 7, 4, 6, 1],
        weeklyLabels: payload?.weeklyLabels ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        agencyLoads: payload?.agencyLoads ?? [
          { name: "DepEd", count: 12 },
          { name: "CHED", count: 8 },
          { name: "DOLE", count: 6 },
          { name: "TESDA", count: 10 },
          { name: "LGU", count: 7 },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const black = "#0F172A";
  const brown = "#8B5E3C";
  const beige = "#C4A484";
  const gray = "#94A3B8";

  const tooltip: ApexOptions["tooltip"] = {
    theme: "dark",
  };

  // 1) REPORTS TREND - AREA CHART
  const lineOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 4, colors: [brown] },
    colors: [brown],
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        opacityFrom: 0.6,
        opacityTo: 0.05,
      },
    },
    grid: { borderColor: "#E5E7EB", strokeDashArray: 4 },
    xaxis: {
      categories: data.monthlyLabels,
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const lineSeries = [
    {
      name: "Reports",
      data: data.monthlyTrend,
    },
  ];

  // 2) COMPLETION RATE - RADIAL
  const completionRate = Math.round(
    (data.summary.completed / (data.summary.total || 1)) * 100
  );

  const radialOptions: ApexOptions = {
    chart: { type: "radialBar" },
    colors: [brown],
    plotOptions: {
      radialBar: {
        hollow: { size: "65%" },
        dataLabels: {
          value: {
            color: black,
            fontSize: "22px",
            fontWeight: 700,
          },
        },
      },
    },
    labels: ["Completion"],
    tooltip,
  };

  const radialSeries = [completionRate];

  // 3) STATUS BREAKDOWN - DONUT
  const donutOptions: ApexOptions = {
    labels: ["Pending", "Completed", "Delayed"],
    colors: [brown, black, beige],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    tooltip,
  };

  const donutSeries = [
    data.summary.pending,
    data.summary.completed,
    data.summary.delayed,
  ];

  // 4) OVERVIEW - BAR CHART (REPORT TYPES)
  const barOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 8, columnWidth: "45%" },
    },
    colors: [black],
    xaxis: {
      categories: ["Annual", "Semi-Annual", "Quarterly", "Monthly"],
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const barSeries = [
    {
      name: "Report Types",
      data: [
        data.reportTypes.annual,
        data.reportTypes.semiAnnual,
        data.reportTypes.quarterly,
        data.reportTypes.monthly,
      ],
    },
  ];

  // 5) QUICK TREND - HEATMAP (WEEKLY ACTIVITY)
  const heatmapOptions: ApexOptions = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
    },
    colors: [brown],
    dataLabels: { enabled: false },
    plotOptions: {
      heatmap: {
        radius: 4,
        shadeIntensity: 0.6,
        colorScale: {
          ranges: [
            { from: 0, to: 2, color: "#E5E7EB" },
            { from: 3, to: 5, color: "#C4A484" },
            { from: 6, to: 10, color: "#8B5E3C" },
            { from: 11, to: 999, color: "#5C3B28" },
          ],
        },
      },
    },
    xaxis: {
      categories: data.weeklyLabels,
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const heatmapSeries = [
    {
      name: "Activity",
      data: data.weeklyLabels.map((day, index) => ({
        x: day,
        y: data.weeklyActivity[index] ?? 0,
      })),
    },
  ];

  // 6) WEEKLY WORKLOAD - HORIZONTAL BAR (AGENCY LOADS)
  const workloadOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "45%",
        borderRadius: 6,
      },
    },
    colors: [brown],
    xaxis: {
      categories: data.agencyLoads.map((a) => a.name),
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const workloadSeries = [
    {
      name: "Agency Load",
      data: data.agencyLoads.map((a) => a.count),
    },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm">Fully Stable Reporting System</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total" value={data.summary.total} />
        <Card title="Pending" value={data.summary.pending} />
        <Card title="Completed" value={data.summary.completed} />
        <Card title="Delayed" value={data.summary.delayed} />
      </div>

      {/* SAME 6-CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Reports Trend</h2>
          <Chart options={lineOptions} series={lineSeries} type="area" height={300} />
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Completion Rate</h2>
          <Chart
            options={radialOptions}
            series={radialSeries}
            type="radialBar"
            height={300}
          />
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Status Breakdown</h2>
          <Chart options={donutOptions} series={donutSeries} type="donut" height={280} />
        </div>

        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Overview</h2>
          <Chart options={barOptions} series={barSeries} type="bar" height={280} />
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Quick Trend</h2>
          <Chart
            options={heatmapOptions}
            series={heatmapSeries}
            type="heatmap"
            height={180}
          />
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Weekly Workload</h2>
          <Chart
            options={workloadOptions}
            series={workloadSeries}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-black mt-1">{value}</h2>
    </div>
  );
}
