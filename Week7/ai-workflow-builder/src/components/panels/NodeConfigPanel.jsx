import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useWorkflowStore from "@/store/useWorkflowStore";

export default function NodeConfigPanel() {
  const { selectedNode, nodes, updateNode, clearSelection } =
    useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNode);

  if (!node) return null;

  return (
    <Card className="w-80 h-full border-l-2 border-blue-500 rounded-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Configure Node</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="node-label">Node Label</Label>
          <Input
            id="node-label"
            value={node.data.label}
            onChange={(e) => updateNode(node.id, { label: e.target.value })}
            placeholder="e.g., Is this urgent?"
          />
        </div>
        <div>
          <Label htmlFor="node-prompt">AI Prompt</Label>
          <Textarea
            id="node-prompt"
            value={node.data.prompt}
            onChange={(e) => updateNode(node.id, { prompt: e.target.value })}
            placeholder="Enter the question for the AI to answer..."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            The AI will respond with YES or NO based on this prompt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
