"use client";

import { useEffect, useState } from "react";

// 24h HH:MM clock in studio local time (IST). Renders blank until mounted to avoid hydration mismatch.
export default function LiveClock({ className }: { className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{time}</span>;
}
