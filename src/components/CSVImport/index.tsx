import { ReactEventHandler } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { csvToJSON } from "../../utils/csvUtils";
import { useEffect, useRef, useState } from "react";
import useAlert from "../../hooks/useAlert";
import ImportPreviewModal from "./ImportPreviewModal";

const CSVImport = ({
  requiredKeys,
  onUpdate,
  onReplace,
  allowedKeys,
  message
}: {
  requiredKeys?: (string | string[])[];
  onUpdate?: (data: any[]) => void;
  onReplace?: (data: any[]) => void;
  allowedKeys: {[key: string]: string;};
  message?: string;
}) => {
  const [previewData, setPreviewData] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [columns, setColumns] = useState([]);
  const { callAlert, callAlertProm } = useAlert();
  const fileInputRef = useRef(null);
  const onFileChange: ReactEventHandler<HTMLInputElement> = event => {
    importCSV(event.currentTarget.files[0]);
    event.currentTarget.value = null;
  };
  useEffect(() => {
    if (previewData) {
      const [firstRow] = previewData;
      const cols = (firstRow && Object.keys(firstRow)) || [];
      setColumns(cols);
    }
  }, [previewData]);

  const openFileDialog = async () => {
    if (message) {
      await callAlertProm(message);
    } 
    fileInputRef.current.click();
  }

  const importCSV = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv: string = event.target.result as string;
      const json = csvToJSON(csv, true);
      
      const allowed = Object.entries(allowedKeys).reduce((map, entry) => {
        // expanding allowedKeys to include both the explicitly allowed key, and the key it is mapped to. i.e. {key: "KEY"} => {key: "KEY", KEY: "KEY"}
        map[entry[0]] = entry[1];
        map[entry[1]] = entry[1];
        return map;
      }, {} as {[key: string]: string;});
      const allowedKeysOnly = json.map(row => {
        const cleanedRow: any = {}
        for (const key in row) {
          if (key in allowed) {
            const translatedKey = allowed[key];
            cleanedRow[translatedKey] = row[key];
          }
        }
        return cleanedRow;
      });
      for (const requiredKey of requiredKeys) {
        const keys = Array.isArray(requiredKey) ? requiredKey : [requiredKey];
        const hasKey = keys.some(key => {
          return Object.keys(allowedKeysOnly[0]).includes(key);
        });
        if (!hasKey) {
          return callAlert(
            `Cannot import from this source. The CSV file must include the column "${keys.length < 2 ? keys[0] : keys.join('" or "')}"`
          );
        }
      }

      setPreviewData(allowedKeysOnly);
      setShowPreviewModal(true);
    };
    await reader.readAsText(file);
  };
  const callbackWrapper = (cb: (val: any) => void) => {
    return () => {
      setShowPreviewModal(false);
      return cb(previewData);
    };
  };

  return (
    <>
      <Tooltip title="Upload CSV">
        <IconButton onClick={openFileDialog}>
          <UploadFileIcon />
        </IconButton>
      </Tooltip>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".csv"
        onChange={onFileChange}
      />
      {showPreviewModal ? (
        <ImportPreviewModal
          showModal={showPreviewModal}
          closeModal={() => setShowPreviewModal(false)}
          title="CSV Import Preview"
          columns={columns}
          data={previewData}
          onUpdate={onUpdate && callbackWrapper(onUpdate)}
          onReplace={onReplace && callbackWrapper(onReplace)}
        />
      ) : null}
    </>
  );
};

export default CSVImport;
