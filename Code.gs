const SHEET_HEADERS = {
  users: [
    "user_id",
    "nama",
    "username",
    "password_hash",
    "role",
    "pml_id",
    "active",
    "created_at",
    "updated_at"
  ],
  pml: [
    "pml_id",
    "nama_pml",
    "telepon",
    "active",
    "created_at",
    "updated_at"
  ],
  petugas: [
    "petugas_id",
    "nama_petugas",
    "pml_id",
    "telepon",
    "email_petugas",
    "active",
    "created_at",
    "updated_at"
  ],
  assign_tasks: [
    "task_id",
    "idsubsls",
    "kecamatan",
    "desa",
    "sls",
    "petugas_id",
    "pml_id",
    "pic",
    "korwil",
    "mulai",
    "selesai",
    "keluarga",
    "usaha",
    "utp",
    "muatan_total",
    "target",
    "completed",
    "active",
    "created_at",
    "updated_at"
  ],
  prelist_sls: [
    "idsubsls",
    "kecamatan",
    "desa",
    "nama_sls",
    "dominan",
    "keluarga_awal",
    "usaha_awal",
    "keluarga_prelist",
    "umkm_keluarga",
    "st2023",
    "umk",
    "um",
    "usaha_lain",
    "umk_um",
    "usaha_final",
    "total_usaha_final",
    "level_geografis",
    "is_prioritas"
  ],
  daily_reports: [
    "report_id",
    "task_id",
    "tanggal",
    "keluarga_harian",
    "usaha_non_pertanian_harian",
    "usaha_pertanian_harian",
    "muatan_harian",
    "catatan",
    "created_by",
    "active",
    "created_at",
    "updated_at"
  ],
  fasih_progress: [
    "imported_at",
    "scraped_at",
    "email",
    "username",
    "fullname",
    "sls_code",
    "sls_name",
    "open",
    "draft",
    "submitted_by_pencacah",
    "submitted_respondent",
    "rejected",
    "approved",
    "revoked_by_pengawas",
    "edited_by_pengawas",
    "edited_by_admin_kabupaten",
    "total_status",
    "dominant_status",
    "all_statuses",
    "other_statuses"
  ],
  fasih_contract: [
    "imported_at",
    "ppl",
    "email_ppl",
    "total_prelist",
    "persen_sudah_submit",
    "jumlah_submit",
    "minimal_submit_termin_1",
    "kekurangan_termin_1",
    "status_termin_1",
    "open",
    "draft",
    "submit_by_pencacah",
    "submit_responden",
    "approve_by_pengawas",
    "reject_by_pengawas",
    "revoked_by_pengawas",
    "edited_by_pengawas",
    "edited_by_admin"
  ],
  audit_logs: [
    "log_id",
    "user_id",
    "action",
    "entity",
    "entity_id",
    "details",
    "created_at"
  ],
  rekap_anomali: [
    "anomali_id",
    "imported_at",
    "dashboard_updated_at",
    "source_type",
    "nama_objek",
    "idsls",
    "kode_prov",
    "nama_provinsi",
    "kode_kab",
    "nama_kab",
    "kode_kec",
    "nama_kecamatan",
    "kode_desa",
    "nama_desa",
    "kode_sls",
    "sub_sls",
    "assignment_id",
    "anomali_no",
    "anomali_title",
    "tindak_lanjut",
    "pjtindaklanjut",
    "id_petugas",
    "email_petugas",
    "status",
    "link_fasih",
    "link_edit_fasih",
    "is_resolved"
  ]
};

// Segera ubah password admin dari menu `Akun`.

const CACHE_TTL_SECONDS = 21600;
const SESSION_TTL_SECONDS = 86400;
const SESSION_TTL_MILLISECONDS = SESSION_TTL_SECONDS * 1000;
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin2026";
const AUDIT_LOGIN_EVENTS = false;
const ALLOCATION_SHEET_NAME = "alokasi_petugas";
const WEEKLY_PROVINCE_SHEET_NAME = "rekap_mingguan_provinsi";
const WEEKLY_PROVINCE_SHEET_ID_PROPERTY = "WEEKLY_PROVINCE_SHEET_ID";
const WEEKLY_PROVINCE_EXPORT_SHEET_PREFIX = "Rekap_Provinsi_Kumulatif";
const FASIH_PROGRESS_SHEET_NAME = "fasih_progress";
const FASIH_CONTRACT_SHEET_NAME = "fasih_contract";
const ANOMALI_SHEET_NAME = "rekap_anomali";
const FASIH_IMPORT_MAX_ROWS = 10000;
const FASIH_CONTRACT_IMPORT_MAX_ROWS = 1000;
const ANOMALI_IMPORT_MAX_ROWS = 30000;
const ORGANIC_PML_ID = "pml_organik";
const ORGANIC_PETUGAS_ID = "ppl_organik";
const ORGANIC_TASK_SUFFIX = "-ORGANIK";
const WEEKLY_RECAP_START_DATE = "2026-06-15";
const PERF_LOG_ENABLED = true;
let spreadsheetCache_ = null;
const WEEKLY_RECAP_PERIODS = [
  { key: "C1", label: "15-19 Jun", exportLabel: "15-19 JUNI", start: "2026-06-15", end: "2026-06-19" },
  { key: "C2", label: "15-26 Jun", exportLabel: "15-26 JUNI", start: "2026-06-20", end: "2026-06-26" },
  { key: "C3", label: "15-30 Jun", exportLabel: "15-30 JUNI", start: "2026-06-27", end: "2026-06-30" },
  { key: "C4", label: "15-03 Jul", exportLabel: "15-03 JULI", start: "2026-07-01", end: "2026-07-03" },
  { key: "C5", label: "15-10 Jul", exportLabel: "15-10 JULI", start: "2026-07-04", end: "2026-07-10" },
  { key: "C6", label: "15-17 Jul", exportLabel: "15-17 JULI", start: "2026-07-11", end: "2026-07-17" },
  { key: "C7", label: "15-24 Jul", exportLabel: "15-24 JULI", start: "2026-07-18", end: "2026-07-24" },
  { key: "C8", label: "15-31 Jul", exportLabel: "15-31 JULI", start: "2026-07-25", end: "2026-07-31" },
  { key: "C9", label: "15-07 Ags", exportLabel: "15-07 AGS", start: "2026-08-01", end: "2026-08-07" },
  { key: "C10", label: "15-14 Ags", exportLabel: "15-14 AGS", start: "2026-08-08", end: "2026-08-14" },
  { key: "C11", label: "15-21 Ags", exportLabel: "15-21 AGS", start: "2026-08-15", end: "2026-08-21" },
  { key: "C12", label: "15-28 Ags", exportLabel: "15-28 AGS", start: "2026-08-22", end: "2026-08-28" },
  { key: "C13", label: "15-31 Ags", exportLabel: "15-31 AGS", start: "2026-08-29", end: "2026-08-31" }
];
const DESA_CLASSIFICATION_BY_CODE = {
  "010-004": "2",
  "010-005": "1",
  "010-006": "2",
  "010-009": "2",
  "010-011": "1",
  "010-012": "2",
  "011-001": "2",
  "011-002": "2",
  "011-003": "2",
  "020-001": "2",
  "020-002": "2",
  "020-003": "2",
  "020-004": "2",
  "030-001": "2",
  "030-002": "2",
  "030-003": "2",
  "030-004": "2",
  "030-005": "2",
  "030-006": "2",
  "030-007": "2",
  "040-003": "1",
  "040-004": "1",
  "040-005": "1",
  "040-006": "2",
  "040-007": "1",
  "040-008": "2",
  "040-009": "2",
  "050-001": "2",
  "050-002": "2",
  "050-003": "2",
  "050-004": "2",
  "050-005": "2",
  "050-006": "2",
  "060-001": "2",
  "060-002": "2",
  "060-003": "2",
  "060-004": "2",
  "060-005": "2",
  "060-006": "2",
  "070-002": "2",
  "070-003": "2",
  "070-008": "2",
  "070-010": "2",
  "070-011": "2",
  "070-012": "2",
  "070-014": "2",
  "071-001": "2",
  "071-002": "2",
  "071-003": "2",
  "072-001": "1",
  "072-002": "2",
  "072-003": "2",
  "072-004": "1",
  "072-005": "1"
};

function doGet() {
  return HtmlService
    .createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Monitoring Petugas SE2026 KKA")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function setupApp() {
  return withLock_(function () {
    const spreadsheet = getSpreadsheet_();

    Object.keys(SHEET_HEADERS).forEach(function (sheetName) {
      ensureSheet_(spreadsheet, sheetName, SHEET_HEADERS[sheetName]);
    });

    const createdAdmin = ensureDefaultAdmin_();

    return ok_({
      createdAdmin: createdAdmin,
      defaultLogin: createdAdmin
        ? {
            username: DEFAULT_ADMIN_USERNAME,
            password: DEFAULT_ADMIN_PASSWORD
          }
        : null,
      spreadsheetUrl: spreadsheet.getUrl()
    });
  });
}

function setSpreadsheetId(spreadsheetId) {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID wajib diisi.");
  }

  PropertiesService
    .getScriptProperties()
    .setProperty("SPREADSHEET_ID", String(spreadsheetId).trim());

  return setupApp();
}

function syncAllocationFromSheet() {
  return withLock_(function () {
    ensureInitialized_();

    const spreadsheet = getSpreadsheet_();
    const allocationSheet = spreadsheet.getSheetByName(ALLOCATION_SHEET_NAME);

    if (!allocationSheet) {
      throw new Error("Sheet " + ALLOCATION_SHEET_NAME + " belum ada. Import file alokasi ke sheet itu dulu.");
    }

    const allocationRows = readAllocationRows_(allocationSheet);

    if (!allocationRows.length) {
      throw new Error("Tidak ada baris SLS valid di sheet " + ALLOCATION_SHEET_NAME + ".");
    }

    validateAllocationEntityIds_(allocationRows);
    const taskResult = syncAllocationTasks_(allocationRows);
    const summary = {
      sumber: ALLOCATION_SHEET_NAME,
      baris_sls: allocationRows.length,
      pml_baru: 0,
      petugas_baru: 0,
      wilayah_baru: taskResult.created,
      wilayah_diperbarui: taskResult.updated,
      organik_baru: taskResult.organicCreated,
      organik_diperbarui: taskResult.organicUpdated,
      organik_dinonaktifkan: taskResult.organicDeactivated
    };

    logAudit_("system", "sync_allocation", "assign_tasks", "", JSON.stringify(summary));

    return ok_(summary);
  });
}

