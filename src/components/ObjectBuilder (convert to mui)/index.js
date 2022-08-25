import React, {useEffect, useState, useRef} from "react";
import {Button, Form} from "react-bootstrap";
import "./ObjectBuilder.css";

const ObjectBuilder = props => {
  const [jsonObject, setJsonObject] = useState({});
  const keyRef = useRef(null);
  const valueRef = useRef(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    props.callback(jsonObject);
  }, [jsonObject]);
  useEffect(() => {
    if (props.defaultValue) {
      const parsedObject = JSON.parse(props.defaultValue);
      setJsonObject(parsedObject);
      renderObject(parsedObject);
    }
  }, [props.defaultValue]);
  const addKeyValue = () => {
    const key = keyRef.current.value.trim();
    const value = valueRef.current.value;
    if (!key.length || !value.length){
      return alert("You must add both a key and a value.");
    }
    const newObj = {
      ...jsonObject,
      [key]: value
    }
    setJsonObject(newObj);
    renderObject(newObj);
  }
  const removeKey = () => {
    const key = keyRef.current.value.trim();
    const newObj = {...jsonObject};
    delete newObj[key];
    setJsonObject(newObj);
    renderObject(newObj);
  }
  const renderObject = obj => {
    keyRef.current.value = "";
    valueRef.current.value = "";
    textareaRef.current.value = JSON.stringify(obj, null, 2);
    keyRef.current.focus();
  }
  const onTextareaClick = event => {
    event.currentTarget.blur();
  }
  const onValueKeyDown = event => {
    if (event.key === "Enter") {
      event.stopPropagation();
      event.preventDefault();
      addKeyValue();
    }
  }
  return (
    <div className="object-builder-container">
      <Form>
        <Form.Row>
          <Form.Group>
            <Form.Label>
              Key
            </Form.Label>
            <Form.Control
              ref={keyRef}
              className="object-builder-key-input"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Value
            </Form.Label>
            <Form.Control
              ref={valueRef}
              className="object-builder-value-input"
              onKeyDown={onValueKeyDown}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group className="object-builder-button-group">
            <Button
              variant="outline-success"
              onClick={addKeyValue}
              className="object-builder-button"
            >Add key:value</Button>
            <Button
              variant="outline-danger"
              onClick={removeKey}
              className="object-builder-button"
            >Remove key</Button>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Control
            as="textarea"
            className="object-builder-textarea"
            ref={textareaRef}
            onClick={onTextareaClick}
          />
        </Form.Row>
      </Form>
    </div>
  );
}

export default ObjectBuilder;