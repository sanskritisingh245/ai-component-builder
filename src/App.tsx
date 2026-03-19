// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
//import './App.css'

import { useState } from "react";
import { VarientSidebar } from "./gallery";
import { PreviewPanel } from "./preview-panel";
import { Sidebar } from "./prompt-input";
import { type GalleryState, type GenerationState } from "./type";

// src/App.tsx
// purpose: main app shell (placeholder for now)

export const App = () => {
  const[apikey, setApikey]=useState(()=>localStorage.getItem('openai_api_key')?? '');
  const[generationState]=useState<GenerationState>({status:'idle'});
  const[galleryState]=useState<GalleryState>({status:'idle'});

  const handleGenerate=(prompt:string)=>{
    console.log('Generate:', prompt);
  };
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
        <Sidebar
          onGenerate={handleGenerate}
          isLoading={generationState.status==='loading'}
          apiKey={apikey}
          onApiKeySave={setApikey}
        />
        <PreviewPanel/>
        <VarientSidebar/>
    </div>
  );
};
