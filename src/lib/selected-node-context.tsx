"use client";

import * as React from "react";

export type SelectedNode = {
  id: string;
  label: string;
  /** Node position in flow (canvas) coordinates for positioning the details panel */
  flowPosition: { x: number; y: number };
};

const SelectedNodeContext = React.createContext<{
  selectedNode: SelectedNode | null;
  setSelectedNode: (node: SelectedNode | null) => void;
}>({
  selectedNode: null,
  setSelectedNode: () => {},
});

export function useSelectedNode() {
  return React.useContext(SelectedNodeContext);
}

export function SelectedNodeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedNode, setSelectedNode] = React.useState<SelectedNode | null>(
    null
  );
  const value = React.useMemo(
    () => ({ selectedNode, setSelectedNode }),
    [selectedNode]
  );
  return (
    <SelectedNodeContext.Provider value={value}>
      {children}
    </SelectedNodeContext.Provider>
  );
}
