import { useState } from "react";

export interface DropZoneProps {
  readonly onFile: (file: File) => void;
  readonly onDemo?: (() => void) | undefined | undefined;
  readonly demoLabel?: string | undefined;
  readonly accept?: string | undefined;
}

/**
 * File drop zone. The file never leaves the browser: the bytes are read
 * locally and parsed in a worker.
 */
export function DropZone({
  onFile,
  onDemo,
  demoLabel = "Load demo data",
  accept = ".csv,text/csv",
}: DropZoneProps) {
  const [over, setOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.item(0);
    if (file === null || file === undefined) return;
    onFile(file);
  };

  return (
    <div
      className={over ? "bb-drop bb-drop-over" : "bb-drop"}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <p>Drop a CSV file here</p>
      <input
        type="file"
        accept={accept}
        aria-label="Choose a CSV file"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {onDemo === undefined ? null : (
        <button type="button" onClick={onDemo}>
          {demoLabel}
        </button>
      )}
    </div>
  );
}
