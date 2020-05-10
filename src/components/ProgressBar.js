import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, percentUploaded }) => {
  return (
    uploadState === "uploading" && (
      <Progress
        className="progress__bar"
        percent={percentUploaded}
        progress
        indicating
        size="large"
        inverted
        attached="bottom"
      />
    )
  );
};
export default ProgressBar;
