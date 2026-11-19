#!/usr/bin/env bash
# PM Edu — VPS ga birinchi o'rnatish (Ubuntu 22.04 / 24.04, root huquqi bilan)
# Foydalanish:  sudo bash deploy/setup.sh pmedu.uz admin@pmedu.uz "Ism Familiya"
set -euo pipefail
DOMAIN="${1:?Domen kiriting, masalan: pmedu.uz}"
EMAIL="${2:?Admin email kiriting}"
NAME="${3:-Administrator}"
APP=/opt/pmedu
SRC="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Paketlar o'rnatilmoqda"
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx ufw curl ca-certificates
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  apt-get install -y nodejs || true
fi
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  echo "==> Node.js 22 (NodeSource) o'rnatilmoqda"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node --version

echo "==> Foydalanuvchi va fayllar"
id pmedu >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin pmedu
mkdir -p "$APP/data"
cp -r "$SRC/server.js" "$SRC/shared" "$SRC/public" "$APP/"
[ -f "$APP/.env" ] || cp "$SRC/.env.example" "$APP/.env"
chown -R root:root "$APP"; chown -R pmedu:pmedu "$APP/data"; chmod 700 "$APP/data"; chmod 640 "$APP/.env"; chgrp pmedu "$APP/.env"

echo "==> Administrator hisobi"
runuser -u pmedu -- bash -c "cd $APP && node server.js create-admin '$EMAIL' '$NAME'" || echo "(Admin allaqachon mavjud bo'lishi mumkin)"

echo "==> systemd xizmati"
cp "$SRC/deploy/pmedu.service" /etc/systemd/system/pmedu.service
systemctl daemon-reload
systemctl enable --now pmedu
sleep 2; systemctl --no-pager status pmedu | head -5

echo "==> nginx"
sed "s/DOMAIN/$DOMAIN/g" "$SRC/deploy/nginx-pmedu.conf" > /etc/nginx/sites-available/pmedu
ln -sf /etc/nginx/sites-available/pmedu /etc/nginx/sites-enabled/pmedu
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Xavfsizlik devori"
ufw allow OpenSSH; ufw allow 'Nginx Full'; ufw --force enable

echo "==> HTTPS sertifikat (Let's Encrypt)"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || echo "!! Sertifikat olinmadi: domen DNS yozuvi VPS IP manziliga yo'naltirilganini tekshiring va qayta ishga tushiring: certbot --nginx -d $DOMAIN"

echo
echo "Tayyor! Sayt: https://$DOMAIN"
echo "Yuqorida chiqqan vaqtinchalik admin parolini saqlang va birinchi kirishda o'zgartiring."
