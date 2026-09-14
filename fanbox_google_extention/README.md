# VRCT FANBOX Supporter Highlighter & Exporter (Chrome拡張機能)

FANBOXの支援金詳細ページ（`https://www.fanbox.cc/manage/pledges/monthly/*`）にて、各支援者行をプラン別（Mogu / Mochi / Fuwa / Basic）にハイライト表示し、Patreon互換のCSV形式でダウンロードできるGoogle Chrome拡張機能です。

---

## 主な機能
1. **プラン別カラーハイライト**:
   - 各支援者行にプランのカラーボーダーと背景ハイライトを付与
   - 金額の横にプラン名バッジ（例: `[Mogu-Mogu (¥2,000)]`）を表示
2. **プラン別人数・金額のリアルタイム集計**:
   - 画面上部に専用ツールバーを自動挿入し、プラン別の人数と合計金額を表示
3. **Patreon互換CSVエクスポート**:
   - 「CSVエクスポート」ボタンをクリックするだけで、PatreonのメンバーエクスポートCSV（30列形式）と同じフォーマットでダウンロード
   - 文字化けしないBOM付きUTF-8仕様

---

## インストール手順 (Chrome)
1. Google Chrome を開く
2. アドレスバーに `chrome://extensions/` を入力して開く
3. 画面右上の **「デベロッパー モード」** をONにする
4. 左上の **「パッケージ化されていない拡張機能を読み込む」** をクリック
5. 本プロジェクトの `fanbox_google_extention` フォルダを選択する
6. インストール完了！

---

## 使い方
1. FANBOXにログインした状態で、支援金詳細ページを開きます：
   - 例: `https://www.fanbox.cc/manage/pledges/monthly/2026-09`
2. 自動的に各行がハイライトされ、上部にツールバーが表示されます
3. 「CSVエクスポート」ボタンをクリックすると、`YYYYMMDD-members-fanbox-YYYY-MM.csv` がダウンロードされます
