"use client"
export default function PrimaryBtn({text, onClick, isLoading}: {text: string, onClick: () => void, isLoading?: boolean}) {
  return (
    <button 
      disabled={isLoading}
      className="w-full flex items-center justify-center drop-shadow-[1px_10px_20px_rgba(10,10,10,0.3)] cursor-pointer py-2 sm:py-3 bg-black text-white rounded-[7px] text-[14px] sm:text-[16px] disabled:opacity-70 disabled:cursor-not-allowed transition-opacity" 
      onClick={onClick}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {text}
    </button>
  )
}