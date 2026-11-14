<?php
// Anfrageformular: prüft die Eingaben, bremst Spam und schickt die Anfrage per E-Mail an den Betrieb.
// Antwort immer JSON: {"ok": true} oder {"ok": false, "fehler": "..."}.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

$konfig = require __DIR__ . '/anfrage-konfig.php';

function antwort(int $code, array $daten): never {
    http_response_code($code);
    echo json_encode($daten, JSON_UNESCAPED_UNICODE);
    exit;
}

function zeile(string $wert, int $max): string {
    // Eine Zeile: keine Zeilenumbrüche/Steuerzeichen (verhindert Header-Einschleusung), gekürzt.
    $wert = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $wert) ?? '';
    return mb_substr(trim($wert), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    antwort(405, ['ok' => false, 'fehler' => 'Nur POST.']);
}

// Nur Anfragen von der eigenen Seite
$herkunft = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($herkunft !== '' && !in_array($herkunft, $konfig['erlaubte_herkunft'], true)) {
    antwort(403, ['ok' => false, 'fehler' => 'Nicht erlaubt.']);
}

// Spam-Falle: unsichtbares Feld muss leer sein, Formular darf nicht schneller als 3 s ausgefüllt sein
$falle = (string)($_POST['webseite'] ?? '');
$start = (int)($_POST['t'] ?? 0);
$jetzt = (int)(microtime(true) * 1000);
if ($falle !== '' || $start <= 0 || $jetzt - $start < 3000 || $jetzt - $start > 86400000) {
    antwort(200, ['ok' => true]); // Bots bekommen keine Rückmeldung, dass sie aufgefallen sind
}

// Bremse: höchstens N Anfragen pro Stunde je Absender (IP nur als Hash, Datei nach 1 h veraltet)
$ordner = sys_get_temp_dir() . '/anfrage_bremse_' . md5(__DIR__);
if (!is_dir($ordner)) { @mkdir($ordner, 0700, true); }
$datei = $ordner . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . $konfig['salz']);
$zeiten = is_file($datei) ? array_filter(array_map('intval', file($datei, FILE_IGNORE_NEW_LINES) ?: []), fn($z) => $z > time() - 3600) : [];
if (count($zeiten) >= $konfig['max_pro_stunde']) {
    antwort(429, ['ok' => false, 'fehler' => 'Zu viele Anfragen. Bitte später erneut versuchen oder anrufen.']);
}

$name      = zeile((string)($_POST['name'] ?? ''), 100);
$telefon   = zeile((string)($_POST['telefon'] ?? ''), 40);
$email     = zeile((string)($_POST['email'] ?? ''), 150);
$ort       = zeile((string)($_POST['ort'] ?? ''), 80);
$leistung  = zeile((string)($_POST['leistung'] ?? ''), 80);
$nachricht = mb_substr(trim(str_replace("\r", '', (string)($_POST['nachricht'] ?? ''))), 0, 3000);

if ($name === '' || $telefon === '') {
    antwort(422, ['ok' => false, 'fehler' => 'Bitte Name und Telefon ausfüllen.']);
}
if (!preg_match('/^[0-9 +()\/.\-]{5,40}$/', $telefon)) {
    antwort(422, ['ok' => false, 'fehler' => 'Bitte eine gültige Telefonnummer angeben.']);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    antwort(422, ['ok' => false, 'fehler' => 'Bitte eine gültige E-Mail-Adresse angeben (oder Feld leer lassen).']);
}

$text = "Neue Anfrage über die Webseite\n"
      . "==============================\n\n"
      . "Name:      $name\n"
      . "Telefon:   $telefon\n"
      . "E-Mail:    " . ($email ?: '–') . "\n"
      . "Ort:       " . ($ort ?: '–') . "\n"
      . "Leistung:  " . ($leistung ?: '–') . "\n\n"
      . "Nachricht:\n" . ($nachricht ?: '–') . "\n\n"
      . "--\nGesendet am " . date('d.m.Y \u\m H:i') . " Uhr über " . $konfig['domain'] . "\n";

$betreff = 'Anfrage: ' . $name . ($leistung ? ' – ' . $leistung : '') . ($ort ? ' (' . $ort . ')' : '');
$kopf = [
    'From' => $konfig['absender_name'] . ' <' . $konfig['absender'] . '>',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
    'MIME-Version' => '1.0',
];
if ($email !== '') { $kopf['Reply-To'] = $email; }

mb_internal_encoding('UTF-8');
$gesendet = mail($konfig['empfaenger'], mb_encode_mimeheader($betreff, 'UTF-8', 'Q'), $text, $kopf, '-f' . $konfig['absender']);
if (!$gesendet) {
    antwort(500, ['ok' => false, 'fehler' => 'Senden hat nicht geklappt. Bitte anrufen oder direkt eine E-Mail schreiben.']);
}

$zeiten[] = time();
@file_put_contents($datei, implode("\n", $zeiten), LOCK_EX);
antwort(200, ['ok' => true]);
