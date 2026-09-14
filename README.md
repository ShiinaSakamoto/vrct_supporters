# VRCT Supporter Page
[VRCT Project](https://github.com/misyaguziya/VRCT)

[VRCT Supporters Page](https://shiinasakamoto.github.io/vrct_supporters/)

<div align="center">

<picture>
    <source srcset="src/assets/vrct_logo_white.png" media="(prefers-color-scheme: dark)" width="30%">
    <source srcset="src/assets/vrct_logo_black.png" media="(prefers-color-scheme: light)" width="30%">
    <img src="src/assets/vrct_logo.png" alt="VRCT Logo" width="30%">
</picture>

<br>
<br>
<br>

<a href="https://vrct-dev.fanbox.cc">
    <picture>
        <source srcset="src/assets/pixiv_fanbox_white.png" media="(prefers-color-scheme: dark)" height="18px">
        <source srcset="src/assets/pixiv_fanbox_black.png" media="(prefers-color-scheme: light)" height="18px">
        <img src="src/assets/pixiv_fanbox_black.png" alt="PIXIV FANBOX" height="18px">
    </picture>
</a>&emsp;&nbsp;

<a href="https://patreon.com/vrct_dev">
    <picture>
        <source srcset="src/assets/patreon_logo_white.png" media="(prefers-color-scheme: dark)" height="22px">
        <source srcset="src/assets/patreon_logo_black.png" media="(prefers-color-scheme: light)" height="22px">
        <img src="src/assets/patreon_logo_black.png" alt="Patreon" height="22px">
    </picture>
</a>&emsp;&nbsp;

<br>
<br>

<picture>
    <source srcset="src/assets/supporter_section_border_d.png" media="(prefers-color-scheme: dark)">
    <source srcset="src/assets/supporter_section_border_l.png" media="(prefers-color-scheme: light)">
    <img src="src/assets/supporter_section_border_d.png" alt="Supporter Section Border">
</picture>

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

---
<div align="left">

#### publish process:
1. VRCTサポーターリストをアップデート（Googleスプシー）
2. 上部メニューのJSONからJSONで出力 ダウンロード
3. ダウンロードファイルをルートディレクトリに配置or上書き（`supporters_data.json`）
4. `npm run publish` を実行
   - **日時・集計月の自動補完**: 実行日（JST）・`23:59:59`・当月が初期値として提示されるため、**Enterキーを押すだけ**で適用されます（変更したい場合のみ直接入力）。
   - **データ生成 & ビルド**: `output_json.js`, `output_labels.js`, `vite build` が自動で順次実行されます。
   - **機密データ漏洩セーフガード**: `supporters_data.json` や `adjusted_supporters_data.json` が Git の追跡・ステージング対象に入っていないか自動検査されます。
   - **プレビュー確認（任意）**: 必要に応じてローカルプレビューを起動して確認できます。
   - **Gitコミット**: `[Update] YYYY-MM-DD`（追記コメントも可能）で自動コミットされます。
   - **安全なPush制御**:
     - `main` 以外のブランチ（例: `develop`）では、push は自動停止されます（ローカルコミットのみ完了）。
     - `main` ブランチの場合でも、push 直前に最終確認プロンプト（`y/N`）が表示され、`y` を入力した場合のみ `git push` が実行されます。
5. GitHubページ（およびVRCT本体）で更新を確認

*(※ 個別に手動実行したい場合は従来通り `npm run dev-ui`, `npm run build`, `npm run preview` も使用可能です)*


#### Add a supporter icon process:
- もらった画像をFigma または手動でサイズを 120 x 120 (px) に変更、ファイル名を supporter_icon_xx (xx は手動で連番計算 新規アイコンではなく、更新の場合は前回と同じ supporter_icon_id) にする
- 画像ファイルを'src\assets\supporters\supporters_icons'に配置
- VRCTサポーターリストの該当サポーター行の supporter_icon_id に 先程の番号を入力
- 以降 publish process に従って更新