const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

/*
==================================================
ADMIN PAROLI
==================================================
Render/hostingda xavfsizroq bo‘lishi uchun
ADMIN_PASSWORD environment variable orqali
berish mumkin.

Agar berilmagan bo‘lsa:
ucservis2026
*/

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "ucservis2026";


/*
==================================================
PAPKA VA FAYLLAR
==================================================
*/

const DATA_DIR =
  path.join(__dirname, "data");

const ORDERS_FILE =
  path.join(DATA_DIR, "orders.json");

const COMPLAINTS_FILE =
  path.join(DATA_DIR, "complaints.json");


/*
==================================================
DATA PAPKASINI YARATISH
==================================================
*/

if (!fs.existsSync(DATA_DIR)) {

  fs.mkdirSync(
    DATA_DIR,
    { recursive: true }
  );

}


/*
==================================================
JSON FAYL YARATISH
==================================================
*/

function ensureFile(file, defaultValue) {

  if (!fs.existsSync(file)) {

    fs.writeFileSync(
      file,
      JSON.stringify(
        defaultValue,
        null,
        2
      )
    );

  }

}


ensureFile(
  ORDERS_FILE,
  []
);

ensureFile(
  COMPLAINTS_FILE,
  []
);


/*
==================================================
JSON O‘QISH
==================================================
*/

function readJSON(file) {

  try {

    const text =
      fs.readFileSync(
        file,
        "utf8"
      );

    return JSON.parse(text);

  }

  catch(error) {

    console.error(
      "JSON o‘qishda xato:",
      error
    );

    return [];

  }

}


/*
==================================================
JSON YOZISH
==================================================
*/

function writeJSON(
  file,
  data
) {

  fs.writeFileSync(
    file,
    JSON.stringify(
      data,
      null,
      2
    )
  );

}


/*
==================================================
MIDDLEWARE
==================================================
*/

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);


/*
==================================================
PUBLIC SAYT
==================================================
*/

app.use(
  express.static(
    path.join(
      __
