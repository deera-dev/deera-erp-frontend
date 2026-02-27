// src/lib/rawbt.ts

/**
 * Download file .txt agar bisa dibuka via RawBT
 */
export function sendToRawBT(tspl: string, filename = "print.txt") {
  const blob = new Blob([tspl], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Optional: Open via Android intent (lebih advanced)
 * Bisa dipakai kalau nanti mau auto-open RawBT
 */
export function openRawBTIntent(tspl: string) {
  const encoded = encodeURIComponent(tspl);

  // RawBT custom scheme (kadang support, tergantung versi)
  const intentUrl = `intent:${encoded}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;

  window.location.href = intentUrl;
}
