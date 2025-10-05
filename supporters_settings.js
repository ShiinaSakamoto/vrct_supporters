import fg from "fast-glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// this functions generates, like, ["2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04"]
const generateMonthRange = (range_mode, date_str1, date_str2) => {
    const result = [];

    if (range_mode === "range") {
        // 両方とも "YYYY-MM" 形式の文字列の場合、
        // 早い方から遅い方までの月を配列にする
        const [year1, month1] = date_str1.split("-").map(Number);
        const [year2, month2] = date_str2.split("-").map(Number);
        // 比較のため、月数に変換
        const total1 = year1 * 12 + month1;
        const total2 = year2 * 12 + month2;
        let start_year, start_month, end_year, end_month;
        if (total1 <= total2) {
            start_year = year1;
            start_month = month1;
            end_year = year2;
            end_month = month2;
        } else {
            start_year = year2;
            start_month = month2;
            end_year = year1;
            end_month = month1;
        }

        let current_year = start_year;
        let current_month = start_month;
        while (
            current_year < end_year ||
            (current_year === end_year && current_month <= end_month)
        ) {
            result.push(`${current_year}-${String(current_month).padStart(2, "0")}`);
            current_month++;
            if (current_month > 12) {
            current_month = 1;
            current_year++;
            }
        }
    } else if (range_mode === "offset") {
        // date_str1 を基準月、date_str2 をオフセット（数値または数値文字列）として扱う
        const offset = Number(date_str2);
        const [base_year, base_month] = date_str1.split("-").map(Number);
        const base_total_months = base_year * 12 + (base_month - 1);

        if (offset > 0) {
            // 基準月から後ろへ offset 個分（基準月を含む）
            for (let i = 0; i < offset; i++) {
                const total_months = base_total_months + i;
                const y = Math.floor(total_months / 12);
                const m = (total_months % 12) + 1;
                result.push(`${y}-${String(m).padStart(2, "0")}`);
            }
        } else if (offset < 0) {
            // 基準月までの前の月を含めて、絶対値個分
            const n = Math.abs(offset);
            for (let i = n - 1; i >= 0; i--) {
                const total_months = base_total_months - i;
                const y = Math.floor(total_months / 12);
                const m = (total_months % 12) + 1;
                result.push(`${y}-${String(m).padStart(2, "0")}`);
            }
        } else {
            // offset が 0 の場合は基準月のみ
            result.push(date_str1);
        }
    } else {
        throw new Error("無効な range_mode です。'range' または 'offset' を指定してください。");
    }

    return result;
};


// 0埋め 最終更新（とする）日時
const year = "2025";
const month = "10";
const day = "05";

const hour = "23";
const min = "59";
const sec = "59";

const calc_latest_month = "2025-10";

export const supporters_settings = {
    last_updated_utc_date: new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}+09:00`),
    plan_priority:["mogu_2000", "mochi_1000", "fuwa_500", "basic_300", ""],
    calc_supporting_months: generateMonthRange("offset", calc_latest_month, "-2"), // -2 = 今月+先月の2ヶ月分計算
    calc_support_period: generateMonthRange("range", "2024-10", calc_latest_month),
    chato_ex_count: Object.keys(fg.sync(path.join(__dirname, "src/assets/supporters/chato_expressions/*.png").replace(/\\/g, "/"))).length,
};