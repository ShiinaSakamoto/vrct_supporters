import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync, spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 対話型プロンプト（対話端末およびパイプ入力の両方で安定動作）
const createPrompt = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    const lines = [];
    const lineResolvers = [];

    rl.on("line", (line) => {
        if (lineResolvers.length > 0) {
            const resolve = lineResolvers.shift();
            resolve(line);
        } else {
            lines.push(line);
        }
    });

    const ask = (query) => {
        process.stdout.write(query);
        if (lines.length > 0) {
            const line = lines.shift();
            if (!process.stdin.isTTY) {
                console.log(line);
            }
            return Promise.resolve(line);
        }
        return new Promise((resolve) => {
            lineResolvers.push((line) => {
                if (!process.stdin.isTTY) {
                    console.log(line);
                }
                resolve(line);
            });
        });
    };

    const close = () => rl.close();

    return { ask, close };
};

// 日本時間 (JST) の現在日時情報を取得
const getJSTDateParts = () => {
    const now = new Date();
    const jstFormatter = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    const parts = jstFormatter.formatToParts(now);
    const getPart = (type) => parts.find((p) => p.type === type)?.value || "";
    return {
        year: getPart("year"),
        month: getPart("month"),
        day: getPart("day"),
        hour: getPart("hour"),
        min: getPart("minute"),
        sec: getPart("second"),
    };
};

const runCommand = (cmd, description) => {
    console.log(`\n▶ ${description} (${cmd})`);
    try {
        execSync(cmd, { stdio: ["ignore", "inherit", "inherit"], cwd: __dirname });
    } catch (error) {
        console.error(`\n❌ コマンド実行に失敗しました: ${cmd}`);
        throw error;
    }
};

const checkSensitiveFilesSecurity = () => {
    const sensitiveFiles = ["supporters_data.json", "adjusted_supporters_data.json"];

    // 1. git status (untracked または modified で検出されていないか)
    const statusOutput = execSync("git status --porcelain", { encoding: "utf8", cwd: __dirname });
    for (const line of statusOutput.split("\n")) {
        for (const file of sensitiveFiles) {
            if (line.includes(file)) {
                throw new Error(
                    `【機密データ漏洩の危険】"${file}" が Git の追跡/未無視対象になっています！\n.gitignore の設定を確認してください。処理を中止します。`
                );
            }
        }
    }

    // 2. git cached (ステージングされていないか)
    const stagedOutput = execSync("git diff --cached --name-only", { encoding: "utf8", cwd: __dirname });
    for (const file of stagedOutput.split("\n")) {
        const trimmed = file.trim();
        if (sensitiveFiles.includes(trimmed)) {
            throw new Error(
                `【機密データ漏洩の危険】"${trimmed}" が Git にステージングされています！\ngit reset してステージングを解除してください。処理を中止します。`
            );
        }
    }
};

const updateSupportersSettings = ({ year, month, day, hour, min, sec, calcLatestMonth }) => {
    const settingsPath = path.join(__dirname, "supporters_settings.js");
    let content = fs.readFileSync(settingsPath, "utf8");

    content = content.replace(/const year = "[^"]*";/, `const year = "${year}";`);
    content = content.replace(/const month = "[^"]*";/, `const month = "${month}";`);
    content = content.replace(/const day = "[^"]*";/, `const day = "${day}";`);
    content = content.replace(/const hour = "[^"]*";/, `const hour = "${hour}";`);
    content = content.replace(/const min = "[^"]*";/, `const min = "${min}";`);
    content = content.replace(/const sec = "[^"]*";/, `const sec = "${sec}";`);
    content = content.replace(/const calc_latest_month = "[^"]*";/, `const calc_latest_month = "${calcLatestMonth}";`);

    fs.writeFileSync(settingsPath, content, "utf8");
    console.log(`\n✔ supporters_settings.js を更新しました (${year}-${month}-${day} ${hour}:${min}:${sec}, latest: ${calcLatestMonth})`);
};

