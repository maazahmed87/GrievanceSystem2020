import React from "react";

class FileLink extends React.Component {
  render() {
    const { fileName, fileRef, ikey } = this.props;

    return (
      <span>
        {ikey !== "image-t" && (
          <p style={{ color: "white" }}>
            File Name: {"  "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white", textDecoration: "underline" }}
              href={fileRef}
            >
              {fileName}
            </a>
          </p>
        )}
      </span>
    );
  }
}
export default FileLink;
