#!/usr/bin/env bash
# Lädt die Seite per FTP (TLS) zu ALL-INKL hoch – nur die Dateien der Seite, nie .git/README.
# Aufruf: ./hochladen.sh [--vorschau|--offline]   (--vorschau: für Suchmaschinen gesperrt; --offline: nur Hinweisseite, Dateien bleiben liegen)
# FTP_IP=<ip> erzwingt die Server-IP (z. B. direkt nach einem Serverumzug, solange DNS noch alt ist).
# Zugang aus ~/.config/tanneberger/zugang.json: {"ftp_host": "...", "ftp_login": "...", "ftp_passwort": "...", "domain": "..."}
set -euo pipefail
VORSCHAU=""; [ "${1:-}" = "--vorschau" ] && VORSCHAU=1
OFFLINE=""; [ "${1:-}" = "--offline" ] && OFFLINE=1
ZUGANG="${ZUGANG:-$HOME/.config/tanneberger/zugang.json}"
cd "$(dirname "$0")"
wert() { python3 -c "import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$ZUGANG" "$1"; }
HOST="$(wert ftp_host)"; DOMAIN="$(wert domain)"
ZIEL="$(mktemp -d)"; NETRC="$(mktemp)"
trap 'rm -rf "$ZIEL" "$NETRC"' EXIT
chmod 600 "$NETRC"
printf 'machine %s login %s password %s\n' "$HOST" "$(wert ftp_login)" "$(wert ftp_passwort)" > "$NETRC"

if [ -n "$OFFLINE" ]; then
  cp offline/wartung.html offline/.htaccess "$ZIEL/"
else
cp -r index.html impressum.html datenschutz.html anfrage.php anfrage-konfig.php style.css effekte.js fonts favicon.svg .htaccess "$ZIEL/"
fi
cd "$ZIEL"
# Neue Version von CSS/JS = neuer Dateiname-Zusatz, damit Handys keine alte Datei aus dem Zwischenspeicher nehmen
[ -z "$OFFLINE" ] && {
V_CSS="$(sha256sum style.css | cut -c1-8)"; V_JS="$(sha256sum effekte.js | cut -c1-8)"
sed -i "s#href=\"style.css\"#href=\"style.css?v=$V_CSS\"#; s#src=\"effekte.js\"#src=\"effekte.js?v=$V_JS\"#" index.html impressum.html datenschutz.html
}
if [ -n "$OFFLINE" ]; then
  printf 'User-agent: *\nDisallow: /\n' > robots.txt
elif [ -n "$VORSCHAU" ]; then
  printf 'User-agent: *\nDisallow: /\n' > robots.txt
else
  sed -i '/<meta name="robots" content="noindex" \/>/d' index.html impressum.html datenschutz.html
  sed -i "s#<head>#<head>\n  <link rel=\"canonical\" href=\"https://$DOMAIN/\" />#" index.html
  printf 'User-agent: *\nAllow: /\nSitemap: https://%s/sitemap.xml\n' "$DOMAIN" > robots.txt
  printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://%s/</loc></url>\n</urlset>\n' "$DOMAIN" > sitemap.xml
fi
find . -type f | sed 's#^\./##' | while read -r datei; do
  curl -sS --ssl-reqd ${FTP_IP:+--resolve "$HOST:21:$FTP_IP"} --netrc-file "$NETRC" --ftp-create-dirs -T "$datei" "ftp://$HOST/$datei"
done
echo "Hochgeladen: https://$DOMAIN/${VORSCHAU:+ (Vorschau, noindex)}${OFFLINE:+ (OFFLINE-Hinweis)}"
