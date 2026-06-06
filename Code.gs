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
    "active",
    "created_at",
    "updated_at"
  ],
  assign_tasks: [
    "task_id",
    "kecamatan",
    "desa",
    "sls",
    "petugas_id",
    "pml_id",
    "mulai",
    "selesai",
    "target",
    "active",
    "created_at",
    "updated_at"
  ],
  daily_reports: [
    "report_id",
    "task_id",
    "tanggal",
    "muatan_harian",
    "catatan",
    "created_by",
    "active",
    "created_at",
    "updated_at"
  ],
  audit_logs: [
    "log_id",
    "user_id",
    "action",
    "entity",
    "entity_id",
    "details",
    "created_at"
  ]
};

const CACHE_TTL_SECONDS = 21600;
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin2026";

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Monitoring Petugas SE2026 KKA")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
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

function login(credentials) {
  const username = normalizeUsername_(credentials && credentials.username);
  const password = String((credentials && credentials.password) || "");

  if (!username || !password) {
    throw new Error("Username dan password wajib diisi.");
  }

  ensureInitialized_();
  ensureDefaultAdmin_();

  const user = readRows_("users").find(function (row) {
    return normalizeUsername_(row.username) === username && isActive_(row.active);
  });

  if (!user || user.password_hash !== hashPassword_(username, password)) {
    throw new Error("Username atau password salah.");
  }

  const token = Utilities.getUuid();
  const publicUser = publicUser_(user);

  CacheService
    .getScriptCache()
    .put(sessionKey_(token), JSON.stringify(publicUser), CACHE_TTL_SECONDS);

  logAudit_(publicUser.user_id, "login", "users", publicUser.user_id, "");

  return ok_({
    token: token,
    user: publicUser,
    ttl: CACHE_TTL_SECONDS,
    data: buildDataForUser_(publicUser)
  });
}

function logout(token) {
  if (token) {
    CacheService.getScriptCache().remove(sessionKey_(token));
  }

  return ok_();
}

function getBootstrapData(token) {
  const user = requireUser_(token);

  return ok_({
    user: user,
    data: buildDataForUser_(user)
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
      data: buildDataForUser_(user)
    });
  });
}

function createPetugas(token, payload) {
  const user = requireUser_(token);
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
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("petugas", row);
    logAudit_(user.user_id, "create", "petugas", row.petugas_id, namaPetugas);

    return ok_({
      item: row,
      data: buildDataForUser_(user)
    });
  });
}

function createTask(token, payload) {
  const user = requireUser_(token);
  const petugasId = required_(payload && payload.petugas_id, "Petugas");
  const petugas = requireActiveEntity_("petugas", "petugas_id", petugasId, "Petugas");
  const pmlId = user.role === "admin"
    ? cleanText_(payload && payload.pml_id) || petugas.pml_id
    : user.pml_id;

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
    active: "TRUE",
    created_at: now_(),
    updated_at: now_()
  };

  return withLock_(function () {
    appendObject_("assign_tasks", row);
    logAudit_(user.user_id, "create", "assign_tasks", row.task_id, row.sls);

    return ok_({
      item: row,
      data: buildDataForUser_(user)
    });
  });
}

function createDailyReport(token, payload) {
  const user = requireUser_(token);
  const taskId = required_(payload && payload.task_id, "Wilayah kerja");
  const task = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");

  assertCanAccessPml_(user, task.pml_id);

  const row = {
    report_id: Utilities.getUuid(),
    task_id: taskId,
    tanggal: required_(payload && payload.tanggal, "Tanggal monitoring"),
    muatan_harian: toNonNegativeNumber_(payload && payload.muatan_harian, "Muatan harian"),
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
      data: buildDataForUser_(user)
    });
  });
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

  if (["admin", "pml"].indexOf(role) === -1) {
    throw new Error("Role hanya boleh admin atau pml.");
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
      data: buildDataForUser_(actor)
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
  const user = requireUser_(token);
  const petugas = requireActiveEntity_("petugas", "petugas_id", petugasId, "Petugas");
  assertCanAccessPml_(user, petugas.pml_id);

  return softDelete_(user, "petugas", "petugas_id", petugasId);
}

function deleteTask(token, taskId) {
  const user = requireUser_(token);
  const task = requireActiveEntity_("assign_tasks", "task_id", taskId, "Wilayah kerja");
  assertCanAccessPml_(user, task.pml_id);

  return softDelete_(user, "assign_tasks", "task_id", taskId);
}

function deleteDailyReport(token, reportId) {
  const user = requireUser_(token);
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

function buildDataForUser_(user) {
  const allPml = readRows_("pml").filter(function (row) {
    return isActive_(row.active);
  });
  const allPetugas = readRows_("petugas").filter(function (row) {
    return isActive_(row.active);
  });
  const allTasks = readRows_("assign_tasks").filter(function (row) {
    return isActive_(row.active);
  });
  const allReports = readRows_("daily_reports").filter(function (row) {
    return isActive_(row.active);
  });
  const allUsers = readRows_("users").filter(function (row) {
    return isActive_(row.active);
  }).map(publicUser_);

  if (user.role === "admin") {
    return {
      pml: allPml,
      petugas: allPetugas,
      tasks: allTasks,
      reports: allReports,
      users: allUsers
    };
  }

  const petugasIds = {};
  const taskIds = {};
  const visiblePetugas = allPetugas.filter(function (row) {
    const visible = row.pml_id === user.pml_id;
    if (visible) {
      petugasIds[row.petugas_id] = true;
    }
    return visible;
  });
  const visibleTasks = allTasks.filter(function (row) {
    const visible = row.pml_id === user.pml_id;
    if (visible) {
      taskIds[row.task_id] = true;
    }
    return visible;
  });

  return {
    pml: allPml.filter(function (row) {
      return row.pml_id === user.pml_id;
    }),
    petugas: visiblePetugas,
    tasks: visibleTasks,
    reports: allReports.filter(function (row) {
      return Boolean(taskIds[row.task_id]);
    }),
    users: []
  };
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
      data: buildDataForUser_(user)
    });
  });
}

function requireUser_(token) {
  if (!token) {
    throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
  }

  const cached = CacheService.getScriptCache().get(sessionKey_(token));

  if (!cached) {
    throw new Error("Sesi sudah kedaluwarsa. Silakan login ulang.");
  }

  const cachedUser = JSON.parse(cached);
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
    sheet.appendRow(headers);
  } else {
    const currentHeaders = sheet
      .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length))
      .getDisplayValues()[0]
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
}

function appendObject_(sheetName, object) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const row = headers.map(function (header) {
    return object[header] === undefined || object[header] === null
      ? ""
      : object[header];
  });

  sheet.appendRow(row);
}

function updateById_(sheetName, idColumn, id, updates) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
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

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0];

  return values.slice(1).map(function (row) {
    const object = {};

    headers.forEach(function (header, index) {
      object[header] = row[index];
    });

    return object;
  });
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
    .getDisplayValues()[0];
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty("SPREADSHEET_ID");

  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  throw new Error("Spreadsheet belum terhubung. Bind script ke Spreadsheet atau jalankan setSpreadsheetId('ID_SPREADSHEET').");
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
