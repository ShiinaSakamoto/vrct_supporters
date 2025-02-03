import { writeFileSync, readFileSync } from "fs";

// Read supporters data.
const supporters_data = JSON.parse(readFileSync("./supporters_data.json", "utf8"));

// Read supporters settings data.
import { supporters_settings } from "./supporters_settings.js";

const data = {
    supporters_data: supporters_data,
    supporters_settings: supporters_settings,
};

// Write output JSON file.
writeFileSync("src/assets/supporters/data.json", JSON.stringify(data, null, 4));
console.log(`JSONファイルを書き出しました！ ${supporters_settings.last_updated_utc_date}`);
