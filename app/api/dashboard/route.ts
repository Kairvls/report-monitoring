import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 🔹 BASIC COUNTS
    const [totalRows]: any = await db.query(
      "SELECT COUNT(*) as count FROM reports"
    );

    const [pendingRows]: any = await db.query(
      "SELECT COUNT(*) as count FROM reports WHERE date_completed IS NULL"
    );

    const [completedRows]: any = await db.query(
      "SELECT COUNT(*) as count FROM reports WHERE date_completed IS NOT NULL"
    );

    const [delayedRows]: any = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE deadline < NOW() AND date_completed IS NULL`
    );

    const total = totalRows?.[0]?.count ?? 0;
    const pending = pendingRows?.[0]?.count ?? 0;
    const completed = completedRows?.[0]?.count ?? 0;
    const delayed = delayedRows?.[0]?.count ?? 0;

    // 🔥 TREND (SAFE DATE FIX)
    const [trendRows]: any = await db.query(`
      SELECT DATE(date_started) as date, COUNT(*) as count
      FROM reports
      GROUP BY DATE(date_started)
      ORDER BY date ASC
      LIMIT 7
    `);

    const labels = trendRows.map((t: any) => t.date);
    const trend = trendRows.map((t: any) => t.count);

    // 🔥 AGENCY
    const [agencyRows]: any = await db.query(`
      SELECT agency, COUNT(*) as count
      FROM reports
      GROUP BY agency
      LIMIT 5
    `);

    const agency = agencyRows.map((a: any) => a.count);

    // 🔥 TYPE
    const [typeRows]: any = await db.query(`
      SELECT report_type, COUNT(*) as count
      FROM reports
      GROUP BY report_type
    `);

    const type = typeRows.map((t: any) => t.count);

    // 🔥 FIXED CANDLE (IMPORTANT PART)
    const candles = trendRows.map((t: any) => {
      const date = t.date ? new Date(t.date).getTime() : Date.now();

      const value = Number(t.count) || 0;

      return {
        x: date, // ✅ must be timestamp
        y: [
          value - 2,
          value + 5,
          value - 5,
          value,
        ],
      };
    });

    return NextResponse.json({
      stats: {
        total: Number(total),
        pending: Number(pending),
        completed: Number(completed),
        delayed: Number(delayed),
      },

      candles,
      trend,
      labels,

      agency,
      type,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}