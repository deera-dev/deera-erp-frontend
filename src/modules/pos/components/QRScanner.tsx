/* eslint-disable @typescript-eslint/no-explicit-any */
import { Html5Qrcode } from "html5-qrcode";
import { useRef } from "react";

interface Props {
  onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  const beep = () => {
    const audio = new Audio("/beep.mp3");
    audio.play().catch(() => {});
  };

  const vibrate = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(150);
    }
  };

  const applyAutoFocus = async (qr: Html5Qrcode) => {
    try {
      await (qr as any).applyVideoConstraints({
        advanced: [{ focusMode: "continuous" }],
      });
    } catch {
      console.log("Autofocus not supported");
    }
  };

  const startScan = async () => {
    if (isScanningRef.current) return;

    const qr = new Html5Qrcode("qr-reader");
    qrRef.current = qr;
    isScanningRef.current = true;

    try {
      await qr.start(
        {
          facingMode: "environment",
        },
        {
          fps: 15,
          qrbox: { width: 1000, height: 1000 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          beep();
          vibrate();
          onScan(decodedText);
          await stopScan();
        },
        () => {},
      );

      setTimeout(() => applyAutoFocus(qr), 1000);
    } catch (err) {
      console.error("Scanner error:", err);
      isScanningRef.current = false;
    }
  };

  const stopScan = async () => {
    if (!qrRef.current || !isScanningRef.current) return;

    try {
      await qrRef.current.stop();
      await qrRef.current.clear();
    } catch (err) {
      console.warn("Stop scanner error:", err);
    }

    qrRef.current = null;
    isScanningRef.current = false;
  };

  return (
    <div className="space-y-3">
      <div
        id="qr-reader"
        className="w-full max-w-sm overflow-hidden rounded-lg shadow"
      />
      <button
        onClick={startScan}
        className="px-4 py-2 text-white bg-black rounded active:scale-95"
      >
        Scan Barang
      </button>
    </div>
  );
}
