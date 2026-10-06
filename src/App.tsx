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
  return code.trim();
};

const extractTitle =(prompt:string):string =>{
  const words = prompt.split(/\s+/).slice(0,6).join(' ');
  return words.length>50 ?words.slice(0, 50)+'...':words;
};

type MobileView = 'create' | 'preview' | 'saved';

export const App = () => {
  const[apiKey, setApikey]=useState(()=>localStorage.getItem('openai_api_key')?? '');
  useEffect(()=>{ localStorage.setItem('openai_api_key', apiKey); },[apiKey]);
  const[generationState, setGenerationState]=useState<GenerationState>({status:'idle'});
  const[galleryState, setGalleryState]=useState<GalleryState>({status:'idle'});
  const [isSaving, setIsSaving]=useState(false);
  // phones show one panel at a time; desktop shows all three
  const [mobileView, setMobileView]=useState<MobileView>('create');
  const show = (view: MobileView) => (mobileView === view ? 'contents' : 'hidden md:contents');
  
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

   const handleGenerate = useCallback(async (prompt: string) => {
    setMobileView('preview');
    if (!apiKey) {
      setGenerationState({ status: 'error', message: 'Add your OpenAI API key first.' });
      return;
    }
    setGenerationState({ status: 'loading' });
    try {
      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Return only the code for a single React function component named Component. React hooks (useState, useEffect, useRef, useMemo, useCallback) are available as globals, so do not import anything. No exports, no explanations, no markdown code fences. Use only Tailwind CSS classes for styling. Make interactive elements (toggles, tabs, inputs) actually work with state. Make the layout responsive. Use realistic placeholder content.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      const raw = response.choices[0]?.message?.content ?? '';
      const code = cleanGenerateCode(raw);
      if (!code) {
        setGenerationState({ status: 'error', message: 'No code was generated. Try a different prompt.' });
        return;
      }
      setGenerationState({ status: 'success', code, prompt });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setGenerationState({ status: 'error', message });
    }
  }, [apiKey]);

 const handleSave = useCallback(async () => {
    if (generationState.status !== 'success') return;
    if (!isFirebaseConfigured()) return;
    setIsSaving(true);
    try {
      const title = extractTitle(generationState.prompt);
      await saveComponent(generationState.prompt, generationState.code, title);
      await fetchGallery();
    } catch (err) {
      alert(`Failed to save: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsSaving(false);
    }
  }, [generationState, fetchGallery]);

  return (
    <div className="flex flex-col md:flex-row h-dvh bg-gray-950 text-white overflow-hidden">
      <div className={show('create')}>
        <Sidebar
          onGenerate={handleGenerate}
          isLoading={generationState.status==='loading'}
          apiKey={apiKey}
          onApiKeyChange={setApikey}
        />
      </div>
      <div className={show('preview')}>
        <PreviewPanel
              state={generationState}
              onSave={handleSave}
              isSaving={isSaving}
        />
      </div>
      {isFirebaseConfigured() && (
        <div className={show('saved')}>
          <VarientSidebar
            state={galleryState}
            onRefresh={fetchGallery}
            onSelect={(c)=>{
              setGenerationState({status:'success', code:c.code, prompt:c.prompt});
              setMobileView('preview');
            }}
          />
        </div>
      )}
      <nav className="md:hidden shrink-0 flex border-t border-gray-800 bg-gray-900">
        {(['create', 'preview', ...(isFirebaseConfigured() ? ['saved'] : [])] as MobileView[]).map((view)=>(
          <button
            key={view}
            onClick={()=>setMobileView(view)}
            className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
              mobileView===view ? 'text-violet-400' : 'text-gray-500'
            }`}
          >
            {view}
          </button>
        ))}
      </nav>
    </div>
  );
};
