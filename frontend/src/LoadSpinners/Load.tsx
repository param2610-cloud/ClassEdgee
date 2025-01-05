import React from "react";
import { ClimbingBoxLoader } from "react-spinners";

const Load: React.FC = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <ClimbingBoxLoader color="#051047" size={20} />
      </div>
    );
};

export default Load;
