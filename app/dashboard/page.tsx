"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type SubmissionMode = "email" | "website" | "lbc";

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
      const res = await fetch("/api/reports", { cache: "no-store" });
      if (!res.ok) return;
  
      const reports = await res.json();
  
      generateDashboardData(reports);
    } catch (err) {
      console.error(err);
    }
  };

  const generateDashboardData = (reports: any[]) => {
    const now = new Date();
  
    let pending = 0;
    let completed = 0;
    let delayed = 0;
  
    const monthlyMap: Record<string, number> = {};
    const weeklyMap = [0, 0, 0, 0, 0, 0, 0];
  
    const submissionModes: Record<SubmissionMode, number> = {
      email: 0,
      website: 0,
      lbc: 0,
    };
    const reportTypes = {
      annual: 0,
      semiAnnual: 0,
      quarterly: 0,
      monthly: 0,
    };
  
    const agencyMap: Record<string, number> = {};
  
    reports.forEach((r) => {
      const started = new Date(r.date_started);
      const deadline = new Date(r.deadline);
  
      // STATUS
      if (r.date_completed) completed++;
      else if (deadline < now) delayed++;
      else pending++;
  
      // MONTHLY TREND
      const monthKey = started.toLocaleString("en-US", {
        month: "short",
      });
  
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
  
      // WEEKLY ACTIVITY
      const day = started.getDay(); // 0 = Sunday
      const index = day === 0 ? 6 : day - 1; // make Monday first
      weeklyMap[index]++;
  
      // SUBMISSION MODE
      const mode = r.mode_of_submission as SubmissionMode;

      if (submissionModes[mode] !== undefined) {
        submissionModes[mode]++;
      }
  
      // REPORT TYPE
      const type = r.report_type;

      if (type === "semi-annual") {
        reportTypes.semiAnnual++;
      } else if (type === "annual") {
        reportTypes.annual++;
      } else if (type === "quarterly") {
        reportTypes.quarterly++;
      } else if (type === "monthly") {
        reportTypes.monthly++;
      }
  
      // AGENCY LOAD
      agencyMap[r.agency] = (agencyMap[r.agency] || 0) + 1;
    });
  
    // MONTH LABELS SORTED
    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const monthlyLabels = monthOrder.filter(m => monthlyMap[m]);
    const monthlyTrend = monthlyLabels.map(m => monthlyMap[m]);
  
    // TOP 5 AGENCIES
    const agencyLoads = Object.entries(agencyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  
    setData({
      summary: {
        total: reports.length,
        pending,
        completed,
        delayed,
      },
      monthlyTrend,
      monthlyLabels,
      submissionModes,
      reportTypes,
      weeklyActivity: weeklyMap,
      weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      agencyLoads,
    });
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
            { from: 0, to: 0, color: "#E5E7EB" },
            { from: 1, to: 3, color: "#C4A484" },
            { from: 4, to: 7, color: "#8B5E3C" },
            { from: 8, to: 999, color: "#5C3B28" },
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