function repairAllocationPetugasIds() {
  return withLock_(function () {
    ensureInitialized_();

    const petugasSheet = getSheet_("petugas");
    const taskSheet = getSheet_("assign_tasks");
    const petugasHeaders = getHeaders_(petugasSheet);
    const taskHeaders = getHeaders_(taskSheet);
    const petugasRows = readRows_("petugas");
    const taskRows = readRows_("assign_tasks");
    const activeByKey = {};
    const idMap = {};
    let petugasUpdated = 0;
    let taskUpdated = 0;

    petugasRows.forEach(function (row) {
      if (!isActive_(row.active)) {
        return;
      }

      const key = allocationPetugasKey_(row.nama_petugas, row.pml_id);

      if (key && shouldUseAllocationEntity_(activeByKey[key], row, "PCL-")) {
        activeByKey[key] = row;
      }
    });

    petugasRows.forEach(function (row) {
      const oldId = cleanText_(row.petugas_id);

      if (oldId.indexOf("PCL-") !== 0) {
        return;
      }

      const replacement = activeByKey[allocationPetugasKey_(row.nama_petugas, row.pml_id)];

      if (replacement && cleanText_(replacement.petugas_id) !== oldId) {
        idMap[oldId] = replacement.petugas_id;

        if (isActive_(row.active)) {
          row.active = "FALSE";
          row.updated_at = now_();
          petugasUpdated++;
        }

        return;
      }

      if (isActive_(row.active)) {
        const newId = Utilities.getUuid();

        idMap[oldId] = newId;
        row.petugas_id = newId;
        row.updated_at = now_();
        activeByKey[allocationPetugasKey_(row.nama_petugas, row.pml_id)] = row;
        petugasUpdated++;
      }
    });

    if (!Object.keys(idMap).length) {
      return ok_({
        petugas_diperbaiki: 0,
        wilayah_diperbaiki: 0
      });
    }

    taskRows.forEach(function (row) {
      const newId = idMap[cleanText_(row.petugas_id)];

      if (!newId) {
        return;
      }

      row.petugas_id = newId;
      row.updated_at = now_();
      taskUpdated++;
    });

    writeRows_(petugasSheet, petugasHeaders, petugasRows);
    writeRows_(taskSheet, taskHeaders, taskRows);

    logAudit_("system", "repair_petugas_ids", "petugas", "", JSON.stringify({
      petugas_diperbaiki: petugasUpdated,
      wilayah_diperbaiki: taskUpdated
    }));

    return ok_({
      petugas_diperbaiki: petugasUpdated,
      wilayah_diperbaiki: taskUpdated
    });
  });
}

function login(credentials) {
  const perf = startPerf_("login");
  const username = normalizeUsername_(credentials && credentials.username);
  const password = String((credentials && credentials.password) || "");

  if (!username || !password) {
    throw new Error("Username dan password wajib diisi.");
  }

  perfMark_(perf, "parse credentials");
  const user = readRows_("users").find(function (row) {
    return normalizeUsername_(row.username) === username && isActive_(row.active);
  });
  perfMark_(perf, "read users");

  if (!user || user.password_hash !== hashPassword_(username, password)) {
    throw new Error("Username atau password salah.");
  }

  const token = Utilities.getUuid();
  const publicUser = publicUser_(user);

  CacheService
    .getScriptCache()
    .put(sessionKey_(token), JSON.stringify(publicUser), CACHE_TTL_SECONDS);

  PropertiesService
    .getScriptProperties()
    .setProperty(sessionKey_(token), JSON.stringify({
      user: publicUser,
      expires: Date.now() + SESSION_TTL_MILLISECONDS
    }));
  perfMark_(perf, "write session");

  if (AUDIT_LOGIN_EVENTS) {
    logAudit_(publicUser.user_id, "login", "users", publicUser.user_id, "");
    perfMark_(perf, "audit login");
  }

  const data = buildDataForUser_(publicUser, { perf: perf });
  finishPerf_(perf, "ok");

  return ok_({
    token: token,
    user: publicUser,
    ttl: SESSION_TTL_SECONDS,
    data: data
  });
}

function logout(token) {
  if (token) {
    CacheService.getScriptCache().remove(sessionKey_(token));
    PropertiesService.getScriptProperties().deleteProperty(sessionKey_(token));
  }

  return ok_();
}

function getBootstrapData(token) {
  const perf = startPerf_("getBootstrapData");
  const user = requireUser_(token);
  perfMark_(perf, "require user");
  const data = buildDataForUser_(user, { perf: perf });
  finishPerf_(perf, "ok");

  return ok_({
    user: user,
    data: data
  });
}

function prepareWeeklyProvinceExport(token) {
  const user = requireRole_(requireUser_(token), ["admin", "viewer"]);

  return withLock_(function () {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureWeeklyProvinceSheet_(spreadsheet);
    const checkpointDate = dateStamp_();
    const exportSheetName = buildWeeklyProvinceExportSheetName_(checkpointDate);
    const headers = getWeeklyProvinceHeaders_();
    const rows = buildWeeklyProvinceRows_(checkpointDate);
    const values = [headers].concat(rows);

    setSheetNameSafely_(spreadsheet, sheet, exportSheetName);
    sheet.clear();
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);
    formatWeeklyProvinceSheet_(sheet, values.length, headers.length);

    logAudit_(user.user_id, "prepare_export", sheet.getName(), "", rows.length + " baris");

    return ok_({
      sheetName: sheet.getName(),
      rows: rows.length,
      exportUrl: buildSpreadsheetExportUrl_(spreadsheet, sheet),
      sheetUrl: spreadsheet.getUrl() + "#gid=" + sheet.getSheetId()
    });
  });
}

