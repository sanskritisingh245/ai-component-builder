// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
//import './App.css'

import { useCallback, useState } from "react";
//import { VarientSidebar } from "./gallery";
import { PreviewPanel } from "./preview-panel";
import { Sidebar } from "./prompt-input";
import { type GalleryState, type GenerationState } from "./type";
import OpenAI from "openai";

const cleanGenerateCode=(raw:string):string =>{
  let code=raw.trim();
  code=code.replace(/^```(?:jsx|tsx|javascript|typescript)?\s*\n?/i, '');
  code=code.replace(/\n?```\s*$/i, '');
  code = code.replace(/^import\s+.*;\s*\n?/gm, '');
  code = code.replace(/^export\s+(default\s+)?/gm, '');

  const fnMatch = code.match(/(?:function|const)\s+\w+\s*(?:=\s*)?(?:\([^)]*\)\s*(?:=>)?\s*)?[({]\s*\n?\s*return\s*\(\s*\n?([\s\S]*?)\n?\s*\)\s*;?\s*\n?\s*[})]\s*;?\s*$/);
  if (fnMatch?.[1]) {
    code = fnMatch[1].trim();
  }
  return code.trim();

};

const extractTitle =(prompt:string):string =>{
  const words = prompt.split(/\s+/).slice(0,6).join(' ');
  return words.length>50 ?words.slice(0, 50)+'...':words;
};

export const App = () => {
  const[apikey, setApikey]=useState(()=>localStorage.getItem('openai_api_key')?? '');
  const[generationState, setGenerationState]=useState<GenerationState>({status:'idle'});
  const[galleryState]=useState<GalleryState>({status:'idle'});
  const [isSaving]=useState(false);
  
  const handleGenerate = useCallback(async(prompt:string)=>{
    if(!apikey) return;
    setGenerationState({status:'loading'});
    try{
      const openai= new OpenAI({
        apiKey:apikey,
       dangerouslyAllowBrowser: true,
      });

      const response= await openai.chat.completions.create({
        model:'gpt-4o',
        messages:[
          {
            role:'system',
            content:
              'Return only JSX for a single React component. No imports, no exports, no function wrapper, no explanations , no markdown code fences. Use only Tailwind CSS for styling. The JSX should be a single root element. Use  realistic placeholder content'
          },
          {role:'user', content:prompt}
        ],
        temperature:0.7,
        max_tokens:2000,
      });
      const raw = response.choices[0]?.message?.content ?? '';
      const code=cleanGenerateCode(raw);

      if(!code){
        setGenerationState({status:'error', message:'No code was generated. Try a different prompt.'})
        return;
      }
      setGenerationState({status:'success', code, prompt});
    }catch(err){
      console.error("FULL ERROR:", err);
      const message= err instanceof Error? err.message:'Generation failed ';
      setGenerationState({status:'error', message})
    }
  },[apikey]);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
        <Sidebar
          onGenerate={handleGenerate}
          isLoading={generationState.status==='loading'}
          apiKey={apikey}
          onApiKeySave={setApikey}
        />
        <PreviewPanel
              state={generationState}
              onSave={()=>console.log('save-coming in class-5')}
              isSaving={false}
        />
        {/* <div className="flex-1 flex items-center justify-center p-8">
          {generationState.status==='idle' &&(
            <p className="text-gray-500">Describe a component to genrate code </p>
          )}

          {generationState.status==='loading' &&(
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
              <p className="text-sm text-gray-400 ">Generating....</p>
            </div>
          )}

          {generationState.status==='error' &&(
            <p className="text-red-400">{generationState.message}</p>
          )}

          {generationState.status==='success' &&(
            <div className="max-w-2xl w-full">
              <p className="text-sm text-gray-400 mb-2">Generate code</p>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm tetx-green-400 overflow-auto max-h-96">
                {generationState.code}
              </pre>
            </div>
          )}
        </div> */}
        <aside className="w-52 bg-gray-900 border-l border-gray-800 flex items-center justify-center">
          <p className="tetx-xs text-gray-500">Gallery class</p>
        </aside>
    </div>
  );
};
