import { useCallback, useEffect, useRef } from "react";
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
import { Plus, Save, Trash2, Play } from "lucide-react";
import DecisionNode from "./DecisionNode";
import { YesEdge, NoEdge } from "./CustomEdges";
import NodeConfigPanel from "../panels/NodeConfigPanel";
import useWorkflowStore from "@/store/useWorkflowStore";

const nodeTypes = { decision: DecisionNode };
const edgeTypes = { yes: YesEdge, no: NoEdge };

export default function WorkflowEditor() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    addNode: storeAddNode,
    addEdge: storeAddEdge,
    removeNode: storeRemoveNode,
    selectNode,
    clearSelection,
    saveWorkflow,
    loadWorkflow,
  } = useWorkflowStore();

  const hasInitialized = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  useEffect(() => {
    if (!hasInitialized.current && storeNodes.length > 0) {
      setNodes(storeNodes);
      setEdges(storeEdges);
      hasInitialized.current = true;
    }
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: params.sourceHandle === "yes" ? "yes" : "no",
      };
      setEdges((eds) => addEdge(edge, eds));
      storeAddEdge(edge);
    },
    [setEdges, storeAddEdge],
  );

  const onNodeClick = useCallback(
    (_, node) => selectNode(node.id),
    [selectNode],
  );

  const onPaneClick = useCallback(() => clearSelection(), [clearSelection]);

  const handleAddNode = () => {
    const newNode = storeAddNode({ x: 100, y: 100 });
    setNodes((nds) => [...nds, newNode]);
    selectNode(newNode.id);
  };

  const handleDeleteSelected = () => {
    const { selectedNode } = useWorkflowStore.getState();
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode && e.target !== selectedNode,
        ),
      );
      storeRemoveNode(selectedNode);
      clearSelection();
    }
  };

  const handleSave = () => {
    useWorkflowStore.setState({ nodes, edges });
    saveWorkflow();
    alert("Workflow saved!");
  };

  const handleRunWorkflow = async () => {
    try {
      const response = await fetch("/api/inngest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "workflow/execute",
          data: { nodes, edges },
        }),
      });

      if (!response.ok) throw new Error("Failed to start workflow");
      alert(" Workflow execution started! Check Inngest dashboard.");
    } catch (err) {
      console.error(err);
      alert("Error starting workflow. Is Inngest dev server running?");
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b bg-white flex items-center px-4 gap-2">
          <Button onClick={handleAddNode} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Node
          </Button>
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
          </Button>

          <Button
            onClick={handleRunWorkflow}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white ml-2"
          >
            <Play className="w-4 h-4 mr-1" /> Run Workflow
          </Button>

          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <Save className="w-4 h-4 mr-1" /> Save Workflow
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
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
      <NodeConfigPanel />
    </div>
  );
}
