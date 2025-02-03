import fg from "fast-glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const supporters_settings = {
    last_updated_utc_date: new Date(),
    target_supporting_month: "2025-01",
    calc_support_period: ["2024-10", "2024-11", "2024-12", "2025-01"],
    chato_ex_count: Object.keys(fg.sync(path.join(__dirname, "src/assets/supporters/chato_expressions/*.png").replace(/\\/g, "/"))).length,
};