"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

const PaymentCountdown = ({ expiryTime }: { expiryTime: string }) => {
  const expiryMs = new Date(expiryTime).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(expiryMs - Date.now());
    const interval = setInterval(() => {
      setRemaining(expiryMs - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryMs]);

  if (remaining === null) {
    return null;
  }

  if (remaining <= 0) {
    return (
      <div className="inline-flex items-center gap-2 self-start rounded-lg bg-destructive/20 px-4 py-2 text-sm font-semibold text-destructive">
        <Clock className="size-4" />
        Waktu pembayaran habis
      </div>
    );
  }

  const { hours, minutes, seconds } = formatDuration(remaining);

  return (
    <div className="inline-flex items-center gap-2 self-start rounded-lg bg-destructive/15 px-4 py-2 text-sm font-semibold text-destructive">
      <Clock className="size-4 shrink-0" />
      <span className="inline-flex items-center gap-0.5 tabular-nums">
        <NumberFlow value={hours} format={{ minimumIntegerDigits: 2 }} />
        <span>Jam</span>
        <NumberFlow value={minutes} format={{ minimumIntegerDigits: 2 }} />
        <span>Menit</span>
        <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} />
        <span>Detik</span>
      </span>
    </div>
  );
};

export default PaymentCountdown;
