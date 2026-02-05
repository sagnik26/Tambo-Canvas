// Sample flows data
export const SAMPLE_FLOWS: Record<string, any> = {
  "ci/cd pipeline": {
    nodes: [
      {
        id: "1",
        label: "Code Commit",
        type: "input",
        position: { x: 0, y: 50 },
      },
      { id: "2", label: "Build", type: "default", position: { x: 200, y: 50 } },
      { id: "3", label: "Test", type: "default", position: { x: 400, y: 50 } },
      {
        id: "4",
        label: "Deploy to Staging",
        type: "default",
        position: { x: 600, y: 50 },
      },
      {
        id: "5",
        label: "Deploy to Production",
        type: "output",
        position: { x: 800, y: 50 },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e3-4", source: "3", target: "4" },
      { id: "e4-5", source: "4", target: "5" },
    ],
  },
  "user authentication": {
    nodes: [
      {
        id: "1",
        label: "Login Form",
        type: "input",
        position: { x: 0, y: 50 },
      },
      {
        id: "2",
        label: "Validate Credentials",
        type: "default",
        position: { x: 200, y: 50 },
      },
      {
        id: "3",
        label: "Generate JWT",
        type: "default",
        position: { x: 400, y: 50 },
      },
      {
        id: "4",
        label: "Return Token",
        type: "output",
        position: { x: 600, y: 50 },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e3-4", source: "3", target: "4" },
    ],
  },
  "kubernetes deployment": {
    nodes: [
      {
        id: "1",
        label: "Docker Build",
        type: "input",
        position: { x: 0, y: 50 },
      },
      {
        id: "2",
        label: "Push to Registry",
        type: "default",
        position: { x: 200, y: 50 },
      },
      {
        id: "3",
        label: "K8s Manifest",
        type: "default",
        position: { x: 400, y: 50 },
      },
      {
        id: "4",
        label: "Apply Deployment",
        type: "default",
        position: { x: 600, y: 50 },
      },
      {
        id: "5",
        label: "Running Pods",
        type: "output",
        position: { x: 800, y: 50 },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e3-4", source: "3", target: "4" },
      { id: "e4-5", source: "4", target: "5" },
    ],
  },
  "payment processing": {
    nodes: [
      {
        id: "1",
        label: "User Checkout",
        type: "input",
        position: { x: 0, y: 50 },
      },
      {
        id: "2",
        label: "Validate Cart",
        type: "default",
        position: { x: 200, y: 50 },
      },
      {
        id: "3",
        label: "Process Payment",
        type: "default",
        position: { x: 400, y: 50 },
      },
      {
        id: "4",
        label: "Generate Invoice",
        type: "default",
        position: { x: 600, y: 50 },
      },
      {
        id: "5",
        label: "Send Confirmation",
        type: "output",
        position: { x: 800, y: 50 },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e3-4", source: "3", target: "4" },
      { id: "e4-5", source: "4", target: "5" },
    ],
  },
};

// Enhancement suggestions
export const ENHANCEMENTS: Record<string, { nodes: any[]; edges: any[] }> = {
  add_error_handling: {
    nodes: [
      { id: "error-1", label: "Error Handler", type: "default" },
      { id: "error-2", label: "Log Error", type: "default" },
      { id: "error-3", label: "Retry", type: "default" },
    ],
    edges: [
      { id: "e-err-1", source: "error-1", target: "error-2" },
      { id: "e-err-2", source: "error-2", target: "error-3" },
    ],
  },
  add_security: {
    nodes: [
      { id: "sec-1", label: "Validate Input", type: "default" },
      { id: "sec-2", label: "Rate Limiting", type: "default" },
      { id: "sec-3", label: "Encrypt Data", type: "default" },
    ],
    edges: [
      { id: "e-sec-1", source: "sec-1", target: "sec-2" },
      { id: "e-sec-2", source: "sec-2", target: "sec-3" },
    ],
  },
  add_monitoring: {
    nodes: [
      { id: "mon-1", label: "Metrics Collection", type: "default" },
      { id: "mon-2", label: "Log Aggregation", type: "default" },
      { id: "mon-3", label: "Alerts", type: "default" },
    ],
    edges: [
      { id: "e-mon-1", source: "mon-1", target: "mon-2" },
      { id: "e-mon-2", source: "mon-2", target: "mon-3" },
    ],
  },
};
