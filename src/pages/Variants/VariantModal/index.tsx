import { useState, useEffect, ReactEventHandler } from "react";
import FormModal from "../../../components/FormModal";
import useAPI from "../../../hooks/useAPI";
import useAlert from "../../../hooks/useAlert";
import VariantDimensions from "./VariantDimensions";
import SKUField from "./SKUField";
import { ProductVariant } from "../../../types";
import { VariantFormData } from "..";

const VariantModal = ({
  showModal,
  closeModal,
  mode,
  data,
  onSubmit
}: {
  showModal: boolean;
  closeModal: () => void;
  mode?: "create" | "edit";
  data?: ProductVariant;
  onSubmit: (formData: ProductVariant) => void;
}) => {
  const [brandNames, setBrandNames] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [defaultSKU, setDefaultSKU] = useState(data?.sku || null);
  const [brandName, setBrandName] = useState(data?.brandName || null);
  const [productName, setProductName] = useState(data?.productName || null);
  const [variantName, setVariantName] = useState(data?.variantName || null);
  const [updateSKU, setUpdateSKU] = useState(true);
  const [showSKUAlert, setShowSKUAlert] = useState(false);
  const [existingSKUs, setExistingSKUs] = useState([]);
  const [existingFullnames, setExistingFullnames] = useState([]);
  const [existingUPCs, setExistingUPCs] = useState([]);
  const { isLoading: loading, data: apiData, error } = useAPI("variants");
  const { alertError } = useAlert();
  const replaceSpaces = (str: string) => str.replace(/\s/g, "_");

  useEffect(() => {
    if (!loading) {
      if (apiData) {
        const products: string[] = [];
        let skus: string[] = [];
        let fullnames: string[] = [];
        let upcs: string[] = [];
        const brands = apiData.data.variants.map((variant: ProductVariant) => {
          products.push(variant.productName);
          skus.push(variant.sku);
          fullnames.push(variant.fullname);
          upcs.push(variant.upc);
          return variant.brandName;
        });
        setBrandNames(Array.from(new Set(brands)));
        setProductNames(Array.from(new Set(products)));
        if (mode === "edit") {
          // filter out the present variant's values 
          skus = skus.filter(sku => sku !== data.sku);
          fullnames = fullnames.filter(fullname => fullname !== data.fullname);
          upcs = upcs.filter(upc => upc !== data.upc);
        }
        setExistingSKUs(skus);
        setExistingFullnames(fullnames);
        setExistingUPCs(upcs);
      }
      if (error) {
        alertError(error);
      }
    }
  }, [loading, data, error, alertError]);

  useEffect(() => {
    // to update defaultSKU
    if (mode === "create" && updateSKU && (brandName || productName || variantName)) {
      const sku = `${brandName ? replaceSpaces(brandName).slice(0, 9) : ""}${
        productName ? "-" + replaceSpaces(productName).slice(0, 9) : ""
      }${variantName ? "-" + replaceSpaces(variantName).slice(0, 5) : ""}`;
      setDefaultSKU(sku.toLowerCase());
    }
  }, [brandName, productName, variantName]);

  const onSKUInput: ReactEventHandler<HTMLInputElement> = event => {
    // once user starts typing in SKU field, stop automatically updating it based on brand, product and variant names
    setUpdateSKU(false);
    // check if SKU already exists
  };

  const skuCallback = (sku: string) => {
    console.log("sku", sku)
      if (existingSKUs.includes(sku)) {
        setShowSKUAlert(true);
      } else {
        setShowSKUAlert(false);
      }
      return sku;
  }

  const onSubmitWrapper = (cb: (formData: VariantFormData) => void) => {
    return (formData: VariantFormData) => {
      // check if sku is unique
      if (!showSKUAlert) {
        return cb(formData);
      }
    }
  }
  const isUniqueFullname = (fullname: string) => !existingFullnames.includes(fullname);
  const isUniqueUPC = (upc: string) => !upc || !existingUPCs.includes(upc);

  const formInputs = [
    {
      name: "fullname",
      label: "Full name",
      defaultValue: data?.fullname,
      validation: {
        required: true,
        minLength: 4,
        maxLength: 150,
        validate: isUniqueFullname
      },
      errorMessages: {
        required: "required field",
        minLength: "minimum length - 4 characters",
        maxLength: "maximum length - 150 characters",
        validate: "This name is already in use by another variant"
      },
      width: "275px",
      callback: (x: string) => x
    },
    {
      name: "brandName",
      label: "Brand",
      type: "select",
      selectOptions: brandNames,
      defaultValue: data?.brandName,
      validation: {
        required: true
      },
      errorMessages: {
        required: "required field"
      },
      width: "275px",
      callback: (brand: string) => {
        setBrandName(brand);
        return brand;
      }
    },
    {
      name: "productName",
      label: "Product name",
      type: "select",
      selectOptions: productNames,
      defaultValue: data?.productName,
      validation: {
        required: true
      },
      errorMessages: {
        required: "required field"
      },
      width: "275px",
      callback: (product: string) => {
        setProductName(product);
        return product;
      }
    },
    {
      name: "variantName",
      label: "Variant name",
      defaultValue: data?.variantName,
      validation: {
        required: true,
        maxLength: 50
      },
      errorMessages: {
        required: "required field",
        maxLength: "maximum length - 50 characters"
      },
      width: "275px",
      callback: (variant: string) => {
        setVariantName(variant);
        return variant;
      }
    },
    {
      name: "sku",
      child: (
        <SKUField
          updatedValue={defaultSKU}
          defaultValue={data?.sku || defaultSKU}
          width="275px"
          onInput={onSKUInput}
          showAlert={showSKUAlert}
        />
      ),
      callback: skuCallback
    },
    {
      name: "upc",
      label: "UPC",
      type: "number",
      defaultValue: data?.upc,
      validation: {
        maxLength: 13,
        validate: isUniqueUPC
      },
      errorMessages: {
        maxLength: "enter up to 13 digits",
        validate: "This UPC is already in use by another variant"
      },
      width: "275px",
      callback: (x: string) => x
    },
    {
      name: "dimensions",
      child: <VariantDimensions callback={(x: any) => x} data={data} />,
      callback: (x: any) => x
    }
  ];
  return (
    <FormModal
      mode={mode}
      inputs={formInputs}
      showModal={showModal}
      closeModal={closeModal}
      title="Variant"
      onSubmit={onSubmitWrapper(onSubmit)}
      formId="variantForm"
    />
  );
};

export default VariantModal;
