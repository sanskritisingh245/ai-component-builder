export const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center max-w-sm px-4">
    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24 "
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
    <p className="text-sm text-red-400 wrap-break-word">{message}</p>
    <p className="text-xs text-gray-500 mt-2">
      Try a different prompt or check your API key
    </p>
  </div>
);
