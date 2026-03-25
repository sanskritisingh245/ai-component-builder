import { Highlight, themes } from "prism-react-renderer";
export const CodeBlock = ({ code }: { code: string }) => (
  <div className="w-full max-w-2xl max-h-full overflow-auto rounded-xl border border-gray-800">
    <Highlight theme={themes.nightOwl} code={code} language="jsx">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={{ ...style, margin: 0, padding: "16px", fontSize: "13px" }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="inline-block w-8 text-right mr-4 text-gray-600 select-none">
                {i + 1}
              </span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })}></span>
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  </div>
);