async function main() {
    const prompt = createPrompt();

    console.log("==================================================");
    console.log("   VRCT Supporters - Publish & Update Workflow    ");
    console.log("==================================================");

    try {
        // 1. 前提チェック: supporters_data.json の存在確認
        const rawDataPath = path.join(__dirname, "supporters_data.json");
        if (!fs.existsSync(rawDataPath)) {
            console.error("\n❌ supporters_data.json が見つかりません。");
            console.error("Googleスプレッドシートのメニュー等からJSONをエクスポートし、ルートディレクトリに配置してから再実行してください。\n");
            process.exit(1);
        }

        // Gitブランチ確認
        const currentBranch = execSync("git branch --show-current", { encoding: "utf8", cwd: __dirname }).trim();
        console.log(`\n🌿 現在の Git ブランチ: [ ${currentBranch} ]`);
        if (currentBranch !== "main") {
            console.log("⚠️  main ブランチ以外で実行されています。コミットは行われますが、リモートへの push は自動的にスキップされます。");
        }

        // 2. 日時・対象月の対話型入力（デフォルト値付き、Enterで即決定）
        const jst = getJSTDateParts();
        const defaultDate = `${jst.year}-${jst.month}-${jst.day}`;
        const defaultTime = "23:59:59";
        const defaultMonth = `${jst.year}-${jst.month}`;

        console.log("\n--- [1/4] 設定確認 (Enterキーで初期値を採用) ---");

        // 日付
        const inputDateRaw = await prompt.ask(`更新日付 (YYYY-MM-DD) [初期値: ${defaultDate}]: `);
        const targetDate = inputDateRaw.trim() || defaultDate;
        const [targetYear, targetMonth, targetDay] = targetDate.split("-");

        if (!targetYear || !targetMonth || !targetDay) {
            throw new Error(`日付の形式が正しくありません: ${targetDate} (例: 2026-09-15)`);
        }

        // 時刻
        const inputTimeRaw = await prompt.ask(`更新時刻 (HH:mm:ss) [初期値: ${defaultTime}]: `);
        const targetTime = inputTimeRaw.trim() || defaultTime;
        const [targetHour, targetMin, targetSec] = targetTime.split(":");

        if (!targetHour || !targetMin || !targetSec) {
            throw new Error(`時刻の形式が正しくありません: ${targetTime} (例: 23:59:59)`);
        }

        // 計算最新月
        const calculatedLatestMonth = `${targetYear}-${targetMonth}`;
        const inputMonthRaw = await prompt.ask(`集計最新月 (YYYY-MM) [初期値: ${calculatedLatestMonth}]: `);
        const targetCalcLatestMonth = inputMonthRaw.trim() || calculatedLatestMonth;

        // 設定ファイルの更新
        updateSupportersSettings({
            year: targetYear,
            month: targetMonth,
            day: targetDay,
            hour: targetHour,
            min: targetMin,
            sec: targetSec,
            calcLatestMonth: targetCalcLatestMonth,
        });

        // 3. データ変換・ラベル画像生成・ビルド実行
        console.log("\n--- [2/4] データ生成 & ビルド実行 ---");
        runCommand("node output_json.js", "サポーターデータの集計・変換");
        runCommand("node output_labels.js", "ネームラベル画像の生成");
        runCommand("npx vite build", "本番環境用 Vite ビルド (docs/ 出力)");

        // 4. 機密データ漏洩チェック
        console.log("\n--- [3/4] 機密データ安全確認 (Security Check) ---");
        checkSensitiveFilesSecurity();
        console.log("✔ supporters_data.json / adjusted_supporters_data.json は安全に除外されています。");

        // プレビュー確認オプション
        const wantPreview = await prompt.ask("\nローカルプレビューを起動して確認しますか？ (y/N) [初期値: N]: ");
        if (wantPreview.trim().toLowerCase() === "y") {
            console.log("\n🔍 プレビューサーバーを起動します... (ブラウザで確認してください)");
            const previewProcess = spawn("npx", ["vite", "preview", "--open"], {
                cwd: __dirname,
                shell: true,
                stdio: ["ignore", "inherit", "inherit"],
            });

            await prompt.ask("\n👉 プレビュー確認後、Enterキーを押して続行してください...");
            previewProcess.kill();
        }

        // 変更差分の確認
        console.log("\n変更されたファイル:");
        const changedFiles = execSync("git status --short", { encoding: "utf8", cwd: __dirname });
        console.log(changedFiles || "（変更なし）");

        // 5. コミット
        console.log("\n--- [4/4] Git コミット & プッシュ ---");
        const defaultCommitMsg = `[Update] ${targetDate}`;
        const extraMsgRaw = await prompt.ask(`追加のコミットメッセージ（任意。空欄なら "${defaultCommitMsg}" のみ）: `);
        const extraMsg = extraMsgRaw.trim();
        const finalCommitMsg = extraMsg ? `${defaultCommitMsg} ${extraMsg}` : defaultCommitMsg;

        const confirmCommit = await prompt.ask(`上記の変更をコミットしますか？ (Y/n) [初期値: Y]: `);
        if (confirmCommit.trim().toLowerCase() === "n") {
            console.log("\nℹ️ コミットを中止しました。ビルド結果はローカルに残っています。");
            return;
        }

        runCommand("git add .", "変更をステージング");
        // add 後にもう一度機密ファイルがステージングされていないか念のためチェック
        checkSensitiveFilesSecurity();
        runCommand(`git commit -m "${finalCommitMsg}"`, `コミット作成: "${finalCommitMsg}"`);

        // 6. Push 判定
        if (currentBranch !== "main") {
            console.log(`\nℹ️ 現在のブランチは "${currentBranch}" です。`);
            console.log(`main 以外のブランチのため、リモートへの push は行いませんでした。`);
            console.log(`ローカルへのコミットは正常に完了しています。main へのマージ後に push してください。\n`);
        } else {
            const confirmPush = await prompt.ask(`\norigin/main に push しますか？ (Y/n) [初期値: Y]: `);
            if (confirmPush.trim().toLowerCase() !== "n" && confirmPush.trim().toLowerCase() !== "no") {
                // プロンプトを閉じて標準入力を git push (SSHパスフレーズやパスワード入力) に渡せるようにする
                prompt.close();
                console.log("\n▶ GitHub への push 実行 (git push)");
                try {
                    execSync("git push", { stdio: "inherit", cwd: __dirname });
                    console.log("\n🎉 GitHub への push が完了しました！");
                    console.log("GitHub Pages および VRCT 本体での反映を確認してください。\n");
                } catch (pushError) {
                    console.error("\n❌ git push に失敗しました。ネットワークや認証状態を確認してください。");
                    console.log("必要に応じて手動で `git push` を実行してください。\n");
                }
                return;
            } else {
                console.log("\nℹ️ push はスキップしました。コミットは正常に完了しています。");
                console.log("公開する準備ができたら、手動で `git push` を実行してください。\n");
            }
        }
    } catch (error) {
        console.error("\n❌ エラーが発生したため中断しました:", error.message || error);
        process.exit(1);
    } finally {
        prompt.close();
    }
}

main();
