  (async () => {
    "use strict";

    const CONFIG = {
      endpoint: "https://fasih-sm.bps.go.id/app/api/analytic/api/v2/assignment/report-progress-by-responsibility",
      surveyPeriodId: "fd68e454-ba45-4b85-8205-f3bf777ded24",
      surveyRoleId: "6d7d919a-45e5-4779-bb87-2905b49fd31a",
      target: "TARGET_ONLY",
      search: "",
      regionSummaryLevel: 6,

      // API FASIH saat ini hanya stabil menerima size 10.
      pageSize: 10,
      pageSizeFallbacks: [10],

      // Jangan terlalu agresif supaya session FASIH tetap aman.
      concurrency: 3,
      delayMs: 150,
      retryCount: 3,
      retryBaseDelayMs: 800,

      filePrefix: "fasih_progress",
      downloadJsonBackup: false
    };

    const BASE_REGION = {
      region1Id: null,
      region2Id: null,
      region3Id: null,
      region4Id: null,
      region5Id: null,
      region6Id: null,
      region7Id: null,
      region8Id: null,
      region9Id: null,
      region10Id: null
    };

    const CSV_HEADERS = [
      "Scraped_At",
      "Email",
      "Username",
      "Fullname",
      "SLS_Code",
      "SLS_Name",
      "Open",
      "Draft",
      "Submitted_By_Pencacah",
      "Submitted_Respondent",
      "Rejected",
      "Approved",
      "Revoked_By_Pengawas",
      "Edited_By_Pengawas",
      "Edited_By_Admin_Kabupaten",
      "Total_Status",
      "Dominant_Status",
      "All_Statuses",
      "Other_Statuses"
    ];

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function nowIsoLocal() {
      const date = new Date();
      const offsetMs = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
    }

    function timestampForFile() {
      return nowIsoLocal().replace(/[-:T]/g, "").slice(0, 14);
    }

    function getXsrfToken() {
      const cookie = document.cookie
        .split("; ")
        .find(item => item.startsWith("XSRF-TOKEN="));

      if (!cookie) {
        throw new Error("Cookie XSRF-TOKEN tidak ditemukan. Pastikan sudah login FASIH dan halaman berasal dari fasih-sm.bps.go.id.");
      }

      return decodeURIComponent(cookie.split("=").slice(1).join("="));
    }

    function createPayload(page, size) {
      return {
        surveyPeriodId: CONFIG.surveyPeriodId,
        surveyRoleId: CONFIG.surveyRoleId,
        size,
        page,
        search: CONFIG.search,
        target: CONFIG.target,
        region: { ...BASE_REGION },
        regionSummaryLevel: CONFIG.regionSummaryLevel
      };
    }

    async function requestPage(page, size, token) {
      const payload = createPayload(page, size);

      for (let attempt = 1; attempt <= CONFIG.retryCount; attempt++) {
        try {
          const response = await fetch(CONFIG.endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": token
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`HTTP ${response.status} ${response.statusText} ${text.slice(0, 200)}`);
          }

          const json = await response.json();
          if (!json || !json.data) {
            throw new Error("Response tidak punya field data.");
          }

          return json;
        } catch (error) {
          if (attempt >= CONFIG.retryCount) {
            throw error;
          }

          const delay = CONFIG.retryBaseDelayMs * attempt;
          console.warn(`[retry] Page ${page + 1}, attempt ${attempt}/${CONFIG.retryCount} gagal: ${error.message}. Coba lagi ${delay} ms...`);
          await sleep(delay);
        }
      }

      throw new Error(`Page ${page + 1} gagal tanpa detail error.`);
    }

    async function requestFirstPage(token) {
      const candidates = [
        CONFIG.pageSize,
        ...CONFIG.pageSizeFallbacks.filter(size => size !== CONFIG.pageSize)
      ];

      let lastError = null;
      for (const size of candidates) {
        try {
          console.log(`[init] Coba page size ${size}...`);
          const json = await requestPage(0, size, token);
          return { json, size };
        } catch (error) {
          lastError = error;
          console.warn(`[init] Page size ${size} gagal: ${error.message}`);
        }
      }

      throw lastError || new Error("Tidak ada page size yang berhasil.");
    }

    function readTotalElements(data) {
      const total = Number(data.totalElements ?? data.totalElement ?? data.total ?? data.count);
      if (Number.isFinite(total)) {
        return total;
      }

      return Array.isArray(data.content) ? data.content.length : 0;
    }

    function readContent(data) {
      return Array.isArray(data.content) ? data.content : [];
    }

    function normalizeStatusName(status) {
      return String(status || "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
    }

    function emptyRow(scrapedAt, user, region) {
      return {
        Scraped_At: scrapedAt,
        Email: user.email || "",
        Username: user.username || user.userName || user.account || "",
        Fullname: user.fullname || user.fullName || user.name || "",
        SLS_Code: region.regionCode || region.fullCode || region.code || "",
        SLS_Name: region.regionName || region.name || "",
        Open: 0,
        Draft: 0,
        Submitted_By_Pencacah: 0,
        Submitted_Respondent: 0,
        Rejected: 0,
        Approved: 0,
        Revoked_By_Pengawas: 0,
        Edited_By_Pengawas: 0,
        Edited_By_Admin_Kabupaten: 0,
        Total_Status: 0,
        Dominant_Status: "",
        All_Statuses: "",
        Other_Statuses: ""
      };
    }

    function applyStatus(row, status, otherStatuses) {
      const name = normalizeStatusName(status.status || status.name || status.label);
      const count = Number(status.count ?? status.docCount ?? status.total ?? 0) || 0;

      row.Total_Status += count;

      if (name === "OPEN") {
        row.Open += count;
      } else if (name === "DRAFT") {
        row.Draft += count;
      } else if (name.includes("SUBMITTED BY PENCACAH")) {
        row.Submitted_By_Pencacah += count;
      } else if (name.includes("SUBMITTED RESPONDENT") || name.includes("SUBMITTED BY RESPONDENT")) {
        row.Submitted_Respondent += count;
      } else if (name.includes("REJECT")) {
        row.Rejected += count;
      } else if (name.includes("APPROVED")) {
        row.Approved += count;
      } else if (name.includes("REVOKED BY PENGAWAS")) {
        row.Revoked_By_Pengawas += count;
      } else if (name.includes("EDITED BY PENGAWAS")) {
        row.Edited_By_Pengawas += count;
      } else if (name.includes("EDITED BY ADMIN")) {
        row.Edited_By_Admin_Kabupaten += count;
      } else if (name) {
        otherStatuses.push(`${name}:${count}`);
      }
    }

    function finalizeRow(row, breakdown, otherStatuses) {
      row.All_Statuses = breakdown
        .map(status => {
          const name = normalizeStatusName(status.status || status.name || status.label);
          const count = Number(status.count ?? status.docCount ?? status.total ?? 0) || 0;
          return name ? `${name}:${count}` : "";
        })
        .filter(Boolean)
        .join("; ");

      row.Other_Statuses = otherStatuses.join("; ");

      const mappedStatuses = [
        ["Open", row.Open],
        ["Draft", row.Draft],
        ["Submitted_By_Pencacah", row.Submitted_By_Pencacah],
        ["Submitted_Respondent", row.Submitted_Respondent],
        ["Rejected", row.Rejected],
        ["Approved", row.Approved],
        ["Revoked_By_Pengawas", row.Revoked_By_Pengawas],
        ["Edited_By_Pengawas", row.Edited_By_Pengawas],
        ["Edited_By_Admin_Kabupaten", row.Edited_By_Admin_Kabupaten]
      ];

      const dominant = mappedStatuses
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])[0];

      row.Dominant_Status = dominant ? dominant[0] : "";
    }

    function rowsFromPage(json, scrapedAt) {
      const users = readContent(json.data);
      const rows = [];

      for (const user of users) {
        const summaries = Array.isArray(user.regionSummary) ? user.regionSummary : [];

        for (const region of summaries) {
          const row = emptyRow(scrapedAt, user, region);
          const breakdown = Array.isArray(region.statusBreakdown) ? region.statusBreakdown : [];
          const otherStatuses = [];

          for (const status of breakdown) {
            applyStatus(row, status, otherStatuses);
          }

          finalizeRow(row, breakdown, otherStatuses);
          rows.push(row);
        }
      }

      return rows;
    }

    async function fetchRemainingPages(totalPages, size, token, scrapedAt) {
      const rows = [];
      const failedPages = [];
      let nextPage = 1;
      let finishedPages = 1;

      async function worker(workerId) {
        while (nextPage < totalPages) {
          const page = nextPage++;

          try {
            if (CONFIG.delayMs > 0) {
              await sleep(CONFIG.delayMs * workerId);
            }

            const json = await requestPage(page, size, token);
            rows.push(...rowsFromPage(json, scrapedAt));
            finishedPages++;
            console.log(`[page] ${finishedPages}/${totalPages} selesai. Page ${page + 1}, rows sementara: ${rows.length}`);
          } catch (error) {
            finishedPages++;
            failedPages.push({ page: page + 1, error: error.message });
            console.error(`[page] Page ${page + 1} gagal final:`, error);
          }
        }
      }

      const workerCount = Math.max(1, Math.min(CONFIG.concurrency, totalPages - 1));
      await Promise.all(Array.from({ length: workerCount }, (_, index) => worker(index + 1)));

      return { rows, failedPages };
    }

    function cleanCsvCell(value) {
      return String(value ?? "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function csvEscape(value) {
      const text = cleanCsvCell(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }

    function buildCsv(rows) {
      const lines = [
        CSV_HEADERS.join(","),
        ...rows.map(row => CSV_HEADERS.map(header => csvEscape(row[header])).join(","))
      ];

      // BOM supaya Excel/Google Sheet lebih ramah baca encoding.
      return `\ufeff${lines.join("\r\n")}`;
    }

    function validateExportRows(rows) {
      const uniqueSls = new Set();
      const duplicateSls = new Set();
      const missingSls = [];

      rows.forEach((row, index) => {
        const slsCode = String(row.SLS_Code || "").trim();
        if (!slsCode) {
          missingSls.push(index + 1);
          return;
        }

        if (uniqueSls.has(slsCode)) {
          duplicateSls.add(slsCode);
        }
        uniqueSls.add(slsCode);
      });

      return {
        rows: rows.length,
        uniqueSls: uniqueSls.size,
        duplicateSls: duplicateSls.size,
        missingSls: missingSls.length
      };
    }

    function downloadText(filename, text, mimeType) {
      const blob = new Blob([text], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }

    function summarizeRows(rows) {
      return rows.reduce((summary, row) => {
        summary.Open += row.Open;
        summary.Draft += row.Draft;
        summary.Submitted_By_Pencacah += row.Submitted_By_Pencacah;
        summary.Submitted_Respondent += row.Submitted_Respondent;
        summary.Rejected += row.Rejected;
        summary.Approved += row.Approved;
        summary.Revoked_By_Pengawas += row.Revoked_By_Pengawas;
        summary.Edited_By_Pengawas += row.Edited_By_Pengawas;
        summary.Edited_By_Admin_Kabupaten += row.Edited_By_Admin_Kabupaten;
        summary.Total_Status += row.Total_Status;
        return summary;
      }, {
        Open: 0,
        Draft: 0,
        Submitted_By_Pencacah: 0,
        Submitted_Respondent: 0,
        Rejected: 0,
        Approved: 0,
        Revoked_By_Pengawas: 0,
        Edited_By_Pengawas: 0,
        Edited_By_Admin_Kabupaten: 0,
        Total_Status: 0
      });
    }

    const startedAt = performance.now();
    const scrapedAt = nowIsoLocal();
    const token = getXsrfToken();

    console.log("[start] Scraping progress FASIH dimulai...");
    console.log(`[start] Waktu scrape: ${scrapedAt}`);

    const first = await requestFirstPage(token);
    const size = first.size;
    const firstData = first.json.data;
    const totalElements = readTotalElements(firstData);
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    const rows = rowsFromPage(first.json, scrapedAt);

    console.log(`[init] Page size aktif: ${size}`);
    console.log(`[init] Total user/responsibility: ${totalElements}`);
    console.log(`[init] Total pages: ${totalPages}`);
    console.log(`[page] 1/${totalPages} selesai. Rows sementara: ${rows.length}`);

    const remaining = await fetchRemainingPages(totalPages, size, token, scrapedAt);
    rows.push(...remaining.rows);

    const exportRows = rows.filter(row => Boolean(String(row.SLS_Code || "").trim()));
    const skippedRows = rows.length - exportRows.length;

    exportRows.sort((a, b) => {
      const emailCompare = String(a.Email).localeCompare(String(b.Email));
      if (emailCompare !== 0) return emailCompare;
      return String(a.SLS_Code).localeCompare(String(b.SLS_Code));
    });

    window.__FASIH_PROGRESS_ROWS = exportRows;
    window.__FASIH_PROGRESS_FAILED_PAGES = remaining.failedPages;

    const stamp = timestampForFile();
    const csvFilename = `${CONFIG.filePrefix}_${stamp}.csv`;
    const csv = buildCsv(exportRows);
    downloadText(csvFilename, csv, "text/csv;charset=utf-8;");

    if (CONFIG.downloadJsonBackup) {
      downloadText(
        `${CONFIG.filePrefix}_${stamp}.json`,
        JSON.stringify({ scrapedAt, rows: exportRows, failedPages: remaining.failedPages }, null, 2),
        "application/json;charset=utf-8;"
      );
    }

    const summary = summarizeRows(exportRows);
    const validation = validateExportRows(exportRows);
    const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(1);

    console.log("[done] Download selesai:", csvFilename);
    console.table(summary);
    console.table(validation);
    console.log(`[done] Rows mentah: ${rows.length}`);
    console.log(`[done] Rows export: ${exportRows.length}`);
    console.log(`[done] Rows dilewati: ${skippedRows}`);
    console.log(`[done] Failed pages: ${remaining.failedPages.length}`);
    console.log(`[done] Durasi: ${elapsedSeconds} detik`);

    if (remaining.failedPages.length) {
      console.warn("[warning] Ada page gagal. Detail tersimpan di window.__FASIH_PROGRESS_FAILED_PAGES");
      console.table(remaining.failedPages);
    }
  })();
