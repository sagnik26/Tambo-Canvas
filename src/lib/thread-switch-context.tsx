"use client";

import * as React from "react";

interface ThreadSwitchContextValue {
  loadingThreadId: string | null;
  setLoadingThreadId: (id: string | null) => void;
}

const ThreadSwitchContext =
  React.createContext<ThreadSwitchContextValue | null>(null);

export function ThreadSwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loadingThreadId, setLoadingThreadId] = React.useState<string | null>(
    null,
  );
  const value = React.useMemo(
    () => ({ loadingThreadId, setLoadingThreadId }),
    [loadingThreadId],
  );
  return (
    <ThreadSwitchContext.Provider value={value}>
      {children}
    </ThreadSwitchContext.Provider>
  );
}

export function useThreadSwitch() {
  const ctx = React.useContext(ThreadSwitchContext);
  return ctx ?? { loadingThreadId: null, setLoadingThreadId: () => {} };
}
