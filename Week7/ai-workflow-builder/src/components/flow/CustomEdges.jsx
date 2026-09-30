import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";

export function YesEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} className="stroke-green-500 stroke-2" />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-300"
        >
          YES
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export function NoEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} className="stroke-red-500 stroke-2" />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-300"
        >
          NO
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
