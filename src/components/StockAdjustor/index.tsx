import { useState, useRef, useEffect, KeyboardEventHandler, FormEvent, FormEventHandler } from "react";
import Stack from "@mui/material/Stack";
import MuiAlert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import IntegerInput from "../IntegerInput";
import CustomAutocomplete from "../CustomAutocomplete";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";

const ReasonDropdown = muiStyled(CustomAutocomplete)`
  width: 250px;
  margin: 1em;
`;

const Alert = muiStyled(MuiAlert)`
  width: 225px;
  margin: 1em;
`;

const Textarea = muiStyled(TextareaAutosize)`
  width: 250px;
  margin: 1em;
`;

const QtyFieldInput = styled.input`
  height: 56px;
  width: 140px;
  border: 0px;
`;

const QtyField = styled.div`
  height: 56px;
  width: 250px;
  margin: 1em 0 1em 1em;
`;

const Span = styled.span`
  margin: 1em;
`;

const StockAdjustor = ({
  callback,
  defaultValue,
  className
}: {
  callback: (val: any) => void;
  defaultValue?: number;
  className?: string;
}) => {
  const [reasonOptions, setReasonOptions] = useState([]);
  const [difference, setDifference] = useState(0);
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState(null);
  const [editQty, setEditQty] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const qtyFieldInputRef = useRef(null);

  useEffect(() => { // focus on QtyFieldInput when it is made visible
    if (qtyFieldInputRef.current) {
      qtyFieldInputRef.current.focus();
    }
  }, [editQty]);

  const removeReasons = [
    "breakage",
    "corporate order",
    "damaged label",
    "influencer shrink",
    "marketing purposes",
    "spoilage"
  ];
  const addReasons = [
    "purchase order",
    "return from marketing purposes"
  ];

  const wrappedCallback = (n: number) => {
    const diff = n - defaultValue;
    if (diff > 0) {
      setReasonOptions(addReasons);
    } else if (diff < 0) {
      setReasonOptions(removeReasons);
    } else {
      setReasonOptions([]);
    }
    setDifference(diff);
    return callback({ diff, reason, note });
  };

  const reasonCallback = (selection: string) => {
    setReason(selection);
    return callback({ diff: difference, reason: selection, note });
  };

  const onNotesChange: FormEventHandler = (event: FormEvent<HTMLInputElement>) => {
    const notes = event.currentTarget.value;
    setNote(notes);
    return callback({ diff: difference, reason, note: notes });
  };

  const setQtyField = () => {
    setEditQty(false);
    const qtyFieldValue = qtyFieldInputRef.current?.value || 0;
    const qty = difference < 0 ? -1 * qtyFieldValue : qtyFieldValue;
    setQuantity(parseInt(qty));
  };

  const displayQtyField = () => {
    setEditQty(true);
  };

  const qtyFieldOnKeyDown: KeyboardEventHandler = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setQtyField();
      setEditQty(false);
    }
  };

  const addRemoveMessage =
    difference !== 0 ? (
      editQty ? (
        <QtyField onBlur={setQtyField}>
          <Span>{difference > 0 ? "Adding" : "Removing"}</Span>
          <QtyFieldInput
            ref={qtyFieldInputRef}
            type="number"
            step="1"
            onKeyDown={qtyFieldOnKeyDown}
            defaultValue={Math.abs(difference)}
          />
        </QtyField>
      ) : (
        <Alert
          color={difference > 0 ? "success" : "error"}
          onClick={displayQtyField}
        >
          <Typography>
            {difference > 0
              ? `Adding ${difference}`
              : `Removing ${Math.abs(difference)}`}
          </Typography>
        </Alert>
      )
    ) : null;

  return (
    <Stack>
      <IntegerInput
        className={className}
        defaultValue={defaultValue}
        width="138px"
        callback={wrappedCallback}
        diffProp={quantity}
      />
      {addRemoveMessage}
      {difference !== 0 ? (
        <>
          <ReasonDropdown
            options={reasonOptions}
            restricted={true}
            callback={reasonCallback}
            label="Reason"
          />
          <Textarea placeholder="Notes" minRows={3} onChange={onNotesChange} />
        </>
      ) : null}
    </Stack>
  );
};

export default StockAdjustor;
