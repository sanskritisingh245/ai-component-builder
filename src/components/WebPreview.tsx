import {  useMemo } from "react";
import { buildSrcdoc } from "../preview-panel";
export const WebPreview = ({ code }: { code: string }) => {
  console.log("check code = ", code);
  const srcdoc = useMemo(() => buildSrcdoc(code), [code]);
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-800 bg-white">
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        title="Component Preview "
        className="w-full h-full border-0"
      />
    </div>
  );
};