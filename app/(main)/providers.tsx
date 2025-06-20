"use client";

import { createContext, ReactNode, useState } from "react";

export const Context = createContext<{
  streamPromise?: Promise<ReadableStream>;
  setStreamPromise: (v: Promise<ReadableStream> | undefined) => void;
}>({
  streamPromise: undefined,
  setStreamPromise: () => {},
});

export default function Providers({ children }: { children: ReactNode }) {
  const [streamPromise, setStreamPromise] = useState<Promise<ReadableStream>>();

  return (
    <Context.Provider value={{ streamPromise, setStreamPromise }}>
      {children}
    </Context.Provider>
  );
}
