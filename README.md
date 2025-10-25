# VRCT Supporter Page
[VRCT Project](https://github.com/misyaguziya/VRCT)

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

<a href="https://ko-fi.com/vrct_dev">
    <picture>
        <img src="src/assets/kofi_logo.png" alt="Ko-fi" height="22px">
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
- VRCTサポーターリストをアップデート（Googleスプシー）
- 上部メニューのJSONからJSONで出力 ダウンロード
- ダウンロードファイルをルートディレクトリに配置or上書き
- `supporters_settings.js` にて設定 monthやdayを設定 hourはその日いっぱいまでの計算であれば23時でOK（0埋め 日本時間で記述）
- `supporters_settings.js` 必要であれば`calc_latest_month`を更新
- `npm run dev-ui`でエラーなく更新されていることを確認（buildは本番環境用のファイルを上書きするからミスってた時、修正がめんどくさいので事前確認したい）
- `npm run build`で本番環境用ビルド
- `npm run preview` でエラーなく更新されていることを確認（本番環境）
- `supporters_data.json`と`adjusted_supporters_data`がgitignoreされていることを確認
- git add .
- （任意）`develop`ブランチ
- git commit `[Update] 2025-xx-xx` プラスなにかアプデがあれば
- （任意）mainにマージ `develop`から`main`
- git push
- githubページで更新を確認後 VRCT本体でも更新を確認


#### Add a supporter icon process:
- もらった画像をFigma または手動でサイズを 120 x 120 (px) に変更、ファイル名を supporter_icon_xx (xx は手動で連番計算 新規アイコンではなく、更新の場合は前回と同じ supporter_icon_id) にする
- 画像ファイルを'src\assets\supporters\supporters_icons'に配置
- VRCTサポーターリストの該当サポーター行の supporter_icon_id に 先程の番号を入力
- 以降 publish process に従って更新