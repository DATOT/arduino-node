import { Node, Position, useReactFlow, XYPosition } from "@xyflow/react";
import { useCallback, useState } from "react";
import { OnDropAction, useDnD, useDnDPosition } from "../UseDnD";
import { NODE_DATA } from "../../../nodes/Nodes";
import { v4 as uuidv4 } from "uuid";
// Simple ID generator for nodes
const getId = () => uuidv4();

/* ---------- Sidebar component with dynamic groups ---------- */
export function Sidebar() {
  const { onDragStart, isDragging } = useDnD();
  const [type, setType] = useState<string | null>(null);
  const { setNodes } = useReactFlow();

  const createAddNewNode = useCallback(
    (nodeType: string): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        const nodeData = NODE_DATA.find((n) => n.type === nodeType);
        if (!nodeData) return;

        const newNode: Node = {
          id: getId(),
          type: nodeType,
          position,
          data: { label: `${nodeType} node`, ...nodeData.initialData },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => nds.concat(newNode));
        setType(null);
      };
    },
    [setNodes],
  );

  // Group nodes by groupID
  const groups = NODE_DATA.reduce<Record<string, typeof NODE_DATA>>(
    (acc, node) => {
      const group = node.groupID || "ungrouped";
      if (!acc[group]) acc[group] = [];
      acc[group].push(node);
      return acc;
    },
    {},
  );

  return (
    <>
      {isDragging && <DragGhost type={type} />}

      <aside className="h-[100vh] w-[280px] overflow-hidden border-r border-r-gray-500">
        <div className="h-full overflow-y-auto p-2">
          <div className="description">
            Drag nodes into the pane to create new nodes.
          </div>

          {/* Variables group stays special */}
          {/*<SidebarGroup title="Variables" collapsible outlineColor="#f0a">
          <VariableGroup />
        </SidebarGroup>*/}

          {/* Render other groups dynamically */}
          <div className="gap-1 flex flex-col">
            {Object.entries(groups).map(([groupID, nodes]) => {
              // Skip "variable" group if you want it special
              if (groupID === "variable") return null;

              const outlineColor = nodes[0].outlineColor || "#888";

              return (
                <SidebarGroup
                  key={groupID}
                  title={groupID}
                  collapsible
                  outlineColor={outlineColor}
                >
                  {nodes.map((node) => (
                    <SidebarNode
                      key={node.type}
                      node={node}
                      onDragStart={onDragStart}
                      createAddNewNode={createAddNewNode}
                      setType={setType}
                    />
                  ))}
                </SidebarGroup>
              );
            })}

          </div>
        </div>
      </aside>
    </>
  );
}

/* ---------- Sidebar Node Component ---------- */
interface SidebarNodeProps {
  node: (typeof NODE_DATA)[number];
  onDragStart: ReturnType<typeof useDnD>["onDragStart"];
  createAddNewNode: (nodeType: string) => OnDropAction;
  setType: (type: string | null) => void;
}
function SidebarNode({
  node,
  onDragStart,
  createAddNewNode,
  setType,
}: SidebarNodeProps) {
  return (
    <div
      className={`dndnode ${node.className || ""}`}
      onPointerDown={(event) => {
        setType(node.type);
        onDragStart(event, createAddNewNode(node.type));
      }}
    >
      {node.label}
    </div>
  );
}

/* ---------- Collapsible Sidebar Group ---------- */
/* ---------- SidebarGroup with outlineColor ---------- */
interface SidebarGroupProps {
  title: string;
  collapsible?: boolean;
  outlineColor?: string;
  children: React.ReactNode;
}
function SidebarGroup({
  title,
  collapsible = false,
  outlineColor,
  children,
}: SidebarGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="sidebar-group p-2"
      style={{
        border: outlineColor ? `2px solid ${outlineColor}` : undefined,
      }}
    >
      <div
        className="group-header"
        onClick={() => collapsible && setOpen((prev) => !prev)}
      >
        {title} {collapsible && <span>{open ? "▼" : "►"}</span>}
      </div>
      {open && <div className="group-content">{children}</div>}
    </div>
  );
}

/* ---------- Variables Group ---------- */
function VariableGroup() {
  const { setNodes } = useReactFlow();
  const [variables, setVariables] = useState<string[]>([]);

  const addVariable = () => {
    const name = prompt("Enter variable name:");
    if (!name) return;
    setVariables((prev) => [...prev, name]);
  };

  const createVariableNode = (name: string) => {
    setNodes((nds) => [
      ...nds,
      {
        id: getId(),
        type: "variable",
        position: { x: 100, y: 100 },
        data: { label: name },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    ]);
  };

  return (
    <div className="variable-group">
      <button onClick={addVariable}>+ Create Variable</button>
      <div className="variables-list">
        {variables.map((v) => (
          <div
            key={v}
            className="variable-item"
            onClick={() => createVariableNode(v)}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Drag Ghost ---------- */
interface DragGhostProps {
  type: string | null;
}
export function DragGhost({ type }: DragGhostProps) {
  const { position } = useDnDPosition();

  if (!position || !type) return null;

  const node = NODE_DATA.find((n) => n.type === type);

  return (
    <div
      className={`dndnode ghostnode ${node?.className || ""}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
      }}
    >
      {node?.label}
    </div>
  );
}

