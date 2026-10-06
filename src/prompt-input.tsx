import { useCallback, useState } from "react"
import type { PromptInputProps } from './type';


const EXAMPLE_PROMPTS=[
    'A dark pricing card with monthly/annual toggle',
    'A user profile card with avatar and social links',
    'A notification toast with progress bar',
    'A login form with email and password',
    'A testimonial card with star ratings',
    'A stats dashboard cards with charts'
];

interface SidebarProps extends PromptInputProps{
    apiKey:string,
    onApiKeyChange:(key:string) =>void;
}

export const  Sidebar=({
    onGenerate,
    isLoading,
    apiKey,
    onApiKeyChange,
}:SidebarProps)=>{
    const [input , setInput]=useState('');
    const[ showkey, setShowKey]=useState(false);

    //creates a form submit handler (stops page reload, ignore empty input, avoid running while loading , sends cleaned input to a function )
    const  handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>)=>{
            e.preventDefault();
            if(!input.trim()|| isLoading) return;
            onGenerate(input.trim());
        },
        [input, isLoading, onGenerate],
    );
    const handleChipClick = useCallback (
        (prompt:string)=>{
            setInput(prompt);
            if(!isLoading) onGenerate(prompt);
        },
        [isLoading , onGenerate]
    );
    return(
        <aside className="w-full md:w-72 flex-1 md:flex-none min-h-0 overflow-y-auto bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col md:h-full">

            <div className="px-4 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-linear-to-br from-violet-500 to-indigo-600 rounded-lg"/>
                    <span className="font-semibold text-white text-sm">AI Component Builder</span>
                </div>
            </div>

            <div className="px-4 py-3 border-b border-gray-800">
                <label htmlFor="api-key" className="block text-xs font-medium text-gray-400 mb-1.5">OpenAI API Key</label>
                <div className="flex gap-1.5">
                    <input
                        id="api-key"
                        type={showkey ? 'text' :'password'}
                        value={apiKey}
                        onChange={(e) =>onApiKeyChange(e.target.value.trim())}
                        placeholder="sk-..."
                        autoComplete="off"
                        className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 md:py-1.5 text-base md:text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                        type="button"
                        onClick={()=>setShowKey(!showkey)}
                        className="px-3 text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:text-white transition-colors"
                    >
                        {showkey ? 'Hide':'Show'}
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Stored locally in your browser only</p>
            </div>

            <div className="md:flex-1 md:overflow-y-auto px-4 py-4 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={input}
                        onChange={(e)=>setInput(e.target.value)}
                        placeholder="Describe a UI component..."
                        rows={4}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-base md:text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()|| isLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
                        {isLoading ? 'Generating...' : 'Generate Component'}
                    </button>
                </form>

                <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Try an example</p>
                    <div className="flex flex-wrap gap-1.5">
                        {EXAMPLE_PROMPTS.map((prompt)=>(
                            <button
                                key={prompt}
                                onClick={()=>handleChipClick(prompt)}
                                disabled={isLoading}
                                className="text-left text-xs px-3 py-1.5 text-gray-400 bg-gray-800/60 border border-gray-700/60 rounded-lg hover:border-violet-500/60 hover:text-gray-200 disabled:opacity-50 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </aside>
    )
}
