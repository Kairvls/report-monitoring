import cron from "node-cron";
import { db } from "@/lib/db";

export function startDeadlineChecker() {
  cron.schedule("0 * * * *", async () => {
    // runs every hour
    const [rows]: any = await db().query(`
      SELECT * FROM reports
      WHERE deadline IS NOT NULL
    `);

    const now = new Date();

    for (const r of rows) {
      const deadline = new Date(r.deadline);
      const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (diff <= 2 && diff >= 0) {
        await db().query(
          `INSERT INTO notifications (report_id, message)
           VALUES (?, ?)`,
          [r.id, `Report "${r.report_name}" is due soon`]
        );
      }
    }
  });
}
