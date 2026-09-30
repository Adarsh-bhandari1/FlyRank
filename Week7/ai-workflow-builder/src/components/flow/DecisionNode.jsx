import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

export default function DecisionNode({ data }) {
  return (
    <div className="w-64">
      <Card className="border-2 border-blue-500 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold">
              {data.label}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 line-clamp-3 mb-3">
            {data.prompt || "No prompt defined"}
          </p>
          <div className="flex gap-1">
            <Badge
              variant="outline"
              className="text-[10px] bg-green-50 text-green-700 border-green-200"
            >
              AI Decision
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* YES Handle - Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="yes"
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-white"
        style={{ left: "30%" }}
      />
      <div
        className="absolute text-[10px] font-bold text-green-600"
        style={{ top: "-18px", left: "25%" }}
      >
        YES
      </div>

      {/* NO Handle - Top Right */}
      <Handle
        type="source"
        position={Position.Top}
        id="no"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
        style={{ left: "70%" }}
      />
      <div
        className="absolute text-[10px] font-bold text-red-600"
        style={{ top: "-18px", left: "65%" }}
      >
        NO
      </div>

      {/* Target Handle - Bottom */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}
