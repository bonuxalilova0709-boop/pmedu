#!/usr/bin/env bash
# PM Edu — yangi versiyani o'rnatish (ma'lumotlar saqlanadi)
# Foydalanish: sudo bash deploy/update.sh
set -euo pipefail
APP=/opt/pmedu
SRC="$(cd "$(dirname "$0")/.." && pwd)"
runuser -u pmedu -- bash -c "cd $APP && node server.js backup"
cp -r "$SRC/server.js" "$SRC/shared" "$SRC/public" "$APP/"
chown -R root:root "$APP/server.js" "$APP/shared" "$APP/public"
systemctl restart pmedu
sleep 2; systemctl --no-pager status pmedu | head -5
echo "Yangilandi."
