"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Stats = {
  total: number;
  pending: number;
  completed: number;
  delayed: number;
};

const defaultStats: Stats = {
  total: 0,
  pending: 0,
  completed: 0,
  delayed: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(defaultStats);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      const s = data?.stats ?? data ?? {};

      setStats({
        total: Number(s.total ?? 0),
        pending: Number(s.pending ?? 0),
        completed: Number(s.completed ?? 0),
        delayed: Number(s.delayed ?? 0),
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

  // 🎨 COLORS
  const black = "#0F172A";
  const brown = "#8B5E3C";
  const beige = "#C4A484";
  const gray = "#94A3B8";

  const tooltip: ApexOptions["tooltip"] = {
    theme: "dark",
  };

  // 📈 LINE
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
      categories: ["Total", "Pending", "Completed", "Delayed"],
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const lineSeries = [
    {
      name: "Reports",
      data: [stats.total, stats.pending, stats.completed, stats.delayed],
    },
  ];

  // 📊 BAR
  const barOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 8, columnWidth: "45%" },
    },
    colors: [black],
    xaxis: {
      categories: ["Total", "Pending", "Completed", "Delayed"],
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const barSeries = [
    {
      name: "Reports",
      data: [stats.total, stats.pending, stats.completed, stats.delayed],
    },
  ];

  // 🍩 DONUT
  const donutOptions: ApexOptions = {
    labels: ["Pending", "Completed", "Delayed"],
    colors: [brown, black, beige],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    tooltip,
  };

  const donutSeries = [stats.pending, stats.completed, stats.delayed];

  // 📉 RADIAL
  const completionRate = Math.round(
    (stats.completed / (stats.total || 1)) * 100
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

  // ⚡ QUICK TREND → HEATMAP (UPDATED)
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
          ],
        },
      },
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const heatmapSeries = [
    {
      name: "Activity",
      data: [
        { x: "Mon", y: stats.pending },
        { x: "Tue", y: stats.total },
        { x: "Wed", y: stats.completed },
        { x: "Thu", y: stats.delayed },
        { x: "Fri", y: stats.completed + 1 },
        { x: "Sat", y: stats.total + 2 },
        { x: "Sun", y: stats.pending + 1 },
      ],
    },
  ];

  // 📊 WORKLOAD
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
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      labels: { style: { colors: gray } },
    },
    tooltip,
  };

  const workloadSeries = [
    {
      name: "Load",
      data: [10, 15, 7, 12, 18],
    },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-black">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Fully Stable Reporting System
        </p>
      </div>

      {/* CARDS (UNCHANGED GRID) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total" value={stats.total} />
        <Card title="Pending" value={stats.pending} />
        <Card title="Completed" value={stats.completed} />
        <Card title="Delayed" value={stats.delayed} />
      </div>

      {/* GRID (UNCHANGED) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Reports Trend</h2>
          <Chart options={lineOptions} series={lineSeries} type="area" height={300} />
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Completion Rate</h2>
          <Chart options={radialOptions} series={radialSeries} type="radialBar" height={300} />
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Status Breakdown</h2>
          <Chart options={donutOptions} series={donutSeries} type="donut" height={280} />
        </div>

        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Overview</h2>
          <Chart options={barOptions} series={barSeries} type="bar" height={280} />
        </div>

        {/* 🔥 QUICK TREND (NOW HEATMAP) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Quick Trend</h2>
          <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={180} />
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3 text-black">Weekly Workload</h2>
          <Chart options={workloadOptions} series={workloadSeries} type="bar" height={180} />
        </div>

      </div>
    </div>
  );
}

// CARD
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-black mt-1">{value}</h2>
    </div>
  );
}