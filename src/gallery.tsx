import { useMemo } from 'react';
import type {GalleryGridProps, ComponentDocument} from './type';
import { buildSrcdoc } from './preview-panel';
import { CopyButton } from './components/CopyButton';

export const VarientSidebar =({state, onRefresh, onSelect}:GalleryGridProps)=>{
    return(
        <aside className='w-full md:w-52 flex-1 md:flex-none min-h-0 overflow-y-auto bg-gray-900 md:border-l border-gray-800 flex flex-col md:h-full'>
            <div className='px-4 md:px-3 py-3 border-b border-gray-800 flex items-center justify-between'>
                <span className='text-xs font-semibold text-gray-300'>Saved variants</span>
                <button
                    onClick={onRefresh}
                    disabled={state.status==='loading'}
                    className='text-xs text-gray-500 hover:text-white disabled:opacity-50 transition-colors'
                >
                Refresh
                </button>
            </div>
            <div className='md:flex-1 md:overflow-y-auto p-3 md:p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 content-start'>
                {state.status==='idle' || state.status==='loading'?(
                    Array.from({length:3}).map((_,i)=>(
                       <div key={i} className="aspect-3/4 bg-gray-800 rounded-lg animate-pulse" />
                    ))
                ):state.status==='error'?(
                    <div className='col-span-full text-center py-4'>
                        <p className='text-xs text-red-400 wrap-break-word'>{state.message}</p>
                        <button
                            onClick={onRefresh}
                            className='mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors'
                        >
                            Retry
                        </button>
                    </div>
                ):state.components.length ===0?(
                    <div className='col-span-full text-center py-6'>
                        <p className='text-xs text-gray-500'>No saved variants</p>
                        <p className='text-xs text-gray-600 mt-1'>Generate and save a component</p>
                    </div>
                ):(
                    state.components.map((component)=>(
                        <VarientCard key={component.id} component={component} onSelect={onSelect}/>
                    ))
                )}
            </div>
        </aside>
    );
};

const VarientCard=({component, onSelect}:{component:ComponentDocument; onSelect:(c:ComponentDocument)=>void}) =>{
    const srcdoc= useMemo(()=> buildSrcdoc(component.code), [component.code]);

    return(
        <div className='rounded-lg border border-gray-800 overflow-hidden hover:border-violet-500/60 transition-colors'>
            <button
                onClick={()=>onSelect(component)}
                title={`Open "${component.title}"`}
                className='relative block w-full aspect-3/4 overflow-hidden bg-white'
            >
                <div
                    className='absolute inset-0 origin-top-left'
                    style={{transform: 'scale(0.25)' , width:'400%', height:'400%' }}
                >
                    <iframe
                        srcDoc={srcdoc}
                        sandbox='allow-scripts'
                        loading='lazy'
                        title={component.title}
                        className='w-full h-full border-0 pointer-events-none'
                        tabIndex={-1}
                    />
                </div>
            </button>
            <div className='flex items-center gap-1 px-2 py-1.5 bg-gray-900'>
                <p className='flex-1 min-w-0 text-xs text-gray-400 truncate'>{component.title}</p>
                <CopyButton code={component.code} className='shrink-0 text-xs text-gray-500 hover:text-white transition-colors'/>
            </div>
        </div>
    );
};
