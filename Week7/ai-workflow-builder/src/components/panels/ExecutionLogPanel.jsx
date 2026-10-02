import { ScrollArea } from "@/components/ui/scroll-area"; // You may need to add this shadcn component
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Clock, CheckCircle, AlertCircle } from "lucide-react";
import useWorkflowStore from "@/store/useWorkflowStore";

export default function ExecutionLogPanel() {
  const { executionLogs, isExecuting, activeNodeId } = useWorkflowStore();

  return (
    <Card className="w-80 h-full border-l-2 border-purple-500 rounded-none flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600" />
          <CardTitle className="text-base">Execution Log</CardTitle>
          {isExecuting && (
            <Badge
              variant="secondary"
              className="animate-pulse bg-purple-100 text-purple-700"
            >
              Running...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[calc(100vh-100px)] px-4 pb-4">
          {executionLogs.length === 0 ? (
            <p className="text-sm text-gray-400 italic mt-4">
              No execution logs yet. Click Run Workflow to start.
            </p>
          ) : (
            <div className="space-y-3 mt-2">
              {executionLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-3 rounded-lg border ${
                    log.type === "END"
                      ? "bg-gray-50 border-gray-200"
                      : log.nodeId === activeNodeId
                        ? "bg-purple-50 border-purple-200"
                        : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">
                      {log.label || log.message}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.prompt && (
                    <p className="text-gray-500 truncate">{log.prompt}</p>
                  )}
                  {log.decision && (
                    <Badge
                      variant={
                        log.decision === "YES" ? "default" : "destructive"
                      }
                      className="mt-2 text-[10px]"
                    >
                      {log.decision === "YES" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {log.decision}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
