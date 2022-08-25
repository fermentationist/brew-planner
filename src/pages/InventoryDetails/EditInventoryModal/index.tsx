import FormModal from "../../../components/FormModal";
import { styled as muiStyled } from "@mui/material/styles";
import Adjustor from "../../../components/StockAdjustor";

const StockAdjustor = muiStyled(Adjustor)`
  margin: 1em;
`;

const EditInventoryModal = ({
  showModal,
  closeModal,
  data,
  onSubmit
}: {
  showModal: boolean;
  closeModal: () => void;
  data: any;
  onSubmit: (formData: any) => void;
}) => {
  const formInputs = [
    {
      name: "price",
      type: "number",
      step: "0.01",
      label: "Price",
      defaultValue: data?.inventory?.price,
      width: "250px",
      callback: (n: string) => n && parseFloat(n)
    },
    {
      name: "inventoryChange",
      child: <StockAdjustor defaultValue={data?.inventory?.available} callback={(x: any) => x}/>,
      callback: (x: any) => x,
      defaultValue: {}
    },
  ];
  return (
    <FormModal
      mode="edit"
      showModal={showModal}
      closeModal={closeModal}
      formId="editInventory"
      inputs={formInputs}
      onSubmit={onSubmit}
      title={data?.variant?.fullname}
    />
  );
};

export default EditInventoryModal;
