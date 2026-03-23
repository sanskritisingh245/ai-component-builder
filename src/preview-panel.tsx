import { useState, useCallback, useMemo, Children } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { PreviewPanelProps } from './type';


export const buildSrcdoc = (jsxCode:string):string => `
    <!DOCTYPE html>
    <html >
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <style>
            body{margin:0; padding:16px font-family: system-ui, -apple-system, sans-serif; background:white;}
            .error-display { color: #ef4444; padding:16px; font-family: monospace; font-size:14px; white-space: pre-wrap;}
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="text/label">
            try{
                const component=() =>(
                    ${jsxCode}
                );
                ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(component));
            }catch(err){
                document.getElementById('root')?.innerHTML='<div class="error-display"> Render error: ' + err.message + '</div>'
            }
        <\/script>
        <script>
            window.onerror = function(msg){
                document.getElementById('root')?.innerHTML ='<div class="error-display">Error: '+ msg + '</div>';
            };
        <\/script>
    </body>
    </html> 
`;

export const PreviewPanel=({state, onSave, isSaving}:PreviewPanelProps)=>{
    const[activeTab , setActiveTab] = useState<'preview' |'code'>('preview')
    return(
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 ">
                <div className="flec items-center gap-3">
                    <div className="flex gap-1">
                        <TabButton active={activeTab ==='preview'} onClick={()=> setActiveTab('preview')}>
                            Preview
                        </TabButton>
                        <TabButton active={activeTab ==='code'} onClick={()=> setActiveTab('code')}>
                            code
                        </TabButton>
                    </div>
                    {state.status ==='success' && (
                        <span className="text-xs text-gray-500 border-l border-gray-700 pl-3">
                            Live Render
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {state.status ==='success' && (
                        <>
                        <CopyButton code={state.code}/>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transtions:colors"
                            >
                                {isSaving ? 'Saving...' :'save'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-950/50 p-6 overflow-auto">
                {state.status==='idle' && <IdlePlaceholder/>}
                {state.status ==='loading' && <LoadingState/>}
                {state.status==='error' && <ErrorState message={state.message}/>}
                {state.status === 'success' && (
                    activeTab==='preview'? (
                        <WebPreview code={state.code}/>
                    ):(
                        <CodeBlock code={state.code}/>
                    )
                )}
            </div>
        </div>
    );
};

const IdlePlaceholder=() =>(
    <div className='text-center'>
        <svg className='w-16 h-16 mx-auto mb-4 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24 ' >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className='tetx-sm text-gray-500'>Describe a component to see a live preview </p>
        <p className='text-xs text-gray-600'>Your generated UI will appear here </p>
    </div>
);

const LoadingState=()=>(
    <div className='flex flex-col items-center gap-4'>
        <div className='w-10 h-10 border-2 order-violet-500 border-t-transparent rounded-full animate-spin'>
            <div className='text-center'>
                <p className='text-sm text-gray-300'>Generating component....</p>
                <p className='text-xs text-gray-500 mt-1'>This usually takes a few seconds</p>
            </div>
        </div>
    </div>
);

const ErrorState =({message}: {message:string})=>(
    <div className='text-center max-w-sm'>
        <div className='w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center'>
            <svg className='w-5 h-5 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24 '  >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12'/>
            </svg>
        </div>
        <p className='text-sm text-red-400'>{message}</p>
        <p className='text-xs text-gray-500 mt-2'> Try a different prompt to check your API key  </p>
    </div>
);

const WebPreview = ({code}:{code:string}) =>{
    const srcdoc=useMemo(()=> buildSrcdoc(code),[code]);
    return (
        <div>
            <iframe
                srcDoc={srcdoc}
                sandbox='allow-scripts'
                title='Component Preview '
                className='w-full h-full border-0'
            />
        </div>
    );
};

const CodeBlock =({code}: {code:string})=>(
    <div className='w-full max-w-2xl max-h-full overflow-auto rounded-xl border border-gray-800'>
        <Highlight theme={themes.nightOwl} code={code} language='jsx'>
            {({style, tokens, getLineProps, getTokenProps})=>(
                <pre style={{...style , margin:0 , padding:'16px' , fontSize: '13px'}}>
                    {tokens.map((line,i)=>(
                        <div key={i} {...getLineProps({line})}>
                            <span className='inline-block w-8 text-right mr-4 text-gray-600 select-none'>
                                    {i+1}
                            </span>
                            {line.map((token,key)=>(
                                <span key={key} {...getTokenProps({token})}></span>
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    </div>
)


const CopyButton = ({code}:{code:string})=>{
    const [copied , setCopied] = useState(false);

    const handleCopy= useCallback(async ()=>{
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(()=> setCopied(false), 2000)
    },[code]);
    return (
        <button
            onClick={handleCopy}
            className='text-xs px-3 py-3 bg-gray-500 text-gray-300 rounded-lg border border-gray-700 hover:text-white hover:border-gray-600 transition-colors'
        >
            {copied ? 'copied!' : 'Copy Code'}
        </button>
    );
};

const TabButton = ({
    active,
    onClick,
    Children,
}: {
    active:boolean,
    onClick: ()=> void;
    Children:React.ReactNode;
}) => (
    <button
        onClick={onClick}
        className={`px-3 , py-1.5 , text-xs , font-medium, rounded-lg , transition-colors ${
            active
                ?'bg-gray-800 text-white'
                :'text-gray-500 hover:text-gray-300'
        }`}
    >
        {Children}
    </button>
);