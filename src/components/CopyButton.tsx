import { useState, useCallback } from "react";
export const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-3 bg-gray-500 text-gray-300 rounded-lg border border-gray-700 hover:text-white hover:border-gray-600 transition-colors"
    >
      {copied ? "copied!" : "Copy Code"}
    </button>
  );
};
