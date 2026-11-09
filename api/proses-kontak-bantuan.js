function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function getFormData(body) {
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Object.fromEntries(new URLSearchParams(body));
  return {};
}

async function readFormData(req) {
  if (req.body !== undefined) return getFormData(req.body);

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > 32 * 1024) {
      const error = new Error("Ukuran formulir terlalu besar.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  return Object.fromEntries(
    new URLSearchParams(Buffer.concat(chunks).toString("utf8"))
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  let form;
  try {
    form = await readFormData(req);
  } catch (error) {
    return res.status(error.statusCode || 400).send(
      escapeHtml(error.message || "Permintaan tidak dapat diproses.")
    );
  }

  const values = {
    nama: String(form.nama || "").trim(),
    email: String(form.email || "").trim(),
    no_hp: String(form.no_hp || "").trim(),
    subject: String(form.subject || "").trim(),
    pesan: String(form.pesan || "").trim(),
  };

  const errors = [];
  if (!values.nama) errors.push("Nama wajib diisi.");
  if (!values.email) {
    errors.push("Email wajib diisi.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.push("Format email tidak valid.");
  }
  if (!values.no_hp) {
    errors.push("Nomor HP wajib diisi.");
  } else if (!/^[0-9+\s()-]{8,20}$/.test(values.no_hp)) {
    errors.push("Format nomor HP tidak valid.");
  }
  if (!values.subject) errors.push("Subject wajib diisi.");
  if (!values.pesan) errors.push("Pesan wajib diisi.");

  let resultContent;
  if (errors.length) {
    const listItems = errors.map((error) => "<li>" + escapeHtml(error) + "</li>").join("");
    resultContent =
      '<div class="kb-result-icon kb-result-failed">!</div>' +
      "<h2>Pengiriman Gagal</h2>" +
      "<p>Silakan periksa kembali data formulir Anda:</p>" +
      '<ul class="kb-error-list">' + listItems + "</ul>";
  } else {
    resultContent =
      '<div class="kb-result-icon kb-result-success">✓</div>' +
      "<h2>Pesan Berhasil Diproses!</h2>" +
      "<p>Terima kasih, " + escapeHtml(values.nama) + ". Data formulir Anda lolos validasi.</p>" +
      '<p class="kb-result-note">Ini merupakan simulasi pengiriman. Pesan tidak disimpan ke database atau dikirim ke email.</p>';
  }

  const page = [
    "<!DOCTYPE html>",
    '<html lang="id">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>Hasil Pengiriman - Kantin POLIJE</title>",
    '  <link rel="stylesheet" href="/style.css">',
    "</head>",
    "<body>",
    '  <main class="kb-result">',
    '    <div class="kb-result-card">',
    "      " + resultContent,
    '      <a href="/KontakBantuan.html" class="kb-back-button">Kembali ke Halaman Kontak</a>',
    "    </div>",
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n");

  return res.status(errors.length ? 400 : 200).send(page);
};
