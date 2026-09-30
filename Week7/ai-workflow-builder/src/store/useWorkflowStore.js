import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  // Add a new decision node
  addNode: (position) => {
    const newNode = {
      id: uuidv4(),
      type: "decision",
      position,
      data: {
        label: `Decision ${get().nodes.length + 1}`,
        prompt: "",
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
    return newNode;
  },

  // Update node data
  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    }));
  },

  // Add edge between nodes
  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, { ...edge, id: uuidv4() }],
    }));
  },

  // Remove node and its edges
  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    }));
  },

  // Remove edge
  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    }));
  },

  // Select node for editing
  selectNode: (id) => {
    set({ selectedNode: id });
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedNode: null });
  },

  // Load workflow from localStorage
  loadWorkflow: () => {
    const saved = localStorage.getItem("workflow");
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      set({ nodes, edges });
    }
  },

  // Save workflow to localStorage
  saveWorkflow: () => {
    const { nodes, edges } = get();
    localStorage.setItem("workflow", JSON.stringify({ nodes, edges }));
  },
}));

export default useWorkflowStore;
