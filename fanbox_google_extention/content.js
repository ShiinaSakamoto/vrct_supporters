/**
 * VRCT FANBOX Supporter Highlighter & Exporter
 * Content Script
 */

(function () {
  "use strict";

  const PLAN_DEFINITIONS = [
    {
      id: "mogu_2000",
      tierName: "Mogu-Mogu VRCT Supporter",
      shortLabel: "Mogu-Mogu",
      minAmount: 2000,
      className: "vrct-plan-mogu",
      badgeClass: "vrct-badge-mogu",
    },
    {
      id: "mochi_1000",
      tierName: "Mochi-Mochi VRCT Supporter",
      shortLabel: "Mochi-Mochi",
      minAmount: 1000,
      className: "vrct-plan-mochi",
      badgeClass: "vrct-badge-mochi",
    },
    {
      id: "fuwa_500",
      tierName: "Fuwa-Fuwa VRCT Supporter",
      shortLabel: "Fuwa-Fuwa",
      minAmount: 500,
      className: "vrct-plan-fuwa",
      badgeClass: "vrct-badge-fuwa",
    },
    {
      id: "basic_300",
      tierName: "VRCT Supporter",
      shortLabel: "Basic",
      minAmount: 300,
      className: "vrct-plan-basic",
      badgeClass: "vrct-badge-basic",
    },
  ];

  function getPlanInfo(amount) {
    for (const plan of PLAN_DEFINITIONS) {
      if (amount >= plan.minAmount) {
        return plan;
      }
    }
    return {
      id: "other",
      tierName: "Other Supporter",
      shortLabel: "Other",
      minAmount: 0,
      className: "vrct-plan-basic",
      badgeClass: "vrct-badge-basic",
    };
  }

  function getTargetYearMonth() {
    const match = window.location.pathname.match(
      /\/manage\/pledges\/monthly\/(\d{4}-\d{2})/
    );
    if (match) return match[1];

    // フォールバック: 画面上のテキストから探す
    const yearEl = document.querySelector('div[class*="styled__Year"]');
    const monthEl = document.querySelector('div[class*="styled__Month-"]');
    if (yearEl && monthEl) {
      const year = yearEl.textContent.trim();
      const month = monthEl.textContent.trim().replace(/[^0-9]/g, "").padStart(2, "0");
      if (year && month) return `${year}-${month}`;
    }

    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function parseAmount(amountStr) {
    if (!amountStr) return 0;
    const num = parseInt(amountStr.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    // 例: 2026.9.3 -> 2026-09-03 00:00:00
    const parts = dateStr.split(".");
    if (parts.length >= 3) {
      const y = parts[0].trim();
      const m = parts[1].trim().padStart(2, "0");
      const d = parts[2].trim().padStart(2, "0");
      return `${y}-${m}-${d} 00:00:00`;
    }
    return dateStr;
  }

  function escapeCsvCell(value) {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function extractSupporters() {
    const rows = document.querySelectorAll('div[class*="SupportTransaction__Wrapper"]');
    const supporters = [];

    rows.forEach((row) => {
      // ユーザーID & リンク
      const userLinkEl = row.querySelector('a[href^="/manage/relationships/"]');
      let userId = "";
      if (userLinkEl) {
        const match = userLinkEl.getAttribute("href").match(/\/manage\/relationships\/(\d+)/);
        if (match) userId = match[1];
      }

      // ユーザー名
      let userName = "";
      const userNameEl = row.querySelector('div[class*="SupportTransaction__UserName"] a') ||
                         row.querySelector('div[class*="SupportTransaction__UserName"]');
      if (userNameEl) {
        userName = userNameEl.textContent.trim();
      }

      // 日付
      let dateStr = "";
      const dateEl = row.querySelector('div[class*="SupportTransaction__Date"]');
      if (dateEl) {
        dateStr = dateEl.textContent.trim();
      }

      // 金額
      let amountStr = "";
      const amountEl = row.querySelector('div[class*="SupportTransaction__PaidAmount"]');
      if (amountEl) {
        // すでに保存済みの正規金額があればそれを使用
        if (row.dataset.vrctOriginalAmount) {
          amountStr = row.dataset.vrctOriginalAmount;
        } else {
          // 子ノードのうちテキストノード（バッジ等の追加要素を除外）のみを抽出
          const textNodes = Array.from(amountEl.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent)
            .join("");
          amountStr = textNodes.trim() || amountEl.textContent.replace(/Mogu.*|Mochi.*|Fuwa.*|Basic.*|Other.*/i, "").trim();

          const parsed = parseAmount(amountStr);
          if (parsed > 0) {
            row.dataset.vrctOriginalAmount = String(parsed);
          }
        }
      }
      const amount = parseAmount(amountStr);
      const plan = getPlanInfo(amount);

      supporters.push({
        rowElement: row,
        userId,
        name: userName,
        date: dateStr,
        chargeDate: formatDate(dateStr),
        amount,
        amountFormatted: `${amount.toFixed(2)}`,
        plan,
      });
    });

    return supporters;
  }

  function applyHighlights(supporters) {
    supporters.forEach(({ rowElement, plan, amount }) => {
      // ハイライトクラスの更新（不要なクラス書き換えを避ける）
      if (!rowElement.classList.contains(plan.className)) {
        PLAN_DEFINITIONS.forEach((p) => {
          rowElement.classList.remove(p.className);
        });
        rowElement.classList.remove("vrct-highlighted");
        rowElement.classList.add("vrct-highlighted", plan.className);
      }

      // バッジの配置（amountEl の「中」ではなく「直後（兄弟）」に配置してテキスト混入を防止）
      let badge = rowElement.querySelector(".vrct-plan-badge");
      const expectedText = `${plan.shortLabel} (¥${amount.toLocaleString()})`;
      const expectedClass = `vrct-plan-badge ${plan.badgeClass}`;

      if (!badge) {
        badge = document.createElement("span");
        badge.className = expectedClass;
        badge.textContent = expectedText;

        const amountEl = rowElement.querySelector('div[class*="SupportTransaction__PaidAmount"]');
        if (amountEl) {
          amountEl.insertAdjacentElement("afterend", badge);
        } else {
          rowElement.appendChild(badge);
        }
      } else {
        // もし以前のバージョン等で amountEl 内に入っていたら外に出す
        const amountEl = rowElement.querySelector('div[class*="SupportTransaction__PaidAmount"]');
        if (amountEl && amountEl.contains(badge)) {
          amountEl.insertAdjacentElement("afterend", badge);
        }
        // テキストまたはクラスが変わっている場合のみDOM更新
        if (badge.textContent !== expectedText) {
          badge.textContent = expectedText;
        }
        if (badge.className !== expectedClass) {
          badge.className = expectedClass;
        }
      }
    });
  }

  function createOrUpdateToolbar(supporters) {
    let toolbar = document.querySelector(".vrct-fanbox-toolbar");
    const container =
      document.querySelector('div[class*="SupportTransactionSection__Wrapper"]') ||
      document.querySelector('div[class*="ResponsiveWrapper__Inner"]');

    if (!container) return;

    const counts = { mogu_2000: 0, mochi_1000: 0, fuwa_500: 0, basic_300: 0 };
    let totalAmount = 0;

    supporters.forEach((s) => {
      if (counts[s.plan.id] !== undefined) {
        counts[s.plan.id]++;
      }
      totalAmount += s.amount;
    });

    const totalCount = supporters.length;
    const yearMonth = getTargetYearMonth();

    // 以前の集計結果と比較し、同じならDOM更新をスキップ（Observerの再帰発火防止）
    const stateKey = `${yearMonth}-${totalCount}-${totalAmount}-${counts.mogu_2000}-${counts.mochi_1000}-${counts.fuwa_500}-${counts.basic_300}`;
    if (toolbar && toolbar.dataset.stateKey === stateKey) {
      return;
    }

    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "vrct-fanbox-toolbar";
      container.parentNode.insertBefore(toolbar, container);
    }
    toolbar.dataset.stateKey = stateKey;

    toolbar.innerHTML = `
      <div class="vrct-toolbar-left">
        <div class="vrct-toolbar-title">
          <span class="vrct-toolbar-title-logo">V</span>
          <span>VRCT支援者 (${yearMonth})</span>
        </div>
        <div class="vrct-stat-chip chip-mogu"><strong>Mogu:</strong> ${counts.mogu_2000}人</div>
        <div class="vrct-stat-chip chip-mochi"><strong>Mochi:</strong> ${counts.mochi_1000}人</div>
        <div class="vrct-stat-chip chip-fuwa"><strong>Fuwa:</strong> ${counts.fuwa_500}人</div>
        <div class="vrct-stat-chip chip-basic"><strong>Basic:</strong> ${counts.basic_300}人</div>
        <div class="vrct-stat-chip"><strong>計:</strong> ${totalCount}人 (¥${totalAmount.toLocaleString()})</div>
      </div>
      <div class="vrct-toolbar-right">
        <button id="vrct-export-csv-btn" class="vrct-export-btn" title="Patreon互換のCSVファイルをダウンロード">
          <svg viewBox="0 0 20 20">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
          </svg>
          CSVエクスポート (${totalCount}件)
        </button>
      </div>
    `;

    const exportBtn = toolbar.querySelector("#vrct-export-csv-btn");
    if (exportBtn) {
      exportBtn.onclick = () => exportCsv(supporters, yearMonth);
    }
  }

  function exportCsv(supporters, yearMonth) {
    const headers = [
      "Name",
      "Email",
      "Discord",
      "Patron Status",
      "Follows You",
      "Free Member",
      "Free Trial",
      "Lifetime Amount",
      "Pledge Amount",
      "Charge Frequency",
      "Tier",
      "Addressee",
      "Street",
      "City",
      "State",
      "Zip",
      "Country",
      "Phone",
      "Patronage Since Date",
      "Last Charge Date",
      "Last Charge Status",
      "Additional Details",
      "User ID",
      "Last Updated",
      "Currency",
      "Max Posts",
      "Access Expiration",
      "Next Charge Date",
      "Full country name",
      "Subscription Source",
    ];

    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const rows = supporters.map((s) => {
      return [
        escapeCsvCell(s.name),
        "", // Email
        "", // Discord
        "Active patron", // Patron Status
        "No", // Follows You
        "No", // Free Member
        "No", // Free Trial
        s.amountFormatted, // Lifetime Amount (FANBOX月別一覧での判明値)
        s.amountFormatted, // Pledge Amount
        "monthly", // Charge Frequency
        escapeCsvCell(s.plan.tierName), // Tier
        "", // Addressee
        "", // Street
        "", // City
        "", // State
        "", // Zip
        "", // Country
        "", // Phone
        "", // Patronage Since Date
        escapeCsvCell(s.chargeDate), // Last Charge Date
        "Paid", // Last Charge Status
        "", // Additional Details
        escapeCsvCell(s.userId), // User ID
        nowStr, // Last Updated
        "JPY", // Currency
        "", // Max Posts
        "", // Access Expiration
        "", // Next Charge Date
        "", // Full country name
        "FANBOX", // Subscription Source
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const filename = `${datePrefix}-members-fanbox-${yearMonth}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  let debounceTimer = null;
  function run() {
    const supporters = extractSupporters();
    if (supporters.length > 0) {
      applyHighlights(supporters);
      createOrUpdateToolbar(supporters);
    }
  }

  function scheduleRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 250);
  }

  // 初期実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRun);
  } else {
    scheduleRun();
  }

  // SPAのDOM変更監視
  const observer = new MutationObserver((mutations) => {
    // 拡張機能自身の変更（vrct-* 関連の変更）による再帰呼び出しを防止
    const isOnlySelfMutation = mutations.every((m) => {
      const target = m.target;
      if (target && target.nodeType === Node.ELEMENT_NODE) {
        if (target.classList && Array.from(target.classList).some((c) => c.startsWith("vrct-"))) {
          return true;
        }
        if (target.closest && target.closest(".vrct-fanbox-toolbar, .vrct-plan-badge")) {
          return true;
        }
      }
      return false;
    });

    if (isOnlySelfMutation) return;
    scheduleRun();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // URL変更検知
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      scheduleRun();
    }
  }, 1000);
})();
