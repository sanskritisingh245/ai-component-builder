import { useState } from "react";
import { isFirebaseConfigured } from "./firebase";
import type { PreviewPanelProps } from "./type";
import { WebPreview } from "./components/WebPreview";
import { CopyButton } from "./components/CopyButton";
import { CodeBlock } from "./components/CodeBlock";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";
import { IdlePlaceholder } from "./components/IdlePlaceholder";

// Raw JSX (older saves) gets wrapped; otherwise render `Component`, or the last component the code declares.
const toScript = (code: string): string => {
  const names = [...code.matchAll(/(?:function|const|let|var|class)\s+([A-Z]\w*)/g)]
    .map((m) => m[1])
    .filter((n) => n !== n.toUpperCase());
  const name = /^\s*</.test(code) ? undefined : names.includes("Component") ? "Component" : names.at(-1);
  const render = (n: string) => `ReactDOM.createRoot(document.getElementById('root')).render(<${n} />);`;
  return name ? `${code}\n${render(name)}` : `const Component = () => (\n${code}\n);\n${render("Component")}`;
};

export const buildSrcdoc = (code: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; background: white; }
    .error-display { color: #ef4444; padding: 16px; font-family: monospace; font-size: 14px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.onerror = function(msg) {
      document.getElementById('root').innerHTML = '<div class="error-display"></div>';
      document.querySelector('.error-display').textContent = 'Error: ' + msg;
    };
  </script>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useReducer } = React;
    {
      ${toScript(code)}
    }
  </script>
</body>
</html>`;

export const PreviewPanel = ({
  state,
  onSave,
  isSaving,
}: PreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const tabClass = (tab: "preview" | "code") =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
      activeTab === tab ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
    }`;
  return (
    <main id="preview" className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex items-center justify-between gap-2 px-3 md:px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => setActiveTab("preview")} className={tabClass("preview")}>
              Preview
            </button>
            <button onClick={() => setActiveTab("code")} className={tabClass("code")}>
              Code
            </button>
          </div>
          {state.status === "success" && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border-l border-gray-700 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live render
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.status === "success" && (
            <>
              <CopyButton code={state.code} />
              {isFirebaseConfigured() && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="text-xs font-medium px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center p-3 md:p-6 overflow-auto">
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
    </main>
  );
};
