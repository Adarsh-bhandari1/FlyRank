import { useCallback, useEffect, useRef, useState } from "react";
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
import { Plus, Save, Trash2, Play, Download, Upload } from "lucide-react";
import DecisionNode from "./DecisionNode";
import { YesEdge, NoEdge } from "./CustomEdges";
import NodeConfigPanel from "../panels/NodeConfigPanel";
import ExecutionLogPanel from "../panels/ExecutionLogPanel";
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
    activeNodeId,
    isExecuting,
    clearExecutionState,
    setExecuting,
    addLog,
    setActiveNode,
  } = useWorkflowStore();

  const hasInitialized = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const fileInputRef = useRef(null);

  // Load workflow on mount
  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  // Sync initial load ONLY once
  useEffect(() => {
    if (!hasInitialized.current && storeNodes.length > 0) {
      setNodes(storeNodes);
      setEdges(storeEdges);
      hasInitialized.current = true;
    }
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  // Auto-scroll execution logs to bottom
  useEffect(() => {
    if (isExecuting) {
      const timer = setTimeout(() => {
        const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExecuting, useWorkflowStore.getState().executionLogs.length]);

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
    (_, node) => !isExecuting && selectNode(node.id),
    [selectNode, isExecuting],
  );

  const onPaneClick = useCallback(() => {
    if (!isExecuting) clearSelection();
  }, [clearSelection, isExecuting]);

  const handleAddNode = () => {
    if (isExecuting) return;
    const newNode = storeAddNode({ x: 100, y: 100 });
    setNodes((nds) => [...nds, newNode]);
    selectNode(newNode.id);
  };

  const handleDeleteSelected = () => {
    if (isExecuting) return;
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
    alert(" Workflow saved to localStorage!");
  };

  const handleRunWorkflow = async () => {
    if (nodes.length === 0) {
      alert(" Add at least one node before running.");
      return;
    }
    clearExecutionState();
    setExecuting(true);

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
      
      // Simulate execution steps for demo (replace with real polling later)
      simulateExecution();
    } catch (err) {
      console.error(err);
      setExecuting(false);
      alert("Error starting workflow. Is Inngest dev server running?");
    }
  };

  // Demo simulation - REMOVE THIS when connecting to real Inngest
  const simulateExecution = () => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step > nodes.length + 1) {
        clearInterval(interval);
        setExecuting(false);
        addLog({ 
          type: "END", 
          message: "Workflow execution completed", 
          timestamp: new Date().toISOString() 
        });
        return;
      }
      
      const currentNode = nodes[step - 1];
      if (currentNode) {
        setActiveNode(currentNode.id);
        addLog({
          nodeId: currentNode.id,
          label: currentNode.data.label,
          prompt: currentNode.data.prompt,
          decision: Math.random() > 0.5 ? "YES" : "NO",
          timestamp: new Date().toISOString(),
        });
      }
    }, 1500);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { nodes: importedNodes, edges: importedEdges } = JSON.parse(event.target.result);
        setNodes(importedNodes);
        setEdges(importedEdges);
        useWorkflowStore.setState({ nodes: importedNodes, edges: importedEdges });
        alert(" Workflow imported successfully!");
      } catch {
        alert(" Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  // Dynamic node styling for active state
  const getNodeClassName = useCallback(
    (node) =>
      node.id === activeNodeId
        ? "ring-4 ring-purple-400 ring-offset-2 scale-105 transition-all duration-300 z-10"
        : "",
    [activeNodeId],
  );

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b bg-white flex items-center px-4 gap-2 shrink-0">
          <Button onClick={handleAddNode} size="sm" disabled={isExecuting}>
            <Plus className="w-4 h-4 mr-1" /> Add Node
          </Button>
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
            disabled={isExecuting}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          <Button
            onClick={handleRunWorkflow}
            size="sm"
            disabled={isExecuting}
            className={`${
              isExecuting 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            <Play className="w-4 h-4 mr-1" /> 
            {isExecuting ? "Running..." : "Run Workflow"}
          </Button>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span><Upload className="w-4 h-4 mr-1" /> Import</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
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
            nodeClassName={getNodeClassName}
            fitView
            className="bg-gray-50"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
          
          {/* Execution Overlay */}
          {isExecuting && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-200 shadow-sm text-sm text-purple-700 font-medium animate-pulse">
              Executing workflow...
            </div>
          )}
        </div>
      </div>

      {/* Side Panel - Conditional Rendering */}
      {isExecuting ? (
        <ExecutionLogPanel />
      ) : (
        <NodeConfigPanel />
      )}
    </div>
  );
}