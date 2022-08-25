import React, {useRef, useEffect, useState} from "react";
import SearchableDropdown from "../SearchableDropdown";
import { Button, Form } from "react-bootstrap";
import parseQueryString from "../../utils/parseQueryString.js";
import "./PathBuilder.css";

const PathBuilder = ({
  sitemapData,
  defaultValue,
  width = "325px",
  defaultEventCategory,
  defaultEventAction,
  defaultEventLabel,
  className,
  callback
}) => {
  const [basePath, setBasePath] = useState("");
  const categoryRef = useRef(null);
  const actionRef = useRef(null);
  const labelRef = useRef(null);
  const outputRef = useRef("");

  useEffect(() => {
    if (defaultValue) {
      let [base, queryString] = defaultValue.split("?");
      let remainder = "", category, action, label;
      if (queryString) {
        [category, action, label, remainder] = parseQueryString(["event_category", "event_action", "event_label"], queryString);
        categoryRef.current.value = decodeURIComponent(category || "");
        actionRef.current.value = decodeURIComponent(action || "");
        labelRef.current.value = decodeURIComponent(label || "");
      }
      setBasePath(base + (remainder ? `?${remainder}` : ""));
      outputRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  const buildPath = () => {
    const category = encodeURIComponent(categoryRef.current.value);
    const action = encodeURIComponent(actionRef.current.value);
    const label = encodeURIComponent(labelRef.current.value);
    const categoryString = category ? `event_category=${category}` : "";
    const actionString = action ? `event_action=${action}` : "";
    const labelString = label ? `event_label=${label}` : "";
    const queryArray = [
      categoryString,
      actionString,
      labelString
    ];
    const queryString = queryArray.filter(x => x).join("&");
    const op = basePath.indexOf("?") === -1 ? "?" : "&";
    const output = queryString ? basePath + op + queryString : basePath;
    outputRef.current.value = output;
    callback(output);
  }

  const onBasePathSelect = path => {
    setBasePath(path);
  }
  return (
    <div className={`path-builder-container${className ? " " + className : ""}`}>
      <br/>
      <Form.Group>
        <Form.Label>Base path</Form.Label>
        <SearchableDropdown
          selections={sitemapData}
          value="loc"
          displayValue="loc"
          callback={onBasePathSelect}
          defaultValue={basePath}
          width={width}
          className="path-builder-dropdown"
        />
        <br/>
        <Form.Label>Event category</Form.Label>
        <Form.Control
          className="path-builder-input"
          defaultValue={defaultEventCategory}
          ref={categoryRef}
        />
        <Form.Label>Event action</Form.Label>
        <Form.Control
          className="path-builder-input"
          defaultValue={defaultEventAction}
          ref={actionRef}
        />
        <Form.Label>Event label</Form.Label>
        <Form.Control
          className="path-builder-input"
          defaultValue={defaultEventLabel}
          ref={labelRef}
        />
        <Button
          variant="outline-primary"
          onClick={buildPath}
        >
          Build URI
        </Button>
        <br/>
        <br/>
        <Form.Label>Output URI</Form.Label>
        <Form.Control
          className="path-builder-textarea"
          ref={outputRef}
          as="textarea"
          readOnly={true}
        />
      </Form.Group>

      
      
    </div>
  );
}
export default PathBuilder;
