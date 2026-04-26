import { useState } from "react";
import type { PreviewPanelProps } from "./type";
import { WebPreview } from "./components/WebPreview";
import { CopyButton } from "./components/CopyButton";
import { CodeBlock } from "./components/CodeBlock";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";
import { IdlePlaceholder } from "./components/IdlePlaceholder";

export const buildSrcdoc = (jsxCode: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; background: white; }
    .error-display { color: #ef4444; padding: 16px; font-family: monospace; font-size: 14px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      const Component = () => (
        ${jsxCode}
      );
      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="error-display">Render error: ' + err.message + '</div>';
    }
  </script>
  <script>
    window.onerror = function(msg) {
      document.getElementById('root').innerHTML = '<div class="error-display">Error: ' + msg + '</div>';
    };
  </script>
</body>
</html>`;

export const PreviewPanel = ({
  state,
  onSave,
  isSaving,
}: PreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 ">
        <div className="flec items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 , py-1.5 , text-xs , font-medium, rounded-lg , transition-colors ${
                activeTab === "preview"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 , py-1.5 , text-xs , font-medium, rounded-lg , transition-colors ${
                activeTab === "code"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              code
            </button>
          </div>
          {state.status === "success" && (
            <span className="text-xs text-gray-500 border-l border-gray-700 pl-3">
              Live Render
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.status === "success" && (
            <>
              <CopyButton code={state.code} />
              <button
                onClick={onSave}
                disabled={isSaving}
                className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transtions:colors"
              >
                {isSaving ? "Saving..." : "save"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-950/50 p-6 overflow-auto">
        {state.status === "idle" && <IdlePlaceholder />}
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} />}
        {state.status === "success" &&
          (activeTab === "preview" ? (
            <WebPreview code={state.code} />
          ) : (
            <CodeBlock code={state.code} />
          ))}
      </div>
    </div>
  );
};