function importFasihProgress(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const inputRows = Array.isArray(payload && payload.rows) ? payload.rows : [];

  if (!inputRows.length) {
    throw new Error("CSV FASIH tidak punya baris data.");
  }

  if (inputRows.length > FASIH_IMPORT_MAX_ROWS) {
    throw new Error("Baris CSV terlalu banyak. Maksimal " + FASIH_IMPORT_MAX_ROWS + " baris.");
  }

  const importedAt = now_();
  const rows = inputRows.map(function (row, index) {
    return normalizeFasihProgressRow_(row, importedAt, index + 1);
  });
  assertUniqueFasihSlsRows_(rows);
  const summary = summarizeFasihRows_(rows);

  return withLock_(function () {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, FASIH_PROGRESS_SHEET_NAME, SHEET_HEADERS.fasih_progress);
    const headers = getHeaders_(sheet);

    writeRows_(sheet, headers, rows);
    logAudit_(user.user_id, "import", FASIH_PROGRESS_SHEET_NAME, "", rows.length + " baris");

    return ok_({
      summary: summary,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function importFasihContract(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const inputRows = Array.isArray(payload && payload.rows) ? payload.rows : [];

  if (!inputRows.length) {
    throw new Error("Excel kontrak petugas tidak punya baris data.");
  }

  if (inputRows.length > FASIH_CONTRACT_IMPORT_MAX_ROWS) {
    throw new Error("Baris Excel kontrak terlalu banyak. Maksimal " + FASIH_CONTRACT_IMPORT_MAX_ROWS + " baris.");
  }

  const importedAt = now_();
  const rows = inputRows.map(function (row, index) {
    return normalizeFasihContractRow_(row, importedAt, index + 1);
  });
  const summary = summarizeFasihContractRows_(rows);

  return withLock_(function () {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, FASIH_CONTRACT_SHEET_NAME, SHEET_HEADERS.fasih_contract);
    const headers = getHeaders_(sheet);

    writeRows_(sheet, headers, rows);
    logAudit_(user.user_id, "import", FASIH_CONTRACT_SHEET_NAME, "", rows.length + " baris");

    return ok_({
      summary: summary,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function importAnomaliProgress(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const inputRows = Array.isArray(payload && payload.rows) ? payload.rows : [];

  if (!inputRows.length) {
    throw new Error("File anomali tidak punya baris data.");
  }

  if (inputRows.length > ANOMALI_IMPORT_MAX_ROWS) {
    throw new Error("Baris anomali terlalu banyak. Maksimal " + ANOMALI_IMPORT_MAX_ROWS + " baris.");
  }

  const importedAt = now_();
  const rows = inputRows.map(function (row, index) {
    return normalizeAnomaliRow_(row, importedAt, index + 1);
  });
  const summary = summarizeAnomaliRows_(rows);

  return withLock_(function () {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, ANOMALI_SHEET_NAME, SHEET_HEADERS.rekap_anomali);
    const headers = getHeaders_(sheet);

    appendRows_(sheet, headers, rows);
    logAudit_(user.user_id, "import_append", ANOMALI_SHEET_NAME, "", rows.length + " baris");

    return ok_({
      summary: summary,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function setAnomaliCompleted(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const anomaliId = required_(payload && payload.anomali_id, "ID anomali");
  const completed = Boolean(payload && payload.completed);
  const rows = readRowsIfExists_(ANOMALI_SHEET_NAME);
  const row = rows.find(function (item) {
    return cleanText_(item.anomali_id) === anomaliId;
  });

  if (!row) {
    throw new Error("Data anomali tidak ditemukan.");
  }

  assertCanAccessAnomali_(user, row);

  return withLock_(function () {
    updateById_(ANOMALI_SHEET_NAME, "anomali_id", anomaliId, {
      tindak_lanjut: completed ? "Selesai" : "Belum Tindak Lanjut",
      is_resolved: completed ? "TRUE" : "FALSE",
      dashboard_updated_at: now_()
    });

    logAudit_(
      user.user_id,
      completed ? "mark_anomali_completed" : "mark_anomali_incomplete",
      ANOMALI_SHEET_NAME,
      anomaliId,
      cleanText_(row.idsls)
    );

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function createPml(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const namaPml = required_(payload && payload.nama_pml, "Nama PML");
  const telepon = cleanText_(payload && payload.telepon);

  const row = {
    pml_id: Utilities.getUuid(),
    nama_pml: namaPml,
    telepon: telepon,
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("pml", row);
    logAudit_(user.user_id, "create", "pml", row.pml_id, namaPml);

    return ok_({
      item: row,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function createPetugas(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const namaPetugas = required_(payload && payload.nama_petugas, "Nama petugas");
  const pmlId = user.role === "admin"
    ? required_(payload && payload.pml_id, "PML")
    : user.pml_id;

  assertCanAccessPml_(user, pmlId);
  requireActiveEntity_("pml", "pml_id", pmlId, "PML");

  const row = {
    petugas_id: Utilities.getUuid(),
    nama_petugas: namaPetugas,
    pml_id: pmlId,
    telepon: cleanText_(payload && payload.telepon),
    email_petugas: cleanText_(payload && payload.email_petugas),
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("petugas", row);
    logAudit_(user.user_id, "create", "petugas", row.petugas_id, namaPetugas);

    return ok_({
      item: row,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function updatePetugas(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const petugasId = required_(payload && payload.petugas_id, "ID petugas");
  const existing = requireActiveEntity_("petugas", "petugas_id", petugasId, "Petugas");
  const pmlId = user.role === "admin"
    ? required_(payload && payload.pml_id, "PML")
    : user.pml_id;

  assertCanAccessPml_(user, existing.pml_id);
  assertCanAccessPml_(user, pmlId);
  requireActiveEntity_("pml", "pml_id", pmlId, "PML");

  return withLock_(function () {
    updateById_("petugas", "petugas_id", petugasId, {
      nama_petugas: required_(payload && payload.nama_petugas, "Nama petugas"),
      pml_id: pmlId,
      telepon: cleanText_(payload && payload.telepon),
      email_petugas: cleanText_(payload && payload.email_petugas),
      updated_at: now_()
    });

    logAudit_(user.user_id, "update", "petugas", petugasId, petugasId);

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function createTask(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const petugasId = required_(payload && payload.petugas_id, "Petugas");
  const petugas = requireActiveEntity_("petugas", "petugas_id", petugasId, "Petugas");
  const pmlId = cleanText_(payload && payload.pml_id) || petugas.pml_id;

  if (petugas.pml_id !== pmlId) {
    throw new Error("Petugas tidak berada di bawah PML yang dipilih.");
  }

  assertCanAccessPml_(user, pmlId);

  const row = {
    task_id: Utilities.getUuid(),
    kecamatan: required_(payload && payload.kecamatan, "Kecamatan"),
    desa: required_(payload && payload.desa, "Desa/Kelurahan"),
    sls: required_(payload && payload.sls, "SLS/RT"),
    petugas_id: petugasId,
    pml_id: pmlId,
    mulai: required_(payload && payload.mulai, "Tanggal mulai"),
    selesai: required_(payload && payload.selesai, "Tanggal selesai"),
    target: toNonNegativeNumber_(payload && payload.target, "Target"),
    completed: "FALSE",
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("assign_tasks", row);
    logAudit_(user.user_id, "create", "assign_tasks", row.task_id, row.sls);

    return ok_({
      item: row,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function updateTask(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const taskId = required_(payload && payload.task_id, "ID wilayah kerja");
  const existing = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");
  const petugasId = required_(payload && payload.petugas_id, "Petugas");
  const petugas = requireActiveEntity_("petugas", "petugas_id", petugasId, "Petugas");
  const pmlId = cleanText_(payload && payload.pml_id) || petugas.pml_id;

  assertCanAccessPml_(user, existing.pml_id);

  if (petugas.pml_id !== pmlId) {
    throw new Error("Petugas tidak berada di bawah PML yang dipilih.");
  }

  assertCanAccessPml_(user, pmlId);

  return withLock_(function () {
    updateById_("assign_tasks", "task_id", taskId, {
      kecamatan: required_(payload && payload.kecamatan, "Kecamatan"),
      desa: required_(payload && payload.desa, "Desa/Kelurahan"),
      sls: required_(payload && payload.sls, "SLS/RT"),
      petugas_id: petugasId,
      pml_id: pmlId,
      mulai: required_(payload && payload.mulai, "Tanggal mulai"),
      selesai: required_(payload && payload.selesai, "Tanggal selesai"),
      target: toNonNegativeNumber_(payload && payload.target, "Target"),
      updated_at: now_()
    });

    logAudit_(user.user_id, "update", "assign_tasks", taskId, taskId);

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function createDailyReport(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const taskId = required_(payload && payload.task_id, "Wilayah kerja");
  const task = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");

  assertCanAccessPml_(user, task.pml_id);

  const dailyValues = buildDailyReportValues_(payload);
  const row = {
    report_id: Utilities.getUuid(),
    task_id: taskId,
    tanggal: required_(payload && payload.tanggal, "Tanggal monitoring"),
    keluarga_harian: dailyValues.keluarga_harian,
    usaha_non_pertanian_harian: dailyValues.usaha_non_pertanian_harian,
    usaha_pertanian_harian: dailyValues.usaha_pertanian_harian,
    muatan_harian: dailyValues.muatan_harian,
    catatan: cleanText_(payload && payload.catatan),
    created_by: user.user_id,
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("daily_reports", row);
    logAudit_(user.user_id, "create", "daily_reports", row.report_id, row.tanggal);

    return ok_({
      item: row,
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function updateDailyReport(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const reportId = required_(payload && payload.report_id, "ID laporan");
  const existing = requireActiveEntity_("daily_reports", "report_id", reportId, "Laporan harian");
  const existingTask = requireActiveEntity_("assign_tasks", "task_id", existing.task_id, "Wilayah kerja");
  const taskId = required_(payload && payload.task_id, "Wilayah kerja");
  const task = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");

  assertCanAccessPml_(user, existingTask.pml_id);
  assertCanAccessPml_(user, task.pml_id);

  const dailyValues = buildDailyReportValues_(payload);

  return withLock_(function () {
    updateById_("daily_reports", "report_id", reportId, {
      task_id: taskId,
      tanggal: required_(payload && payload.tanggal, "Tanggal monitoring"),
      keluarga_harian: dailyValues.keluarga_harian,
      usaha_non_pertanian_harian: dailyValues.usaha_non_pertanian_harian,
      usaha_pertanian_harian: dailyValues.usaha_pertanian_harian,
      muatan_harian: dailyValues.muatan_harian,
      catatan: cleanText_(payload && payload.catatan),
      updated_at: now_()
    });

    logAudit_(user.user_id, "update", "daily_reports", reportId, reportId);

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function buildDailyReportValues_(payload) {
  const hasStructuredFields = [
    "keluarga_harian",
    "usaha_non_pertanian_harian",
    "usaha_pertanian_harian"
  ].some(function (key) {
    return payload && payload[key] !== undefined && cleanText_(payload[key]) !== "";
  });

  if (!hasStructuredFields) {
    return {
      keluarga_harian: "",
      usaha_non_pertanian_harian: "",
      usaha_pertanian_harian: "",
      muatan_harian: toNonNegativeNumber_(payload && payload.muatan_harian, "Muatan harian")
    };
  }

  const keluarga = toNonNegativeNumber_(
    required_(payload && payload.keluarga_harian, "Keluarga"),
    "Keluarga"
  );
  const usahaNonPertanian = toNonNegativeNumber_(
    required_(payload && payload.usaha_non_pertanian_harian, "Usaha non-pertanian"),
    "Usaha non-pertanian"
  );
  const usahaPertanian = toNonNegativeNumber_(
    required_(payload && payload.usaha_pertanian_harian, "Usaha pertanian"),
    "Usaha pertanian"
  );

  return {
    keluarga_harian: keluarga,
    usaha_non_pertanian_harian: usahaNonPertanian,
    usaha_pertanian_harian: usahaPertanian,
    muatan_harian: keluarga + usahaNonPertanian + usahaPertanian
  };
}

function normalizeDailyReportRow_(row) {
  const normalized = Object.assign({}, row);

  if (hasStructuredDailyReportValues_(normalized)) {
    normalized.muatan_harian = getDailyReportMuatanValue_(normalized);
  }

  return normalized;
}

function hasStructuredDailyReportValues_(row) {
  return [
    "keluarga_harian",
    "keluarga",
    "kk",
    "jumlah_keluarga",
    "usaha_non_pertanian_harian",
    "usaha_non_pertanian",
    "usaha_non_per",
    "usaha_nonpertanian",
    "usaha",
    "usaha_pertanian_harian",
    "usaha_pertanian",
    "usaha_per",
    "utp"
  ].some(function (key) {
    return row && row[key] !== undefined && row[key] !== null && cleanText_(row[key]) !== "";
  });
}

function getDailyReportMuatanValue_(row) {
  return firstNumericValue_([row.keluarga_harian, row.keluarga, row.kk, row.jumlah_keluarga])
    + firstNumericValue_([row.usaha_non_pertanian_harian, row.usaha_non_pertanian, row.usaha_non_per, row.usaha_nonpertanian, row.usaha])
    + firstNumericValue_([row.usaha_pertanian_harian, row.usaha_pertanian, row.usaha_per, row.utp]);
}

function getDailyReportUsahaValue_(row) {
  if (hasStructuredDailyReportValues_(row)) {
    return firstNumericValue_([row.usaha_non_pertanian_harian, row.usaha_non_pertanian, row.usaha_non_per, row.usaha_nonpertanian, row.usaha])
      + firstNumericValue_([row.usaha_pertanian_harian, row.usaha_pertanian, row.usaha_per, row.utp]);
  }

  const muatan = firstNumericValue_([row.muatan_harian, row.muatan]);
  const kk = firstNumericValue_([row.keluarga_harian, row.keluarga, row.kk, row.jumlah_keluarga]);

  return kk ? Math.max(muatan - kk, 0) : muatan;
}

function normalizeFasihProgressRow_(input, importedAt, rowNumber) {
  const scrapedAt = cleanText_(pickFasihValue_(input, ["scraped_at", "Scraped_At"]));
  const slsCode = cleanFasihSlsCode_(pickFasihValue_(input, ["sls_code", "SLS_Code"]));

  if (!slsCode) {
    throw new Error("Baris FASIH " + rowNumber + " tidak punya SLS_Code.");
  }

  const open = toNumber_(pickFasihValue_(input, ["open", "Open"]));
  const draft = toNumber_(pickFasihValue_(input, ["draft", "Draft"]));
  const submittedByPencacah = toNumber_(pickFasihValue_(input, ["submitted_by_pencacah", "Submitted_By_Pencacah"]));
  const submittedRespondent = toNumber_(pickFasihValue_(input, ["submitted_respondent", "Submitted_Respondent"]));
  const rejected = toNumber_(pickFasihValue_(input, ["rejected", "Rejected"]));
  const approved = toNumber_(pickFasihValue_(input, ["approved", "Approved"]));
  const revokedByPengawas = toNumber_(pickFasihValue_(input, ["revoked_by_pengawas", "Revoked_By_Pengawas", "Revoked by Pengawas", "Revoked"]));
  const editedByPengawas = toNumber_(pickFasihValue_(input, ["edited_by_pengawas", "Edited_By_Pengawas", "Edited by Pengawas"]));
  const editedByAdminKabupaten = toNumber_(pickFasihValue_(input, ["edited_by_admin_kabupaten", "Edited_By_Admin_Kabupaten", "Edited by Admin Kabupaten", "Edited by Admin"]));
  const totalStatus = toNumber_(pickFasihValue_(input, ["total_status", "Total_Status"]))
    || open + draft + submittedByPencacah + submittedRespondent + rejected + approved
      + revokedByPengawas + editedByPengawas + editedByAdminKabupaten;

  return {
    imported_at: importedAt,
    scraped_at: scrapedAt,
    email: cleanText_(pickFasihValue_(input, ["email", "Email"])),
    username: cleanText_(pickFasihValue_(input, ["username", "Username"])),
    fullname: cleanText_(pickFasihValue_(input, ["fullname", "Fullname"])),
    sls_code: slsCode,
    sls_name: cleanText_(pickFasihValue_(input, ["sls_name", "SLS_Name"])),
    open: open,
    draft: draft,
    submitted_by_pencacah: submittedByPencacah,
    submitted_respondent: submittedRespondent,
    rejected: rejected,
    approved: approved,
    revoked_by_pengawas: revokedByPengawas,
    edited_by_pengawas: editedByPengawas,
    edited_by_admin_kabupaten: editedByAdminKabupaten,
    total_status: totalStatus,
    dominant_status: cleanText_(pickFasihValue_(input, ["dominant_status", "Dominant_Status"]))
      || dominantFasihStatus_({
        open: open,
        draft: draft,
        submitted_by_pencacah: submittedByPencacah,
        submitted_respondent: submittedRespondent,
        rejected: rejected,
        approved: approved,
        revoked_by_pengawas: revokedByPengawas,
        edited_by_pengawas: editedByPengawas,
        edited_by_admin_kabupaten: editedByAdminKabupaten
      }),
    all_statuses: cleanText_(pickFasihValue_(input, ["all_statuses", "All_Statuses"])),
    other_statuses: cleanText_(pickFasihValue_(input, ["other_statuses", "Other_Statuses"]))
  };
}

function pickFasihValue_(row, keys) {
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    if (row && row[key] !== undefined && row[key] !== null) {
      return row[key];
    }
  }

  return "";
}

function normalizeFasihContractRow_(input, importedAt, rowNumber) {
  const ppl = cleanText_(pickFasihValue_(input, ["ppl", "PPL", "petugas", "Petugas", "nama_petugas", "Nama Petugas"]));
  const email = cleanText_(pickFasihValue_(input, ["email_ppl", "Email PPL", "email", "Email", "email_petugas", "Email Petugas"]));

  if (!ppl && !email) {
    throw new Error("Baris kontrak " + rowNumber + " tidak punya PPL atau Email PPL.");
  }

  const totalPrelist = toNumber_(pickFasihValue_(input, ["total_prelist", "Total Prelist", "Total Prelist Assignment", "prelist_assignment", "Prelist Assignment"]));
  const jumlahSubmit = toNumber_(pickFasihValue_(input, ["jumlah_submit", "Jumlah Submit", "Jumlah Submit Prelist", "submit_prelist", "Submit Prelist"]));
  const progress = normalizePercentNumber_(pickFasihValue_(input, ["persen_sudah_submit", "Persen Sudah Submit", "% Sudah Submit", "Progress Submit", "Persentase"]));
  const minimalTermin1 = Math.ceil(totalPrelist * 0.4);
  const kekuranganTermin1 = Math.max(minimalTermin1 - jumlahSubmit, 0);

  return {
    imported_at: importedAt,
    ppl: ppl,
    email_ppl: email,
    total_prelist: totalPrelist,
    persen_sudah_submit: progress,
    jumlah_submit: jumlahSubmit,
    minimal_submit_termin_1: minimalTermin1,
    kekurangan_termin_1: kekuranganTermin1,
    status_termin_1: fasihContractStatus_(progress),
    open: toNumber_(pickFasihValue_(input, ["open", "Open"])),
    draft: toNumber_(pickFasihValue_(input, ["draft", "Draft"])),
    submit_by_pencacah: toNumber_(pickFasihValue_(input, ["submit_by_pencacah", "Submit by Pencacah", "Submit By Pencacah", "Submitted_By_Pencacah"])),
    submit_responden: toNumber_(pickFasihValue_(input, ["submit_responden", "Submit Responden", "Submit Respondent", "Submitted_Respondent"])),
    approve_by_pengawas: toNumber_(pickFasihValue_(input, ["approve_by_pengawas", "Approve by Pengawas", "Approved", "Approved by Pengawas"])),
    reject_by_pengawas: toNumber_(pickFasihValue_(input, ["reject_by_pengawas", "Reject by Pengawas", "Rejected", "Rejected by Pengawas"])),
    revoked_by_pengawas: toNumber_(pickFasihValue_(input, ["revoked_by_pengawas", "Revoked by Pengawas", "Revoked"])),
    edited_by_pengawas: toNumber_(pickFasihValue_(input, ["edited_by_pengawas", "Edited by Pengawas", "Edited Pengawas"])),
    edited_by_admin: toNumber_(pickFasihValue_(input, ["edited_by_admin", "Edited by Admin", "Edited Admin"]))
  };
}

function normalizePercentNumber_(value) {
  const text = cleanText_(value).replace("%", "").replace(",", ".");
  const number = toNumber_(text);

  if (number > 0 && number <= 1) {
    return number * 100;
  }

  return number;
}

function fasihContractStatus_(progress) {
  const value = toNumber_(progress);

  if (value >= 40) {
    return "green";
  }

  if (value >= 20) {
    return "yellow";
  }

  return "red";
}

function summarizeFasihContractRows_(rows) {
  return rows.reduce(function (summary, row) {
    summary.rows++;
    summary.imported_at = summary.imported_at || cleanText_(row.imported_at);
    summary.total_prelist += toNumber_(row.total_prelist);
    summary.jumlah_submit += toNumber_(row.jumlah_submit);
    summary.kekurangan_termin_1 += toNumber_(row.kekurangan_termin_1);
    summary[row.status_termin_1] = (summary[row.status_termin_1] || 0) + 1;
    return summary;
  }, {
    rows: 0,
    imported_at: "",
    total_prelist: 0,
    jumlah_submit: 0,
    kekurangan_termin_1: 0,
    red: 0,
    yellow: 0,
    green: 0
  });
}

function cleanFasihSlsCode_(value) {
  return cleanText_(value).replace(/\s+/g, "");
}

function dominantFasihStatus_(row) {
  const statuses = [
    ["Open", row.open],
    ["Draft", row.draft],
    ["Submitted_By_Pencacah", row.submitted_by_pencacah],
    ["Submitted_Respondent", row.submitted_respondent],
    ["Rejected", row.rejected],
    ["Approved", row.approved],
    ["Revoked_By_Pengawas", row.revoked_by_pengawas],
    ["Edited_By_Pengawas", row.edited_by_pengawas],
    ["Edited_By_Admin_Kabupaten", row.edited_by_admin_kabupaten]
  ].filter(function (item) {
    return toNumber_(item[1]) > 0;
  }).sort(function (a, b) {
    return toNumber_(b[1]) - toNumber_(a[1]);
  });

  return statuses.length ? statuses[0][0] : "";
}

function summarizeFasihRows_(rows) {
  const summary = {
    imported_at: "",
    scraped_at: "",
    rows: rows.length,
    unique_sls: 0,
    open: 0,
    draft: 0,
    submitted_by_pencacah: 0,
    submitted_respondent: 0,
    rejected: 0,
    approved: 0,
    revoked_by_pengawas: 0,
    edited_by_pengawas: 0,
    edited_by_admin_kabupaten: 0,
    total_status: 0
  };
  const uniqueSls = {};

  rows.forEach(function (row) {
    const slsCode = cleanFasihSlsCode_(row.sls_code || row.SLS_Code);

    if (slsCode) {
      uniqueSls[slsCode] = true;
    }

    summary.imported_at = summary.imported_at || cleanText_(row.imported_at);
    summary.scraped_at = summary.scraped_at || cleanText_(row.scraped_at || row.Scraped_At);
    summary.open += toNumber_(row.open || row.Open);
    summary.draft += toNumber_(row.draft || row.Draft);
    summary.submitted_by_pencacah += toNumber_(row.submitted_by_pencacah || row.Submitted_By_Pencacah);
    summary.submitted_respondent += toNumber_(row.submitted_respondent || row.Submitted_Respondent);
    summary.rejected += toNumber_(row.rejected || row.Rejected);
    summary.approved += toNumber_(row.approved || row.Approved);
    summary.revoked_by_pengawas += toNumber_(row.revoked_by_pengawas || row.Revoked_By_Pengawas);
    summary.edited_by_pengawas += toNumber_(row.edited_by_pengawas || row.Edited_By_Pengawas);
    summary.edited_by_admin_kabupaten += toNumber_(row.edited_by_admin_kabupaten || row.Edited_By_Admin_Kabupaten);
    summary.total_status += toNumber_(row.total_status || row.Total_Status);
  });

  summary.unique_sls = Object.keys(uniqueSls).length;

  if (!summary.total_status) {
    summary.total_status = summary.open
      + summary.draft
      + summary.submitted_by_pencacah
      + summary.submitted_respondent
      + summary.rejected
      + summary.approved
      + summary.revoked_by_pengawas
      + summary.edited_by_pengawas
      + summary.edited_by_admin_kabupaten;
  }

  return summary;
}

function assertUniqueFasihSlsRows_(rows) {
  const seen = {};
  const duplicates = [];

  rows.forEach(function (row, index) {
    const slsCode = cleanFasihSlsCode_(row.sls_code);

    if (!seen[slsCode]) {
      seen[slsCode] = [index + 1];
      return;
    }

    seen[slsCode].push(index + 1);
    duplicates.push(slsCode + " (baris data " + seen[slsCode].join(", ") + ")");
  });

  if (duplicates.length) {
    throw new Error(
      "SLS_Code duplikat ditemukan: "
      + duplicates.slice(0, 3).join("; ")
      + ". Hapus baris percobaan/duplikat dulu sebelum import."
    );
  }
}

function normalizeAnomaliRow_(input, importedAt, rowNumber) {
  const sourceType = normalizeAnomaliSource_(pickAnomaliValue_(input, ["source_type", "Source_Type", "Sumber"]));
  const kodeDesa = cleanText_(pickAnomaliValue_(input, ["kode_desa", "Kode Desa", "Kode Desa/Kel"]));
  const kodeSls = cleanText_(pickAnomaliValue_(input, ["kode_sls", "Kode SLS"]));
  const subSls = cleanText_(pickAnomaliValue_(input, ["sub_sls", "Sub SLS"]));
  const idsls = finalizeAnomaliSlsId_(
    pickAnomaliValue_(input, ["idsls", "id_sls", "NO SLS", "No SLS", "SLS_Code"])
    || buildAnomaliSlsId_(kodeDesa, kodeSls, subSls),
    subSls
  );
  const assignmentId = cleanText_(pickAnomaliValue_(input, ["assignment_id", "Assignment ID"]));
  const anomaliTitle = cleanText_(pickAnomaliValue_(input, ["anomali_title", "Nama Anomali", "Anomali_Title"]));

  if (!idsls) {
    throw new Error("Baris anomali " + rowNumber + " tidak punya NO SLS.");
  }

  if (!anomaliTitle) {
    throw new Error("Baris anomali " + rowNumber + " tidak punya Nama Anomali.");
  }

  const row = {
    imported_at: importedAt,
    dashboard_updated_at: cleanText_(pickAnomaliValue_(input, ["dashboard_updated_at", "Dashboard Updated At"])),
    source_type: sourceType,
    nama_objek: cleanText_(pickAnomaliValue_(input, ["nama_objek", "Nama KRT", "Nama Usaha"])),
    idsls: idsls,
    kode_prov: cleanText_(pickAnomaliValue_(input, ["kode_prov", "Kode Prov"])),
    nama_provinsi: cleanText_(pickAnomaliValue_(input, ["nama_provinsi", "Nama Provinsi"])),
    kode_kab: cleanText_(pickAnomaliValue_(input, ["kode_kab", "Kode Kab/Kota", "Kode Kab"])),
    nama_kab: cleanText_(pickAnomaliValue_(input, ["nama_kab", "Nama Kab/Kota", "Nama Kab"])),
    kode_kec: cleanText_(pickAnomaliValue_(input, ["kode_kec", "Kode Kec"])),
    nama_kecamatan: cleanText_(pickAnomaliValue_(input, ["nama_kecamatan", "Nama Kecamatan"])),
    kode_desa: kodeDesa,
    nama_desa: cleanText_(pickAnomaliValue_(input, ["nama_desa", "Nama Desa/Kel", "Nama Desa"])),
    kode_sls: kodeSls,
    sub_sls: subSls,
    assignment_id: assignmentId,
    anomali_no: cleanText_(pickAnomaliValue_(input, ["anomali_no", "No", "No."])),
    anomali_title: anomaliTitle,
    tindak_lanjut: cleanText_(pickAnomaliValue_(input, ["tindak_lanjut", "Tindak Lanjut"])) || "Belum Tindak Lanjut",
    pjtindaklanjut: cleanText_(pickAnomaliValue_(input, ["pjtindaklanjut", "PJ Tindak Lanjut", "Pj Tindak Lanjut"])),
    id_petugas: cleanText_(pickAnomaliValue_(input, ["id_petugas", "ID Petugas"])),
    email_petugas: cleanText_(pickAnomaliValue_(input, ["email_petugas", "Email Petugas"])),
    status: cleanText_(pickAnomaliValue_(input, ["status", "Status"])),
    link_fasih: cleanText_(pickAnomaliValue_(input, ["link_fasih", "Link Fasih"])),
    link_edit_fasih: cleanText_(pickAnomaliValue_(input, ["link_edit_fasih", "Link Edit Fasih"])),
    is_resolved: ""
  };

  row.is_resolved = cleanText_(pickAnomaliValue_(input, ["is_resolved", "Is Resolved"]))
    || (isAnomaliCompleted_(row) ? "TRUE" : "FALSE");
  row.anomali_id = buildAnomaliId_(row, rowNumber);

  return row;
}

function pickAnomaliValue_(row, keys) {
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    if (row && row[key] !== undefined && row[key] !== null && cleanText_(row[key]) !== "") {
      return row[key];
    }
  }

  return "";
}

function normalizeAnomaliSource_(value) {
  const text = cleanText_(value).toLowerCase();

  if (text.indexOf("usaha") !== -1) {
    return "usaha";
  }

  if (text.indexOf("keluarga") !== -1) {
    return "keluarga";
  }

  return text || "anomali";
}

function buildAnomaliSlsId_(kodeDesa, kodeSls, subSls) {
  if (!kodeDesa || !kodeSls) {
    return "";
  }

  return cleanAnomaliSlsId_(kodeDesa)
    + cleanAnomaliSlsId_(kodeSls).padStart(4, "0")
    + cleanAnomaliSlsId_(subSls).padStart(2, "0");
}

function cleanAnomaliSlsId_(value) {
  return cleanText_(value).replace(/\D/g, "");
}

function finalizeAnomaliSlsId_(value, subSls) {
  const idsls = cleanAnomaliSlsId_(value);
  const cleanSubSls = cleanAnomaliSlsId_(subSls);

  if (idsls.length === 14 && cleanSubSls) {
    return idsls + cleanSubSls.padStart(2, "0");
  }

  return idsls;
}

function buildAnomaliId_(row, rowNumber) {
  const raw = [
    row.source_type,
    row.assignment_id,
    row.idsls,
    row.anomali_no,
    row.anomali_title,
    row.imported_at,
    rowNumber
  ].join("|");

  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw))
    .replace(/=+$/g, "")
    .slice(0, 28);
}

function isAnomaliCompleted_(row) {
  const text = cleanText_(row && row.tindak_lanjut).toLowerCase();
  return text === "selesai" || text === "sudah selesai" || text === "done";
}

function summarizeAnomaliRows_(rows) {
  const uniqueSls = {};

  return rows.reduce(function (summary, row) {
    if (row.idsls) {
      uniqueSls[row.idsls] = true;
    }

    summary.rows++;
    summary.unique_sls = Object.keys(uniqueSls).length;

    if (row.source_type === "usaha") {
      summary.usaha++;
    } else if (row.source_type === "keluarga") {
      summary.keluarga++;
    }

    if (isAnomaliCompleted_(row)) {
      summary.selesai++;
    } else {
      summary.belum_selesai++;
    }

    return summary;
  }, {
    rows: 0,
    unique_sls: 0,
    keluarga: 0,
    usaha: 0,
    selesai: 0,
    belum_selesai: 0
  });
}

function assertCanAccessAnomali_(user, anomaliRow) {
  if (user.role === "admin" || user.role === "viewer") {
    return;
  }

  const idsls = cleanWeeklySlsId_(anomaliRow && anomaliRow.idsls);
  const canAccess = readRows_("assign_tasks").some(function (task) {
    return isActive_(task.active)
      && cleanText_(task.pml_id) === cleanText_(user.pml_id)
      && cleanWeeklySlsId_(task.idsubsls) === idsls;
  });

  if (!canAccess) {
    throw new Error("Akses PML tidak sesuai dengan data anomali.");
  }
}

function createUser(token, payload) {
  const actor = requireRole_(requireUser_(token), ["admin"]);
  const username = normalizeUsername_(payload && payload.username);
  const password = String((payload && payload.password) || "");
  const role = cleanText_(payload && payload.role).toLowerCase();
  const pmlId = cleanText_(payload && payload.pml_id);

  if (!username) {
    throw new Error("Username wajib diisi.");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }

  if (["admin", "pml", "viewer"].indexOf(role) === -1) {
    throw new Error("Role hanya boleh admin, pml, atau viewer.");
  }

  if (role === "pml") {
    requireActiveEntity_("pml", "pml_id", pmlId, "PML");
  }

  if (readRows_("users").some(function (row) {
    return normalizeUsername_(row.username) === username && isActive_(row.active);
  })) {
    throw new Error("Username sudah digunakan.");
  }

  const row = {
    user_id: Utilities.getUuid(),
    nama: required_(payload && payload.nama, "Nama user"),
    username: username,
    password_hash: hashPassword_(username, password),
    role: role,
    pml_id: role === "pml" ? pmlId : "",
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("users", row);
    logAudit_(actor.user_id, "create", "users", row.user_id, username);

    return ok_({
      item: publicUser_(row),
      data: buildDataForUser_(actor, { includePrelist: false })
    });
  });
}

function updatePml(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const pmlId = required_(payload && payload.pml_id, "ID PML");

  requireActiveEntity_("pml", "pml_id", pmlId, "PML");

  return withLock_(function () {
    updateById_("pml", "pml_id", pmlId, {
      nama_pml: required_(payload && payload.nama_pml, "Nama PML"),
      telepon: cleanText_(payload && payload.telepon),
      updated_at: now_()
    });

    logAudit_(user.user_id, "update", "pml", pmlId, pmlId);

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function changePassword(token, payload) {
  const user = requireUser_(token);
  const currentPassword = String((payload && payload.current_password) || "");
  const newPassword = String((payload && payload.new_password) || "");

  if (newPassword.length < 6) {
    throw new Error("Password baru minimal 6 karakter.");
  }

  if (hashPassword_(user.username, currentPassword) !== requireActiveEntity_("users", "user_id", user.user_id, "User").password_hash) {
    throw new Error("Password lama salah.");
  }

  return withLock_(function () {
    updateById_("users", "user_id", user.user_id, {
      password_hash: hashPassword_(user.username, newPassword),
      updated_at: now_()
    });

    logAudit_(user.user_id, "change_password", "users", user.user_id, "");

    return ok_();
  });
}

function deletePml(token, pmlId) {
  const user = requireRole_(requireUser_(token), ["admin"]);

  return softDelete_(user, "pml", "pml_id", pmlId);
}

function deletePetugas(token, petugasId) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const petugas = requireActiveEntity_("petugas", "petugas_id", petugasId, "Petugas");
  assertCanAccessPml_(user, petugas.pml_id);

  return softDelete_(user, "petugas", "petugas_id", petugasId);
}

function deleteTask(token, taskId) {
  const user = requireRole_(requireUser_(token), ["admin"]);
  const task = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");
  assertCanAccessPml_(user, task.pml_id);

  return softDelete_(user, "assign_tasks", "task_id", taskId);
}

function setTaskCompleted(token, payload) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const taskId = required_(payload && payload.task_id, "ID wilayah kerja");
  const completed = Boolean(payload && payload.completed);
  const task = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");

  assertCanAccessPml_(user, task.pml_id);

  return withLock_(function () {
    updateById_("assign_tasks", "task_id", taskId, {
      completed: completed ? "TRUE" : "FALSE",
      updated_at: now_()
    });

    logAudit_(
      user.user_id,
      completed ? "mark_completed" : "mark_incomplete",
      "assign_tasks",
      taskId,
      taskId
    );

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function deleteDailyReport(token, reportId) {
  const user = requireRole_(requireUser_(token), ["admin", "pml"]);
  const report = requireActiveEntity_("daily_reports", "report_id", reportId, "Laporan harian");
  const task = requireActiveEntity_("assign_tasks", "task_id", report.task_id, "Wilayah kerja");
  assertCanAccessPml_(user, task.pml_id);

  return softDelete_(user, "daily_reports", "report_id", reportId);
}

function deactivateUser(token, userId) {
  const actor = requireRole_(requireUser_(token), ["admin"]);

  if (actor.user_id === userId) {
    throw new Error("Akun yang sedang login tidak bisa dinonaktifkan dari sini.");
  }

  return softDelete_(actor, "users", "user_id", userId);
}

function ensureWeeklyProvinceSheet_(spreadsheet) {
  const properties = PropertiesService.getScriptProperties();
  const savedSheetId = properties.getProperty(WEEKLY_PROVINCE_SHEET_ID_PROPERTY);
  let sheet = savedSheetId ? getSheetById_(spreadsheet, savedSheetId) : null;

  if (!sheet) {
    sheet = spreadsheet.getSheetByName(WEEKLY_PROVINCE_SHEET_NAME) || findWeeklyProvinceExportSheet_(spreadsheet);
  }

  if (!sheet) {
    sheet = spreadsheet.insertSheet(WEEKLY_PROVINCE_SHEET_NAME);
  }

  properties.setProperty(WEEKLY_PROVINCE_SHEET_ID_PROPERTY, String(sheet.getSheetId()));

  return sheet;
}

function getSheetById_(spreadsheet, sheetId) {
  const numericSheetId = Number(sheetId);

  return spreadsheet.getSheets().find(function (sheet) {
    return sheet.getSheetId() === numericSheetId;
  }) || null;
}

function findWeeklyProvinceExportSheet_(spreadsheet) {
  return spreadsheet.getSheets().find(function (sheet) {
    return sheet.getName().indexOf(WEEKLY_PROVINCE_EXPORT_SHEET_PREFIX) === 0;
  }) || null;
}

function getWeeklyProvinceHeaders_() {
  return [
    "KODE KAB/KOT",
    "NAMA KAB/KOT",
    "KODE KEC",
    "NAMA KEC",
    "KODE DESA/KEL",
    "NAMA DESA/KEL",
    "ID SLS",
    "NAMA SLS",
    "KLASIFIKASI DESA/KEL",
    "KODE PCL",
    "NAMA PCL",
    "NO HP",
    "KODE PML",
    "NAMA PML",
    "NO HP",
    "NAMA PJ ORGANIK (KORWIL/KOSEKA)",
    "NO HP",
    "KORWIL PROVINSI",
    "NO HP"
  ].concat(
    WEEKLY_RECAP_PERIODS.map(function (period) {
      return "JUMLAH KK HASIL LAP (" + period.exportLabel + ")";
    }),
    [
      "JUMLAH KK HASIL LAP (TOTAL)",
      "JUMLAH KK PRELIST",
      "SELISIH"
    ],
    WEEKLY_RECAP_PERIODS.map(function (period) {
      return "JUMLAH USAHA HASIL LAP (" + period.exportLabel + ")";
    }),
    [
      "JUMLAH USAHA HASIL LAP (TOTAL)",
      "JUMLAH USAHA PRELIST",
      "SELISIH"
    ]
  );
}

function buildWeeklyProvinceRows_(checkpointDate) {
  const pmlById = indexActiveRowsById_("pml", "pml_id");
  const petugasById = indexActiveRowsById_("petugas", "petugas_id");
  checkpointDate = cleanText_(checkpointDate) || dateStamp_();
  const reportsByTask = {};

  readRows_("daily_reports").forEach(function (report) {
    const taskId = cleanText_(report.task_id);
    const dateText = cleanText_(report.tanggal).slice(0, 10);

    if (!taskId || !isDateInWeeklyRecapRange_(dateText) || !isActive_(report.active)) {
      return;
    }

    if (!reportsByTask[taskId]) {
      reportsByTask[taskId] = [];
    }

    reportsByTask[taskId].push({ report: report, dateText: dateText });
  });

  const groups = {};

  readRows_("assign_tasks")
    .filter(function (task) {
      return isActive_(task.active);
    })
    .forEach(function (task) {
      const cleanSlsId = cleanWeeklySlsId_(task.idsubsls);

      if (!cleanSlsId) {
        return;
      }

      if (!groups[cleanSlsId]) {
        groups[cleanSlsId] = {
          idsubsls: cleanSlsId,
          task: task,
          metrics: emptyCumulativeMetrics_(),
          kkPrelist: 0,
          usahaPrelist: 0
        };
      }

      if (shouldUseAsWeeklyRepresentative_(groups[cleanSlsId].task, task)) {
        groups[cleanSlsId].task = task;
      }

      groups[cleanSlsId].kkPrelist += toNumber_(task.keluarga);
      groups[cleanSlsId].usahaPrelist += getTaskUsahaTotal_(task);
      addCumulativeMetrics_(groups[cleanSlsId].metrics, getCumulativeTaskMetrics_(getReportsForTask_(reportsByTask, task), checkpointDate));
    });

  return Object.keys(groups)
    .map(function (key) {
      return groups[key];
    })
    .sort(sortWeeklyGroupRows_)
    .map(function (group) {
      const task = group.task;
      const pml = pmlById[cleanText_(task.pml_id)] || {};
      const petugas = petugasById[cleanText_(task.petugas_id)] || {};
      const codes = parseSlsCodes_(group.idsubsls);
      const totalKk = getLastActiveCumulativeValue_(group.metrics.kk.values, checkpointDate);
      const totalUsaha = getLastActiveCumulativeValue_(group.metrics.usaha.values, checkpointDate);

      return [
        codes.kodeKabKot,
        "KEPULAUAN ANAMBAS",
        codes.kodeKec,
        titleCase_(task.kecamatan),
        codes.kodeDesa,
        titleCase_(task.desa),
        group.idsubsls,
        cleanText_(task.sls) || "-",
        getDesaClassification_(codes),
        cleanText_(task.petugas_id),
        cleanText_(petugas.nama_petugas) || cleanText_(task.petugas_id),
        cleanText_(petugas.telepon),
        cleanText_(task.pml_id),
        cleanText_(pml.nama_pml) || cleanText_(task.pml_id),
        cleanText_(pml.telepon),
        cleanText_(task.korwil),
        "",
        "",
        ""
      ].concat(
        WEEKLY_RECAP_PERIODS.map(function (period) {
          return isWeeklyRecapPeriodActive_(period, checkpointDate) ? group.metrics.kk.values[period.key] || 0 : "";
        }),
        [
          totalKk,
          group.kkPrelist,
          totalKk - group.kkPrelist
        ],
        WEEKLY_RECAP_PERIODS.map(function (period) {
          return isWeeklyRecapPeriodActive_(period, checkpointDate) ? group.metrics.usaha.values[period.key] || 0 : "";
        }),
        [
          totalUsaha,
          group.usahaPrelist,
          totalUsaha - group.usahaPrelist
        ]
      );
    });
}

function getCumulativeTaskMetrics_(items, checkpointDate) {
  const metrics = emptyCumulativeMetrics_();

  items.forEach(function (item) {
    const report = item.report;
    const kk = firstNumericValue_([report.keluarga_harian, report.keluarga, report.kk]);
    const usaha = getDailyReportUsahaValue_(report);

    WEEKLY_RECAP_PERIODS.forEach(function (period) {
      if (isWeeklyRecapPeriodActive_(period, checkpointDate) && item.dateText >= WEEKLY_RECAP_START_DATE && item.dateText <= period.end) {
        metrics.kk.values[period.key] += kk;
        metrics.usaha.values[period.key] += usaha;
      }
    });
  });

  return metrics;
}

function emptyCumulativeMetrics_() {
  return {
    kk: emptyCumulativeMetric_(),
    usaha: emptyCumulativeMetric_()
  };
}

function emptyCumulativeMetric_() {
  return {
    values: WEEKLY_RECAP_PERIODS.reduce(function (result, period) {
      result[period.key] = 0;
      return result;
    }, {})
  };
}

function addCumulativeMetrics_(target, source) {
  WEEKLY_RECAP_PERIODS.forEach(function (period) {
    target.kk.values[period.key] += source.kk.values[period.key] || 0;
    target.usaha.values[period.key] += source.usaha.values[period.key] || 0;
  });
}

function getLastActiveCumulativeValue_(values, checkpointDate) {
  const activePeriods = WEEKLY_RECAP_PERIODS.filter(function (period) {
    return isWeeklyRecapPeriodActive_(period, checkpointDate);
  });
  const lastPeriod = activePeriods[activePeriods.length - 1];

  return lastPeriod ? values[lastPeriod.key] || 0 : 0;
}

function isWeeklyRecapPeriodActive_(period, checkpointDate) {
  return cleanText_(checkpointDate) >= period.start;
}

function isDateInWeeklyRecapRange_(dateText) {
  const lastPeriod = WEEKLY_RECAP_PERIODS[WEEKLY_RECAP_PERIODS.length - 1];

  return Boolean(dateText && lastPeriod && dateText >= WEEKLY_RECAP_START_DATE && dateText <= lastPeriod.end);
}

function firstNumericValue_(values) {
  for (let index = 0; index < values.length; index++) {
    const value = values[index];

    if (value !== undefined && value !== null && cleanText_(value) !== "" && isFinite(Number(value))) {
      return toNumber_(value);
    }
  }

  return 0;
}

function getTaskMuatanTotal_(task) {
  const muatanTotal = firstNumericValue_([task && task.muatan_total]);

  if (muatanTotal > 0) {
    return muatanTotal;
  }

  if (hasAnyNumericValue_([task && task.keluarga, task && task.usaha, task && task.utp])) {
    return toNumber_(task && task.keluarga) + toNumber_(task && task.usaha) + toNumber_(task && task.utp);
  }

  return toNumber_(task && task.target);
}

function getTaskUsahaTotal_(task) {
  if (hasAnyNumericValue_([task && task.usaha, task && task.utp])) {
    return toNumber_(task && task.usaha) + toNumber_(task && task.utp);
  }

  const target = toNumber_(task && task.target);
  const keluarga = toNumber_(task && task.keluarga);

  return keluarga ? Math.max(target - keluarga, 0) : target;
}

function hasAnyNumericValue_(values) {
  return values.some(function (value) {
    return value !== undefined && value !== null && cleanText_(value) !== "" && isFinite(Number(value));
  });
}

function parseSlsCodes_(idsls) {
  const normalizedId = cleanText_(idsls).replace(/\D/g, "");

  return {
    kodeKabKot: normalizedId.slice(2, 4),
    kodeKec: normalizedId.slice(4, 7),
    kodeDesa: normalizedId.slice(7, 10),
    idSort: normalizedId
  };
}

function getDesaClassification_(codes) {
  return DESA_CLASSIFICATION_BY_CODE[codes.kodeKec + "-" + codes.kodeDesa] || "";
}

function cleanWeeklySlsId_(idsls) {
  return cleanText_(idsls).replace(new RegExp(ORGANIC_TASK_SUFFIX + "$", "i"), "");
}

function buildWeeklyProvinceExportSheetName_(checkpointDate) {
  const activePeriod = getActiveWeeklyRecapPeriod_(checkpointDate);
  const periodLabel = activePeriod
    ? activePeriod.key + "_" + activePeriod.exportLabel.replace(/\s+/g, "_")
    : "Belum_Mulai";

  return sanitizeSheetName_(
    WEEKLY_PROVINCE_EXPORT_SHEET_PREFIX
    + "_"
    + periodLabel
    + "_"
    + cleanText_(checkpointDate)
  );
}

function getActiveWeeklyRecapPeriod_(checkpointDate) {
  const dateText = cleanText_(checkpointDate);
  let activePeriod = null;

  WEEKLY_RECAP_PERIODS.forEach(function (period) {
    if (dateText >= period.start) {
      activePeriod = period;
    }
  });

  return activePeriod;
}

function setSheetNameSafely_(spreadsheet, sheet, desiredName) {
  const safeName = sanitizeSheetName_(desiredName);
  let finalName = safeName;
  let suffix = 2;

  while (spreadsheet.getSheetByName(finalName) && spreadsheet.getSheetByName(finalName).getSheetId() !== sheet.getSheetId()) {
    finalName = truncateSheetName_(safeName, String(suffix).length + 1) + "_" + suffix;
    suffix += 1;
  }

  if (sheet.getName() !== finalName) {
    sheet.setName(finalName);
  }
}

function sanitizeSheetName_(value) {
  return truncateSheetName_(
    cleanText_(value)
      .replace(/[:\\/?*\[\]]/g, "_")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
    || WEEKLY_PROVINCE_SHEET_NAME,
    0
  );
}

function truncateSheetName_(value, reservedLength) {
  const maxLength = 100 - (reservedLength || 0);

  return cleanText_(value).slice(0, Math.max(1, maxLength));
}

function isOrganicTaskRow_(task) {
  return cleanText_(task.task_id).slice(-ORGANIC_TASK_SUFFIX.length) === ORGANIC_TASK_SUFFIX
    || cleanText_(task.petugas_id) === ORGANIC_PETUGAS_ID
    || cleanText_(task.pml_id) === ORGANIC_PML_ID;
}

function getTaskReportIds_(task) {
  const ids = [];
  const taskId = cleanText_(task && task.task_id);
  const idsubsls = cleanText_(task && task.idsubsls);

  if (taskId) {
    ids.push(taskId);
  }

  if (idsubsls) {
    ids.push("TASK-" + idsubsls + (isOrganicTaskRow_(task) ? ORGANIC_TASK_SUFFIX : ""));
  }

  return ids;
}

function getReportsForTask_(reportsByTask, task) {
  const seen = {};
  const reports = [];

  getTaskReportIds_(task).forEach(function (taskId) {
    (reportsByTask[taskId] || []).forEach(function (item) {
      const key = cleanText_(item.report && item.report.report_id) || taskId + "|" + cleanText_(item.dateText);

      if (!seen[key]) {
        seen[key] = true;
        reports.push(item);
      }
    });
  });

  return reports;
}

function shouldUseAsWeeklyRepresentative_(currentTask, nextTask) {
  if (!currentTask) {
    return true;
  }

  return isOrganicTaskRow_(currentTask) && !isOrganicTaskRow_(nextTask);
}

function sortWeeklyGroupRows_(left, right) {
  const leftCodes = parseSlsCodes_(left.idsubsls);
  const rightCodes = parseSlsCodes_(right.idsubsls);

  return leftCodes.kodeKec.localeCompare(rightCodes.kodeKec)
    || leftCodes.kodeDesa.localeCompare(rightCodes.kodeDesa)
    || leftCodes.idSort.localeCompare(rightCodes.idSort)
    || cleanText_(left.task.sls).localeCompare(cleanText_(right.task.sls), "id");
}

function formatWeeklyProvinceSheet_(sheet, rowCount, columnCount) {
  const textColumns = [1, 3, 5, 7, 9, 10, 12, 13, 15, 17, 19];

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columnCount)
    .setBackground("#f2b233")
    .setFontWeight("bold");

  textColumns.forEach(function (column) {
    sheet.getRange(1, column, rowCount, 1).setNumberFormat("@");
  });

  if (rowCount > 1 && columnCount > 19) {
    sheet.getRange(2, 20, rowCount - 1, columnCount - 19).setNumberFormat("#,##0");
  }

  sheet.setColumnWidths(1, columnCount, 120);
  sheet.setColumnWidths(1, 19, 150);
  sheet.setColumnWidth(7, 190);
  sheet.setColumnWidth(8, 260);
}

function buildSpreadsheetExportUrl_(spreadsheet, sheet) {
  return "https://docs.google.com/spreadsheets/d/"
    + spreadsheet.getId()
    + "/export?format=xlsx&single=true&gid="
    + sheet.getSheetId()
    + "&t="
    + encodeURIComponent(dateStamp_());
}

function titleCase_(value) {
  return cleanText_(value)
    .toLowerCase()
    .replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
}

function buildDataForUser_(user, options) {
  const includePrelist = !options || options.includePrelist !== false;
  const perf = options && options.perf;
  const allPml = readRows_("pml").filter(function (row) {
    return isActive_(row.active);
  });
  perfMark_(perf, "read pml");
  const allPetugas = readRows_("petugas").filter(function (row) {
    return isActive_(row.active);
  });
  perfMark_(perf, "read petugas");
  const allTasks = readRows_("assign_tasks").filter(function (row) {
    return isActive_(row.active);
  });
  perfMark_(perf, "read tasks");
  const allReports = readRows_("daily_reports")
    .filter(function (row) {
      return isActive_(row.active);
    })
    .map(normalizeDailyReportRow_);
  perfMark_(perf, "read reports");
  const fasihRows = readRowsIfExists_("fasih_progress");
  perfMark_(perf, "read fasih");
  const fasihContractRows = readRowsIfExists_(FASIH_CONTRACT_SHEET_NAME);
  perfMark_(perf, "read fasih contract");
  const anomaliRows = readRowsIfExists_(ANOMALI_SHEET_NAME);
  perfMark_(perf, "read anomali");
  const prelist = includePrelist ? readPrelistRows_() : null;
  perfMark_(perf, includePrelist ? "read prelist" : "skip prelist");

  if (user.role === "admin" || user.role === "viewer") {
    const allUsers = user.role === "admin"
      ? readRows_("users").filter(function (row) {
          return isActive_(row.active);
        }).map(publicUser_)
      : [];
    perfMark_(perf, user.role === "admin" ? "read users" : "skip users");
    const fasihSummary = summarizeFasihRows_(fasihRows);
    perfMark_(perf, "summarize fasih");

    const data = {
      pml: allPml,
      petugas: allPetugas,
      tasks: allTasks,
      reports: allReports,
      fasih: fasihRows,
      fasihSummary: fasihSummary,
      fasihContract: fasihContractRows,
      fasihContractSummary: summarizeFasihContractRows_(fasihContractRows),
      anomali: anomaliRows,
      users: allUsers
    };

    if (includePrelist) {
      data.prelist = prelist;
    }

    return data;
  }

  const fasihSummary = summarizeFasihRows_(fasihRows);
  perfMark_(perf, "summarize fasih");

  const data = {
    pml: allPml,
    petugas: allPetugas,
    tasks: allTasks,
    reports: allReports,
    fasih: fasihRows,
    fasihSummary: fasihSummary,
    fasihContract: fasihContractRows,
    fasihContractSummary: summarizeFasihContractRows_(fasihContractRows),
    anomali: anomaliRows,
    users: []
  };

  if (includePrelist) {
    data.prelist = prelist;
  }

  return data;
}

function softDelete_(user, sheetName, idColumn, id) {
  if (!id) {
    throw new Error("ID tidak valid.");
  }

  return withLock_(function () {
    updateById_(sheetName, idColumn, id, {
      active: "FALSE",
      updated_at: now_()
    });

    logAudit_(user.user_id, "delete", sheetName, id, "");

    return ok_({
      data: buildDataForUser_(user, { includePrelist: false })
    });
  });
}

function requireUser_(token) {
  if (!token) {
    throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
  }

  const cached = CacheService.getScriptCache().get(sessionKey_(token));
  let cachedUser = null;

  if (cached) {
    cachedUser = JSON.parse(cached);
  } else {
    const propStr = PropertiesService.getScriptProperties().getProperty(sessionKey_(token));
    if (!propStr) {
      throw new Error("Sesi sudah kedaluwarsa. Silakan login ulang.");
    }
    const propData = JSON.parse(propStr);
    if (Date.now() > propData.expires) {
      PropertiesService.getScriptProperties().deleteProperty(sessionKey_(token));
      throw new Error("Sesi sudah kedaluwarsa. Silakan login ulang.");
    }
    cachedUser = propData.user;
  }

  const freshUser = readRows_("users").find(function (row) {
    return row.user_id === cachedUser.user_id && isActive_(row.active);
  });

  if (!freshUser) {
    throw new Error("Akun sudah tidak aktif.");
  }

  const publicUser = publicUser_(freshUser);

  CacheService
    .getScriptCache()
    .put(sessionKey_(token), JSON.stringify(publicUser), CACHE_TTL_SECONDS);

  PropertiesService
    .getScriptProperties()
    .setProperty(sessionKey_(token), JSON.stringify({
      user: publicUser,
      expires: Date.now() + SESSION_TTL_MILLISECONDS
    }));

  return publicUser;
}

function requireRole_(user, roles) {
  if (roles.indexOf(user.role) === -1) {
    throw new Error("Akses ditolak.");
  }

  return user;
}

function assertCanAccessPml_(user, pmlId) {
  if (user.role === "admin") {
    return;
  }

  if (!user.pml_id || user.pml_id !== pmlId) {
    throw new Error("Akses PML tidak sesuai dengan akun login.");
  }
}

function readAllocationRows_(sheet) {
  if (sheet.getLastRow() <= 1) {
    return [];
  }

  const values = getSheetValues_(sheet);
  const headers = values[0].map(normalizeHeader_);
  const carry = {
    pcl: "",
    petugas_id: "",
    pml: "",
    pml_id: "",
    pic: "",
    korwil: ""
  };

  function pick(row, names) {
    for (let index = 0; index < names.length; index++) {
      const columnIndex = headers.indexOf(names[index]);

      if (columnIndex !== -1) {
        return cleanText_(row[columnIndex]);
      }
    }

    return "";
  }

  return values.slice(1).map(function (row) {
    const record = {
      idsubsls: cleanAllocationId_(pick(row, ["idsubsls", "id_subsls", "id_sls"])),
      kecamatan: pick(row, ["nmkec", "kecamatan"]),
      desa: pick(row, ["nmdesa", "desa", "desa_kelurahan"]),
      sls: pick(row, ["nmsls", "sls", "nama_sls"]),
      keluarga: toNumber_(pick(row, ["kk", "keluarga"])),
      umk: toNumber_(pick(row, ["umk"])),
      um: toNumber_(pick(row, ["um"])),
      ub: toNumber_(pick(row, ["ub", "usaha_besar"])),
      usaha_legacy: toNumber_(pick(row, ["usaha", "usaha_non_pertanian"])),
      utp: toNumber_(pick(row, ["utp", "usaha_pertanian"])),
      petugas: pick(row, ["pcl", "petugas"]),
      petugas_id: pick(row, ["petugas_id", "pcl_id", "ppl_id"]),
      pml: pick(row, ["pml"]),
      pml_id: pick(row, ["pml_id"]),
      pic: pick(row, ["pic"]),
      korwil: pick(row, ["korwil", "koordinator_wilayah"])
    };

    record.usaha = record.umk + record.um + record.ub;

    if (!record.usaha && record.usaha_legacy) {
      record.usaha = record.usaha_legacy;
    }

    record.muatan_total = record.keluarga + record.usaha + record.utp;
    record.target = record.muatan_total;

    ["petugas", "petugas_id", "pml", "pml_id", "pic", "korwil"].forEach(function (key) {
      const carryKey = key === "petugas" ? "pcl" : key;

      if (record[key]) {
        carry[carryKey] = record[key];
      } else {
        record[key] = carry[carryKey];
      }
    });

    return record;
  }).filter(function (row) {
    return /^\d{16}$/.test(row.idsubsls)
      && row.kecamatan
      && row.desa
      && row.sls;
  });
}

function validateAllocationEntityIds_(allocationRows) {
  const pmlById = indexActiveRowsById_("pml", "pml_id");
  const petugasById = indexActiveRowsById_("petugas", "petugas_id");
  const missingPml = {};
  const missingPetugas = {};
  const mismatchedPetugas = {};

  allocationRows.forEach(function (row) {
    if (!pmlById[row.pml_id]) {
      missingPml[row.pml_id] = row.pml || row.pml_id;
    }

    if (!petugasById[row.petugas_id]) {
      missingPetugas[row.petugas_id] = row.petugas || row.petugas_id;
      return;
    }

    if (petugasById[row.petugas_id].pml_id !== row.pml_id) {
      mismatchedPetugas[row.petugas_id] = row.petugas + " -> " + row.pml_id;
    }
  });

  if (allocationRows.some(function (row) {
    return getOrganicAllocationTarget_(row) > 0;
  })) {
    if (!pmlById[ORGANIC_PML_ID]) {
      missingPml[ORGANIC_PML_ID] = "PML Organik";
    }

    if (!petugasById[ORGANIC_PETUGAS_ID]) {
      missingPetugas[ORGANIC_PETUGAS_ID] = "PPL Organik";
    } else if (petugasById[ORGANIC_PETUGAS_ID].pml_id !== ORGANIC_PML_ID) {
      mismatchedPetugas[ORGANIC_PETUGAS_ID] = "PPL Organik -> " + ORGANIC_PML_ID;
    }
  }

  const messages = [];

  if (Object.keys(missingPml).length) {
    messages.push("PML ID belum ada/aktif: " + formatMapForError_(missingPml));
  }

  if (Object.keys(missingPetugas).length) {
    messages.push("Petugas ID belum ada/aktif: " + formatMapForError_(missingPetugas));
  }

  if (Object.keys(mismatchedPetugas).length) {
    messages.push("Petugas tidak berada di bawah PML sesuai alokasi: " + formatMapForError_(mismatchedPetugas));
  }

  if (messages.length) {
    throw new Error(messages.join(" | "));
  }

  return true;
}

function indexActiveRowsById_(sheetName, idColumn) {
  const byId = {};

  readRows_(sheetName).forEach(function (row) {
    const id = cleanText_(row[idColumn]);

    if (id && isActive_(row.active)) {
      byId[id] = row;
    }
  });

  return byId;
}

function formatMapForError_(map) {
  return Object.keys(map).map(function (id) {
    return id + " (" + map[id] + ")";
  }).join(", ");
}

function isOrganicAllocationRecord_(record) {
  return record.petugas_id === ORGANIC_PETUGAS_ID || record.pml_id === ORGANIC_PML_ID;
}

function getOrganicAllocationTarget_(record) {
  if (isOrganicAllocationRecord_(record)) {
    return toNumber_(record && record.muatan_total);
  }

  return 0;
}

function syncAllocationTasks_(allocationRows) {
  const sheet = getSheet_("assign_tasks");
  const headers = getHeaders_(sheet);
  const existingRows = readRows_("assign_tasks");
  const regularByIdsubsls = {};
  const byTaskId = {};
  const activeOrganicIds = {};
  let created = 0;
  let updated = 0;
  let organicCreated = 0;
  let organicUpdated = 0;
  let organicDeactivated = 0;

  existingRows.forEach(function (row, index) {
    const taskId = cleanText_(row.task_id);

    if (taskId) {
      byTaskId[taskId] = index;
    }

    if (row.idsubsls && taskId.indexOf(ORGANIC_TASK_SUFFIX) === -1) {
      regularByIdsubsls[String(row.idsubsls)] = index;
    }
  });

  allocationRows.forEach(function (record) {
    const existingIndex = regularByIdsubsls[record.idsubsls];

    if (isOrganicAllocationRecord_(record)) {
      if (existingIndex !== undefined && isActive_(existingRows[existingIndex].active)) {
        existingRows[existingIndex].active = "FALSE";
        existingRows[existingIndex].updated_at = now_();
        updated++;
      }
    } else {
      const existing = existingIndex === undefined ? null : existingRows[existingIndex];
      const row = Object.assign({}, existing || {}, {
        task_id: existing && existing.task_id ? existing.task_id : "TASK-" + record.idsubsls,
        idsubsls: record.idsubsls,
        kecamatan: record.kecamatan,
        desa: record.desa,
        sls: record.sls,
        petugas_id: record.petugas_id,
        pml_id: record.pml_id,
        pic: record.pic,
        korwil: record.korwil,
        keluarga: record.keluarga,
        usaha: record.usaha,
        utp: record.utp,
        muatan_total: record.muatan_total,
        target: record.target,
        completed: existing && existing.completed ? existing.completed : "FALSE",
        active: "TRUE",
        created_at: existing && existing.created_at ? existing.created_at : now_(),
        updated_at: now_()
      });

      if (existing) {
        existingRows[existingIndex] = row;
        updated++;
      } else {
        existingRows.push(row);
        regularByIdsubsls[record.idsubsls] = existingRows.length - 1;
        byTaskId[row.task_id] = existingRows.length - 1;
        created++;
      }
    }

    const organicTarget = getOrganicAllocationTarget_(record);

    if (organicTarget > 0) {
      activeOrganicIds[record.idsubsls] = true;
      const organicTaskId = "TASK-" + record.idsubsls + ORGANIC_TASK_SUFFIX;
      const organicExistingIndex = byTaskId[organicTaskId];
      const organicExisting = organicExistingIndex === undefined ? null : existingRows[organicExistingIndex];
      const organicRow = Object.assign({}, organicExisting || {}, {
        task_id: organicTaskId,
        idsubsls: record.idsubsls,
        kecamatan: record.kecamatan,
        desa: record.desa,
        sls: record.sls,
        petugas_id: ORGANIC_PETUGAS_ID,
        pml_id: ORGANIC_PML_ID,
        pic: record.pic,
        korwil: record.korwil,
        keluarga: 0,
        usaha: organicTarget,
        utp: 0,
        muatan_total: organicTarget,
        target: organicTarget,
        completed: organicExisting && organicExisting.completed ? organicExisting.completed : "FALSE",
        active: "TRUE",
        created_at: organicExisting && organicExisting.created_at ? organicExisting.created_at : now_(),
        updated_at: now_()
      });

      if (organicExisting) {
        existingRows[organicExistingIndex] = organicRow;
        organicUpdated++;
      } else {
        existingRows.push(organicRow);
        byTaskId[organicTaskId] = existingRows.length - 1;
        organicCreated++;
      }
    }
  });

  existingRows.forEach(function (row) {
    const taskId = cleanText_(row.task_id);

    if (taskId.indexOf(ORGANIC_TASK_SUFFIX) === -1) {
      return;
    }

    if (!activeOrganicIds[row.idsubsls] && isActive_(row.active)) {
      row.active = "FALSE";
      row.updated_at = now_();
      organicDeactivated++;
    }
  });

  writeRows_(sheet, headers, existingRows);

  return {
    created: created,
    updated: updated,
    organicCreated: organicCreated,
    organicUpdated: organicUpdated,
    organicDeactivated: organicDeactivated
  };
}

function writeRows_(sheet, headers, rows) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (!rows.length) {
    return;
  }

  sheet
    .getRange(2, 1, rows.length, headers.length)
    .setValues(rows.map(function (row) {
      return headers.map(function (header) {
        return row[header] === undefined || row[header] === null ? "" : row[header];
      });
    }));
}

function appendRows_(sheet, headers, rows) {
  if (!rows.length) {
    return;
  }

  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length)
    .setValues(rows.map(function (row) {
      return headers.map(function (header) {
        return row[header] === undefined || row[header] === null ? "" : row[header];
      });
    }));
}

function allocationPetugasKey_(name, pmlId) {
  const normalizedName = normalizeNameKey_(name);

  return normalizedName ? normalizedName + "|" + cleanText_(pmlId) : "";
}

function shouldUseAllocationEntity_(current, candidate, generatedPrefix) {
  if (!candidate || !isActive_(candidate.active)) {
    return false;
  }

  if (!current || !isActive_(current.active)) {
    return true;
  }

  return isGeneratedAllocationEntity_(current, generatedPrefix)
    && !isGeneratedAllocationEntity_(candidate, generatedPrefix);
}

function isGeneratedAllocationEntity_(row, prefix) {
  const id = cleanText_(row && (row.petugas_id || row.pml_id));

  return id.indexOf(prefix) === 0;
}

function cleanAllocationId_(value) {
  if (typeof value === "number") {
    return value.toFixed(0);
  }

  return cleanText_(value).replace(/[^0-9]/g, "");
}

function normalizeNameKey_(value) {
  return cleanText_(value).toLowerCase().replace(/\s+/g, " ");
}

function slugId_(value) {
  return normalizeNameKey_(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function requireActiveEntity_(sheetName, idColumn, id, label) {
  const row = readRows_(sheetName).find(function (item) {
    return item[idColumn] === id && isActive_(item.active);
  });

  if (!row) {
    throw new Error(label + " tidak ditemukan atau sudah tidak aktif.");
  }

  return row;
}

function ensureInitialized_() {
  const spreadsheet = getSpreadsheet_();

  Object.keys(SHEET_HEADERS).forEach(function (sheetName) {
    ensureSheet_(spreadsheet, sheetName, SHEET_HEADERS[sheetName]);
  });
}

function ensureDefaultAdmin_() {
  const existingUsers = readRows_("users");

  if (existingUsers.length > 0) {
    return false;
  }

  appendObject_("users", {
    user_id: Utilities.getUuid(),
    nama: "Administrator",
    username: DEFAULT_ADMIN_USERNAME,
    password_hash: hashPassword_(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD),
    role: "admin",
    pml_id: "",
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  });

  return true;
}

function ensureSheet_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const currentHeaders = sheet
      .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length))
      .getValues()[0]
      .filter(function (header) {
        return header;
      });
    const mergedHeaders = currentHeaders.slice();

    headers.forEach(function (header) {
      if (mergedHeaders.indexOf(header) === -1) {
        mergedHeaders.push(header);
      }
    });

    sheet.getRange(1, 1, 1, mergedHeaders.length).setValues([mergedHeaders]);
  }

  sheet.setFrozenRows(1);
  return sheet;
}

function appendObject_(sheetName, object) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const row = headers.map(function (header) {
    return object[header] === undefined || object[header] === null
      ? ""
      : object[header];
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

function updateById_(sheetName, idColumn, id, updates) {
  const sheet = getSheet_(sheetName);
  const values = getSheetValues_(sheet);
  const headers = values[0];
  const idIndex = headers.indexOf(idColumn);

  if (idIndex === -1) {
    throw new Error("Kolom ID tidak ditemukan: " + idColumn);
  }

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    if (values[rowIndex][idIndex] === id) {
      Object.keys(updates).forEach(function (key) {
        const columnIndex = headers.indexOf(key);

        if (columnIndex !== -1) {
          sheet.getRange(rowIndex + 1, columnIndex + 1).setValue(updates[key]);
        }
      });

      return;
    }
  }

  throw new Error("Data tidak ditemukan.");
}

function readRows_(sheetName) {
  const sheet = getSheet_(sheetName);

  if (sheet.getLastRow() <= 1) {
    return [];
  }

  const values = getSheetValues_(sheet);
  const headers = values[0];

  return values.slice(1).map(function (row) {
    const object = {};

    headers.forEach(function (header, index) {
      object[header] = row[index];
    });

    return object;
  });
}

function readRowsIfExists_(sheetName) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const values = getSheetValues_(sheet);
  const headers = values[0];

  return values.slice(1).map(function (row) {
    const object = {};

    headers.forEach(function (header, index) {
      object[header] = row[index];
    });

    return object;
  });
}

function readPrelistRows_() {
  const sheet = getSheet_("prelist_sls");

  if (sheet.getLastRow() <= 1) {
    return [];
  }

  const values = getSheetValues_(sheet);
  const headers = values[0].map(function (header) {
    return normalizeHeader_(header);
  });
  const knownHeaders = SHEET_HEADERS.prelist_sls;
  const usesKnownHeaders = headers[0] === "idsubsls"
    && knownHeaders.every(function (header) {
      return headers.indexOf(header) !== -1;
    });

  return values.slice(1).map(function (row) {
    const item = {};

    knownHeaders.forEach(function (header, index) {
      const columnIndex = usesKnownHeaders ? headers.indexOf(header) : index;
      item[header] = row[columnIndex] === undefined ? "" : row[columnIndex];
    });

    if (!item.level_geografis) {
      item.level_geografis = getPrelistGeographicLevel_(item);
    }

    item.is_prioritas = item.level_geografis === "sls" ? "TRUE" : "FALSE";

    return item;
  }).filter(function (row) {
    return row.idsubsls
      || row.kecamatan
      || row.desa
      || row.nama_sls
      || toNumber_(row.total_usaha_final) > 0;
  });
}

function getPrelistGeographicLevel_(row) {
  if (cleanText_(row.nama_sls)) {
    return "sls";
  }

  if (cleanText_(row.desa)) {
    return "desa";
  }

  if (cleanText_(row.kecamatan)) {
    return "kecamatan";
  }

  return "unidentified";
}

function toNumber_(value) {
  const number = Number(value);
  return isFinite(number) ? number : 0;
}

function normalizeHeader_(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getSheetValues_(sheet) {
  return sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()
    .map(function (row) {
      return row.map(normalizeCell_);
    });
}

function normalizeCell_(value) {
  if (value instanceof Date) {
    const hasTime = value.getHours() || value.getMinutes() || value.getSeconds();
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone() || "Asia/Jakarta",
      hasTime ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd"
    );
  }

  return value === null || value === undefined ? "" : value;
}

function getSheet_(sheetName) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Sheet belum dibuat: " + sheetName + ". Jalankan setupApp() dulu.");
  }

  return sheet;
}

function getHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty("SPREADSHEET_ID");

  if (spreadsheetId) {
    if (spreadsheetCache_ && spreadsheetCache_.id === spreadsheetId) {
      return spreadsheetCache_.spreadsheet;
    }

    spreadsheetCache_ = {
      id: spreadsheetId,
      spreadsheet: SpreadsheetApp.openById(spreadsheetId)
    };
    return spreadsheetCache_.spreadsheet;
  }

  if (spreadsheetCache_ && spreadsheetCache_.id === "active") {
    return spreadsheetCache_.spreadsheet;
  }

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet) {
    spreadsheetCache_ = {
      id: "active",
      spreadsheet: activeSpreadsheet
    };
    return spreadsheetCache_.spreadsheet;
  }

  throw new Error("Spreadsheet belum terhubung. Bind script ke Spreadsheet atau jalankan setSpreadsheetId('ID_SPREADSHEET').");
}

function startPerf_(label) {
  if (!PERF_LOG_ENABLED) {
    return null;
  }

  return {
    label: label,
    start: Date.now(),
    last: Date.now(),
    steps: []
  };
}

function perfMark_(perf, step) {
  if (!perf) {
    return;
  }

  const now = Date.now();
  perf.steps.push({
    step: step,
    deltaMs: now - perf.last,
    totalMs: now - perf.start
  });
  perf.last = now;
}

function finishPerf_(perf, status) {
  if (!perf) {
    return;
  }

  perfMark_(perf, "finish:" + status);
  console.log(JSON.stringify({
    type: "perf",
    label: perf.label,
    totalMs: Date.now() - perf.start,
    steps: perf.steps
  }));
}

function logAudit_(userId, action, entity, entityId, details) {
  appendObject_("audit_logs", {
    log_id: Utilities.getUuid(),
    user_id: userId,
    action: action,
    entity: entity,
    entity_id: entityId,
    details: details,
    created_at: now_()
  });
}

function publicUser_(user) {
  return {
    user_id: user.user_id,
    nama: user.nama,
    username: user.username,
    role: user.role,
    pml_id: user.pml_id
  };
}

function required_(value, label) {
  const text = cleanText_(value);

  if (!text) {
    throw new Error(label + " wajib diisi.");
  }

  return text;
}

function cleanText_(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function normalizeUsername_(value) {
  return cleanText_(value).toLowerCase();
}

function toNonNegativeNumber_(value, label) {
  const number = Number(value);

  if (!isFinite(number) || number < 0) {
    throw new Error(label + " harus berupa angka 0 atau lebih.");
  }

  return number;
}

function isActive_(value) {
  return String(value).toUpperCase() !== "FALSE";
}

function hashPassword_(username, password) {
  const source = normalizeUsername_(username) + ":" + String(password) + ":" + getPepper_();
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    source,
    Utilities.Charset.UTF_8
  );

  return digest.map(function (byte) {
    const value = byte < 0 ? byte + 256 : byte;

    return ("0" + value.toString(16)).slice(-2);
  }).join("");
}

function getPepper_() {
  const properties = PropertiesService.getScriptProperties();
  let pepper = properties.getProperty("AUTH_PEPPER");

  if (!pepper) {
    pepper = Utilities.getUuid();
    properties.setProperty("AUTH_PEPPER", pepper);
  }

  return pepper;
}

function sessionKey_(token) {
  return "session:" + token;
}

function now_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "Asia/Jakarta",
    "yyyy-MM-dd HH:mm:ss"
  );
}

function dateStamp_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "Asia/Jakarta",
    "yyyy-MM-dd"
  );
}

function ok_(payload) {
  return Object.assign({ ok: true }, payload || {});
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}
