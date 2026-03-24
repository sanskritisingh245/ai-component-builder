import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured, saveComponent, listComponents } from './firebase';
import { VarientSidebar } from "./gallery";
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
  const[galleryState, setGalleryState]=useState<GalleryState>({status:'idle'});
  const [isSaving, setIsSaving]=useState(false);
  
  const fetchGallery = useCallback(async()=>{
    if(!isFirebaseConfigured()) return;
    setGalleryState({status:'loading'});
    try{
      const components= await listComponents();
      setGalleryState({status:'success', components});
    }catch(err){
      const message=err instanceof Error? err.message:'Failed to load gallery';
      setGalleryState({status:'error', message})
    }
  },[])
  useEffect(()=>{
    fetchGallery();
  },[fetchGallery]);

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

  const handleSave = useCallback(async ()=>{
    if(generationState.status==='success')return;
    if(!isFirebaseConfigured()) return;
    setIsSaving(true);
    try{
      const title = extractTitle(generationState.prompt);
      await saveComponent(generationState.prompt , generationState.code, title);
      await fetchGallery();
    }catch(err){
      console.error('failed to save component',err);
    }finally{
      setIsSaving(false);
    }
  },[generationState, fetchGallery])

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
              onSave={handleSave}
              isSaving={false}
        />
        <VarientSidebar state={galleryState} onRefresh={fetchGallery}/>
    </div>
  );
};
