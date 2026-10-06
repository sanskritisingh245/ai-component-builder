import { useState, useCallback } from "react";
export const CopyButton = ({
  code,
  className = "text-xs font-medium px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:text-white hover:border-gray-600 transition-colors",
}: {
  code: string;
  className?: string;
}) => {
  const [label, setLabel] = useState("Copy");

  // navigator.clipboard is undefined on plain-http origins (e.g. testing on a phone via LAN IP)
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setLabel("Copied!");
    } catch {
      setLabel("Failed");
    }
    setTimeout(() => setLabel("Copy"), 2000);
  }, [code]);
  return (
    <button onClick={handleCopy} className={className}>
      {label}
    </button>
  );
};
