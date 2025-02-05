import { writeFileSync, readFileSync } from "fs";

// Read supporters data.
const supporters_data = JSON.parse(readFileSync("./supporters_data.json", "utf8"));

// Read supporters settings data.
import { supporters_settings } from "./supporters_settings.js";

let credit_pending_count = 0;
const checkWHetherToShowSupporter = (supporter_data) => {
    if (supporter_data.supporter_id === "" || supporter_data.display_name === "") return false;

    const months = Object.keys(supporter_data).filter((key) => supporters_settings.calc_support_period.includes(key));
    const has_valid_month = months.some((month) => supporter_data[month]);
    if (!has_valid_month) return false;

    const basic_300_months = months.filter((month) => supporter_data[month] === "basic_300");
    const has_special_plan = months.some((month) => ["fuwa_500", "mochi_1000", "mogu_2000"].includes(supporter_data[month]));

    if (basic_300_months.length === 1 && !has_special_plan) {
        credit_pending_count++;
        return false;
    }

    return true;
};

const adjustSupportersData = (supporter_data) => {
    let highest_plan = "";
    for (const month of supporters_settings.calc_supporting_months) {
        if (supporter_data[month]) {
            if (supporters_settings.plan_priority.indexOf(supporter_data[month]) < supporters_settings.plan_priority.indexOf(highest_plan)) {
                highest_plan = supporter_data[month];
            }
        }
    }



    return {
        ...supporter_data,
        highest_plan_during_the_period: highest_plan,
    };
};

let adjusted_supporters_data = [];
for (let supporter_data of supporters_data) {
    const to_display = checkWHetherToShowSupporter(supporter_data);
    if (!to_display) continue;

    supporter_data = adjustSupportersData(supporter_data);
    adjusted_supporters_data.push(supporter_data);
}


writeFileSync("./adjusted_supporters_data.json", JSON.stringify(adjusted_supporters_data, null, 4));



const filtered_supporters_data = adjusted_supporters_data.map(({ name, display_name, memo, ...rest }) => rest);


const filtered_data = {
    supporters_data: filtered_supporters_data,
    supporters_settings: supporters_settings,
};

// Write output JSON file.
writeFileSync("src/assets/supporters/data.json", JSON.stringify(filtered_data, null, 4));
console.log(`JSONファイルを書き出しました！ ${supporters_settings.last_updated_utc_date}`);