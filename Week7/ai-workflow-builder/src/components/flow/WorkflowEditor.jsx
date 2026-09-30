import { useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import DecisionNode from "./DecisionNode";
import { YesEdge, NoEdge } from "./CustomEdges";
import NodeConfigPanel from "../panels/NodeConfigPanel";
import useWorkflowStore from "@/store/useWorkflowStore";

const nodeTypes = {
  decision: DecisionNode,
};

const edgeTypes = {
  yes: YesEdge,
  no: NoEdge,
};

export default function WorkflowEditor() {
  const {
    nodes,
    edges,
    addNode,
    addEdge: storeAddEdge,
    removeNode,
    removeEdge,
    selectNode,
    clearSelection,
    saveWorkflow,
    loadWorkflow,
  } = useWorkflowStore();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // Sync store with React Flow
  useEffect(() => {
    setRfNodes(nodes);
  }, [nodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(edges);
  }, [edges, setRfEdges]);

  // Load saved workflow on mount
  useEffect(() => {
    loadWorkflow();
  }, []);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: params.sourceHandle === "yes" ? "yes" : "no",
      };
      storeAddEdge(edge);
    },
    [storeAddEdge],
  );

  const onNodeClick = useCallback(
    (_, node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleAddNode = () => {
    const newNode = addNode({ x: 100, y: 100 });
    selectNode(newNode.id);
  };

  const handleDeleteSelected = () => {
    const { selectedNode } = useWorkflowStore.getState();
    if (selectedNode) {
      removeNode(selectedNode);
      clearSelection();
    }
  };

  const handleSave = () => {
    saveWorkflow();
    alert("Workflow saved!");
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b bg-white flex items-center px-4 gap-2">
          <Button onClick={handleAddNode} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Node
          </Button>
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Selected
          </Button>
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Workflow
          </Button>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Side Panel */}
      <NodeConfigPanel />
    </div>
  );
}
