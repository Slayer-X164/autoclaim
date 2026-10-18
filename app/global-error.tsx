"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-4 text-center">
          <h2 className="text-2xl font-bold text-red-600">A critical error occurred!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We are working to fix this issue.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
