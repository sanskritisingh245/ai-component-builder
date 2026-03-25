export const LoadingState = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-10 h-10 border-2 order-violet-500 border-t-transparent rounded-full animate-spin">
    </div>
    <div className="text-center">
        <p className="text-sm text-gray-300">Generating component....</p>
        <p className="text-xs text-gray-500 mt-1">
          This usually takes a few seconds
        </p>
      </div>
  </div>
);