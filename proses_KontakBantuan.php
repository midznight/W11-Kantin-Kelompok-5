
<?php
// Memeriksa apakah halaman menerima data dari formulir
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Mengambil data dari formulir
    $nama = trim($_POST["nama"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $no_hp = trim($_POST["no_hp"] ?? "");
    $subject = trim($_POST["subject"] ?? "");
    $pesan = trim($_POST["pesan"] ?? "");

    // Menyiapkan tempat untuk pesan kesalahan
    $error = [];

    // Validasi nama
    if (empty($nama)) {
        $error[] = "Nama wajib diisi.";
    }

    // Validasi email
    if (empty($email)) {
        $error[] = "Email wajib diisi.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error[] = "Format email tidak valid.";
    }

    // Validasi nomor HP
    if (empty($no_hp)) {
        $error[] = "Nomor HP wajib diisi.";
    } elseif (!preg_match("/^[0-9+\s()-]{8,20}$/", $no_hp)) {
        $error[] = "Format nomor HP tidak valid.";
    }

    // Validasi subject
    if (empty($subject)) {
        $error[] = "Subject wajib diisi.";
    }

    // Validasi pesan
    if (empty($pesan)) {
        $error[] = "Pesan wajib diisi.";
    }

} else {
    // Jika file dibuka langsung tanpa mengirim formulir
    header("Location: KontakBantuan.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Hasil Pengiriman - Kantin POLIJE</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

    <main class="kb-result">

        <div class="kb-result-card">

            <?php if (empty($error)) : ?>

                <div class="kb-result-icon kb-result-success">
                    ✓
                </div>

                <h2>Pesan Berhasil Dikirim!</h2>

                <p>
                    Terima kasih, <?= htmlspecialchars($nama, ENT_QUOTES, 'UTF-8') ?>.
                    Pesan Anda berhasil diproses.
                </p>

                <p class="kb-result-note">
                    Ini merupakan simulasi pengiriman.
                    Pesan belum disimpan ke database atau dikirim ke email.
                </p>

            <?php else : ?>

                <div class="kb-result-icon kb-result-failed">
                    !
                </div>

                <h2>Pengiriman Gagal</h2>

                <p>Silakan periksa kembali data formulir Anda:</p>

                <ul class="kb-error-list">
                    <?php foreach ($error as $item) : ?>
                        <li>
                            <?= htmlspecialchars($item, ENT_QUOTES, 'UTF-8') ?>
                        </li>
                    <?php endforeach; ?>
                </ul>

            <?php endif; ?>

            <a href="KontakBantuan.html" class="kb-back-button">
                Kembali ke Halaman Kontak
            </a>

        </div>

    </main>

</body>
</html>
