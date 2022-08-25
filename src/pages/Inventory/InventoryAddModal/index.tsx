import { useEffect, useState } from "react";
import FormModal from "../../../components/FormModal";
import useAPI from "../../../hooks/useAPI";
import useAlert from "../../../hooks/useAlert";
import { InventoryEntry, ProductVariant } from "../../../types";

const InventoryAddModal = ({
  data,
  showModal,
  closeModal,
  onSubmit
}: {
  data: InventoryEntry[];
  showModal: boolean;
  closeModal: () => void;
  onSubmit: (formData: any) => void;
}) => {
  const [availableVariants, setAvailableVariants] = useState([]);
  const {
    isLoading: varLoading,
    data: varData,
    error: varError
  } = useAPI("variants");
  const { alertError } = useAlert();

  useEffect(() => {
    if (!varLoading) {
      if (varData) {
        const inventorySKUs = data.map(invEntry => invEntry.variant.sku);
        const filteredVariants = varData.data.variants.filter(
          (variant: ProductVariant) => !inventorySKUs.includes(variant.sku)
        );
        setAvailableVariants(filteredVariants);
      }
      if (varError) {
        alertError(varError);
      }
    }
  }, [varLoading, varData, varError, alertError, data]);

  const formInputs = [
    {
      name: "variant",
      label: "Variant",
      type: "select",
      selectOptions: availableVariants.map(variant => variant.fullname),
      selectRestricted: true,
      width: "250px",
      callback: (variantName: string) => {
        const [selectedVariant] = availableVariants.filter(
          variant => variant.fullname === variantName
        );
        return selectedVariant;
      }
    },
    {
      name: "quantity",
      label: "Quantity to add",
      type: "number",
      width: "250px",
      callback: (x: string) => parseInt(x)
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      step: "0.01",
      callback: (x: string) => parseFloat(x)
    }
  ];
  return (
    <FormModal
      inputs={formInputs}
      showModal={showModal}
      closeModal={closeModal}
      onSubmit={onSubmit}
      title="Add new inventory"
      formId="invForm"
    />
  );
};

export default InventoryAddModal;
