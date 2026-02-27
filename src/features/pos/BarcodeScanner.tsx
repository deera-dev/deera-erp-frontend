import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (code: string) => void;
}

export default function BarcodeScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    if (isScanning) return;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        await stopScanner();

        // 🔊 Beep
        const audio = new Audio("/beep.mp3");
        audio.play();

        // 📳 Vibrate
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }

        onScan(decodedText);
      },
      () => {},
    );

    setIsScanning(true);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full" />

      {!isScanning ? (
        <button
          onClick={startScanner}
          className="w-full py-3 font-bold text-white bg-green-600 rounded"
        >
          Start Scan
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full py-3 font-bold text-white bg-red-600 rounded"
        >
          Stop Scan
        </button>
      )}
    </div>
  );
}
