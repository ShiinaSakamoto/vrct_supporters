import fs from "fs";
import path from "path";
import{ createCanvas, registerFont }from "canvas" ;
import { fileURLToPath } from "url";

import { supporters_settings } from "./supporters_settings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// エラーログ用関数
const logError = (message, error) => {
    console.error(`[ERROR] ${message}`);
    console.error(error);
};


// フォントを登録（実行環境で各フォントosにインストールしている必要あり）
try {
    registerFont(path.resolve(__dirname,"./fonts/Inter-VariableFont_opsz,wght.ttf"), { family: "Inter" }); // 英語
    registerFont(path.resolve(__dirname,"./fonts/NotoSansJP-Regular.ttf"), { family: "Noto Sans JP" }); // 日本語
    registerFont(path.resolve(__dirname,"./fonts/NotoSansKR-Regular.ttf"), { family: "Noto Sans KR" }); // 韓国語
    registerFont(path.resolve(__dirname,"./fonts/NotoSansSC-Regular.ttf"), { family: "Noto Sans SC" }); // 中国語
    console.log("[INFO] フォント登録成功");
} catch (error) {
    console.error("[ERROR] フォント登録失敗", error);
    process.exit(1);
}

// 言語を判定する関数
const detectLanguage = (text) => {
    if (/^[A-Za-z\s]+$/.test(text)) {
        return "en"; // 英語
    } else if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text)) {
        return "jp"; // 日本語
    } else if (/[\uAC00-\uD7AF]/.test(text)) {
        return "kr"; // 韓国語
    } else if (/[\u4E00-\u9FFF]/.test(text)) {
        return "cn"; // 中国語
    } else {
        return "unknown"; // その他
    }
};

// 言語ごとのフォントを指定
const getFontFamily = (language) => {
    switch (language) {
        case "en":
            return "Inter";
        case "jp":
            return "Noto Sans JP";
        case "kr":
            return "Noto Sans KR";
        case "cn":
            return "Noto Sans SC";
        default:
            return "Inter"; // デフォルトは英語のフォント
    }
};

// JSONファイルの読み込み
let supporters_json_data_for_label;
try {
    const jsonFilePath = "./adjusted_supporters_data.json";
    supporters_json_data_for_label = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    console.log("[INFO] JSONファイルの読み込みに成功しました");
} catch (error) {
    logError("JSONファイルの読み込み中にエラーが発生しました", error);
    process.exit(1);
}

// **画像出力ディレクトリの確認と作成**
const base_dir = "src/assets/supporters";
const supporters_labels_output_dir = `${base_dir}/supporters_labels`;
if (!fs.existsSync(supporters_labels_output_dir)) {
    try {
        fs.mkdirSync(supporters_labels_output_dir, { recursive: true });
        console.log(`[INFO] 出力ディレクトリを作成しました: ${supporters_labels_output_dir}`);
    } catch (error) {
        logError("出力ディレクトリの作成に失敗しました", error);
        process.exit(1);
    }
}

// 画像の高さと余白
// const canvas_height = 42;
// const padding = 50;
const text_color_white = "#f2f2f2";
const text_color_black = "#050505";

const calc_supporting_months = supporters_settings.calc_supporting_months;

const generateImage = (display_name, text_color, output_dir_path, output_filename, supporter_id) => {
    const language = detectLanguage(display_name);

    // フォントを取得
    const fontFamily = getFontFamily(language);

    const font_setting = `400 40px "${fontFamily}"`;


    // 一時キャンバスでテキストの幅と高さを計算
    const temp_canvas = createCanvas(1, 1);
    const temp_ctx = temp_canvas.getContext("2d");
    temp_ctx.font = font_setting;
    const text_metrics = temp_ctx.measureText(display_name);

    // テキストの幅と高さを取得
    const text_width = Math.ceil(text_metrics.width);
    const text_height = Math.ceil(
        text_metrics.actualBoundingBoxAscent + text_metrics.actualBoundingBoxDescent
    );

    // キャンバス幅と高さを設定
    const canvas_width = Math.max(text_width, 100); // 最小幅を指定する場合
    const canvas_height = Math.max(text_height, 50); // 最小高さを指定する場合

    // 実際のキャンバスを作成
    const canvas = createCanvas(canvas_width, canvas_height);
    const ctx = canvas.getContext("2d");

    // 背景を設定
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    // テキストを設定
    ctx.fillStyle = text_color;
    ctx.font = font_setting;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    // テキストを描画
    ctx.fillText(display_name, canvas_width / 2, canvas_height / 2);

    // 画像を書き出し
    const output_file_path = `${output_dir_path}/${output_filename}`;
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(output_file_path, buffer);

    // デバッグ用: 適用フォントとテキスト情報をログ出力
    console.log(`[DEBUG] supporter_id: ${supporter_id}, font: ${ctx.font}, text: "${display_name}" output: ${output_dir_path}`);
};

// 各オブジェクトに基づいて画像を生成
try {
    supporters_json_data_for_label.forEach((json_item) => {
        const { supporter_id, display_name } = json_item;

        // テキストを設定
        const text_color = json_item.highest_plan_during_the_period === "mogu_2000" ? text_color_black : text_color_white;

        const output_filename = `supporter_${supporter_id}.png`;
        generateImage(display_name, text_color, supporters_labels_output_dir, output_filename, supporter_id);
    });
    generateImage("And You?", text_color_white, supporters_labels_output_dir, "and_you.png", "");

    let calc_supporting_months_label = `~ ${calc_supporting_months.join(" + ")}`;

    generateImage(calc_supporting_months_label, text_color_white, base_dir, "calc_period_label.png", "");

    console.log("[INFO] すべての画像が生成されました！");
} catch (error) {
    logError("画像生成中にエラーが発生しました", error);
}

// 未処理の例外をキャッチ
process.on("uncaughtException", (error) => {
    logError("未処理の例外が発生しました", error);
    process.exit(1);
});