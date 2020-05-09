import React from "react";

class FileLink extends React.Component {
  render() {
    const { file, key } = this.props;
    console.log(this.props.file);

    return (
      <span>
        {key !== "image-t" && (
          <p>
            File link:{" "}
            <a
              target="_blank"
              style={{ color: "white", textDecoration: "underline" }}
              href={file}
            >
              {file}
            </a>
          </p>
        )}
      </span>
    );
  }
}
export default FileLink;
