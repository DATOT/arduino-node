import SingleHandle from "./SingleHandle";
import MultiHandle from "./MultiHandle";
import { BaseHandleProps } from "./types";

const BaseHandle: React.FC<BaseHandleProps> = (props: BaseHandleProps) => {
  if (props.multiplicity == "single") {
    return <SingleHandle {...props} />;
  }

  return <MultiHandle {...props} />;
};

export default BaseHandle;
