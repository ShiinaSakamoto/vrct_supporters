import fg from "fast-glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 0埋め 最終更新（とする）日時
const year = "2025";
const month = "03";
const day = "05";

const hour = "23";
const min = "59";
const sec = "59";

export const supporters_settings = {
    last_updated_utc_date: new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}+09:00`),
    plan_priority:["mogu_2000", "mochi_1000", "fuwa_500", "basic_300", ""],
    calc_supporting_months: ["2025-02", "2025-03"],
    calc_support_period: ["2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03"],
    chato_ex_count: Object.keys(fg.sync(path.join(__dirname, "src/assets/supporters/chato_expressions/*.png").replace(/\\/g, "/"))).length,
};