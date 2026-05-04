import NumberNode from "./MathNodes/NumberNode";
import SerialReadNode from "./SerialNodes/SerialRead";
import TableNode from "./DataOutputNodes/TableNode";
import RandomNode from "./MathNodes/RandomNode";
import IntervalNode from "./SignalNodes/IntervalNode";
import OperationNode from "./MathNodes/MathOperationNode";
import ValueUpdatedNode from "./SignalNodes/ValueUpdatedNode";
import ValueChangedNode from "./SignalNodes/ValueChangedNode";
import ChartNode from "./DataOutputNodes/ChartNode";
import CmpOperationNode from "./BooleanNodes/CmpOperationNode";
import IfNode from "./ControlNodes/IfNode";
import AndNode from "./BooleanNodes/AndNode";
import OrNode from "./BooleanNodes/OrNode";
import XorNode from "./BooleanNodes/XorNode";
import NotNode from "./BooleanNodes/NotNode";
import GateNode from "./ControlNodes/GateNode";
import CurrentTimeNode from "./SensorNodes/CurrentTimeNode";
import StartedNode from "./SignalNodes/StartedNode";
import TrueNode from "./BooleanNodes/TrueNode";
import FalseNode from "./BooleanNodes/FalseNode";
import ButtonSignalNode from "./SignalNodes/ButtonSignalNode";
import LightNode from "./DataOutputNodes/LightNode";

type NodeConfig = {
  type: string;
  label: string;
  className?: string;
  initialData?: any;
  groupID?: string;
  outlineColor?: string;
};

export const nodeTypes = {
  numberNode: NumberNode,
  serialReadNode: SerialReadNode,
  tableNode: TableNode,
  chartNode: ChartNode,
  lightNode: LightNode,
  randomNode: RandomNode,
  currentTimeNode: CurrentTimeNode,
  intervalNode: IntervalNode,
  valueUpdatedNode: ValueUpdatedNode,
  valueChangedNode: ValueChangedNode,
  buttonSignalNode: ButtonSignalNode,
  startedNode: StartedNode,
  mathOperationNode: OperationNode,
  cmpOperationNode: CmpOperationNode,
  ifNode: IfNode,
  gateNode: GateNode,
  andNode: AndNode,
  orNode: OrNode,
  xorNode: XorNode,
  notNode: NotNode,
  trueNode: TrueNode,
  falseNode: FalseNode
};

export const NODE_DATA: NodeConfig[] = [
  // Arithmetic / Basic Nodes
  {
    type: "numberNode",
    label: "Number Node",
    className: "numberNode",
    groupID: "Math",
    outlineColor: "#4CAF50", // green
    initialData: { numberValue: 0 },
  },
  {
    type: "serialReadNode",
    label: "Serial Read Node",
    className: "serialReadNode",
    groupID: "Sensor",
    outlineColor: "#E04C74",
    initialData: {
      baudRate: 9600,
    }
  },
  {
    type: "tableNode",
    label: "Table Node",
    className: "tableNode",
    groupID: "Output Display",
    outlineColor: "#E4A2C2",
  },
  {
    type: "intervalNode",
    label: "Interval Node",
    className: "intervalNode",
    groupID: "Signal",
    outlineColor: "#A4EBD1"
  },
  {
    type: "randomNode",
    label: "Random Node",
    className: "randomNode",
    groupID: "Math",
    outlineColor: "#4CAF50"
  },
  {
    type: "mathOperationNode",
    label: "Math Operation Node",
    className: "mathOperationNode",
    groupID: "Math",
    outlineColor: "#4CAF50"
  },
  {
    type: "valueUpdatedNode",
    label: "Value Updated Node",
    className: "valueUpdatedNode",
    groupID: "Signal",
    outlineColor: "#A4EBD1"
  },
  {
    type: "valueChangedNode",
    label: "Value Changed Node",
    className: "valueChangedNode",
    groupID: "Signal",
    outlineColor: "#A4EBD1"
  },
  {
    type: "startedNode",
    label: "Started Node",
    className: "startedNode",
    groupID: "Signal",
    outlineColor: "#A4EBD1"
  },
  {
    type: "buttonSignalNode",
    label: "Button Signal Node",
    className: "buttonSignalNode",
    groupID: "Signal",
    outlineColor: "#A4EBD1"
  },
  {
    type: "chartNode",
    label: "Chart Node",
    className: "chartNode",
    groupID: "Output Display",
    outlineColor: "#E4A2C2",
  },
  {
    type: "lightNode",
    label: "Light Node",
    className: "lightNode",
    groupID: "Output Display",
    outlineColor: "#E4A2C2",
  },
  {
    type: "cmpOperationNode",
    label: "Compare Operation Node",
    className: "cmpOperationNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "andNode",
    label: "And Node",
    className: "andNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "orNode",
    label: "Or Node",
    className: "orNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "xorNode",
    label: "Xor Node",
    className: "xorNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "notNode",
    label: "Not Node",
    className: "notNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "trueNode",
    label: "True Node",
    className: "trueNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "falseNode",
    label: "False Node",
    className: "falseNode",
    groupID: "Boolean",
    outlineColor: "#bed43a"
  },
  {
    type: "ifNode",
    label: "If Node",
    className: "ifNode",
    groupID: "Control",
    outlineColor: "#bed43a"
  },
  {
    type: "gateNode",
    label: "Gate Node",
    className: "gateNode",
    groupID: "Control",
    outlineColor: "#bed43a"
  },
  {
    type: "currentTimeNode",
    label: "Current Time Node In ms",
    className: "currentTimeNode",
    groupID: "Sensor",
    outlineColor: "#4CAF50"
  },
];
