import { useState, useRef, useCallback } from "react";
import FormModal, { FormInputOptions } from "../../../components/FormModal";
import { EntityOptions, capitalize } from "../index";
import useAlert from "../../../hooks/useAlert";
import ChildEntityModal from "../ChildEntityModal";

function EntityWithNestedEntityCreationModal<EntityType>({
  showModal,
  closeModal,
  editMode,
  data: primaryEntityData,
  onSubmit,
  primaryEntity,
  secondaryEntity,
  title,
  formId,
  refresh,
  startStage = "primary",
}: {
  showModal: boolean;
  closeModal: () => void;
  editMode: "create" | "edit";
  data?: any;
  onSubmit: (
    formData: any,
    isPrimary?: boolean,
    entityUuid?: string
  ) => Promise<any>;
  primaryEntity: EntityOptions;
  secondaryEntity: EntityOptions;
  title: string;
  formId?: string;
  refresh?: () => void;
  startStage?: string;
}) {
  const initialStage = startStage === "secondary" ? 1 : 0;
  const [stage, setStage] = useState(initialStage);
  
  const [secondaryEditMode, setSecondaryEditMode] = useState<"create" | "edit">(
    "create"
  );
  const [secondaryModalData, setSecondaryModalData] = useState<any>(null);
  const primaryEntityUuid = useRef<string | null>(
    primaryEntityData?.[primaryEntity.entityName + "Uuid"] ?? null
  );
  const { callAlert } = useAlert();

  const editSecondaryEntity = useCallback((rowData: any) => {
    setSecondaryEditMode("edit");
    setStage(2);
    setSecondaryModalData(rowData);
  }, []);

  const updateInputListWithData = (
    inputs: FormInputOptions[],
    entityData: any
  ) => {
    return inputs.map((input) => {
      const inputCopy = { ...input } as FormInputOptions;
      // if (inputCopy.modalStep === 0) {
      inputCopy.defaultValue =
        entityData?.[input.name] ?? inputCopy.defaultValue;
      if (Object.hasOwnProperty.call(inputCopy, "defaultChecked")) {
        inputCopy.defaultChecked =
          entityData?.[input.name] ?? inputCopy.defaultChecked;
      }
      if (inputCopy.preferredUnitKeyField) {
        inputCopy.preferredUnitKey =
          entityData?.[inputCopy.preferredUnitKeyField] || "temp";
      }
      delete inputCopy.tableOptions;
      return inputCopy;
    });
  };

  // add defaultValues from existing data (present if in "edit" mode)
  const primaryFormInputs: FormInputOptions[] = updateInputListWithData(
    primaryEntity.inputList,
    primaryEntityData
  );
  const secondaryFormInputs: FormInputOptions[] = updateInputListWithData(
    secondaryEntity.inputList,
    secondaryModalData
  );

  const onIntermediateSubmit = async (formData: EntityType) => {
    const uuid = await onSubmit(
      formData,
      stage === 0,
      primaryEntityUuid.current
    );
    switch (stage) {
      case 0:
        if (!uuid && editMode === "create") {
          callAlert(
            `Failed to ${editMode} ${
              primaryEntity.title ?? primaryEntity.entityName
            }`
          );
          closeModal();
        } else if (uuid) {
          primaryEntityUuid.current = uuid;
        }
        setStage(1);
        break;
      case 1:
        // cannot get here
        throw "how did we get here?";
        break;
      case 2:
        if (!uuid) {
          callAlert(
            `Failed to create ${
              secondaryEntity.title ?? secondaryEntity.entityName
            }`
          );
        }
        setStage(1);
        break;
      default:
        // cannot get here
        throw "how did we get here?";
        break;
    }
  };

  const refreshOnClose = () => {
    refresh && refresh();
    closeModal();
  };

  const addSecondaryEntity = () => {
    setSecondaryEditMode("create");
    setStage(2);
    setSecondaryModalData(null);
  };

  const deleteSecondaryRows = (rows: any[]) => {
    //
    console.log("deleteSecondaryRows", rows);
  };

  return (
    <>
      {stage === 0 ? (
        <FormModal
          showModal={showModal}
          closeModal={refreshOnClose}
          title={capitalize(primaryEntity.title ?? primaryEntity.entityName)}
          mode={editMode}
          formId={formId ?? `${editMode}-${title}-form`}
          onSubmit={onIntermediateSubmit}
          inputs={primaryFormInputs}
        />
      ) : null}
      {stage === 1 ? (
        <ChildEntityModal
          showModal={showModal}
          closeModal={closeModal}
          title={capitalize(
            secondaryEntity.pluralTitle ?? secondaryEntity.pluralEntityName
          )}
          addEntity={addSecondaryEntity}
          editEntity={editSecondaryEntity}
          parentPath={
            primaryEntity.pathName ??
            primaryEntity.pluralEntityName ??
            primaryEntity.entityName + "s"
          }
          parentUuid={primaryEntityUuid.current}
          childEntity={secondaryEntity}
          deleteChildRows={deleteSecondaryRows}
        />
      ) : null}
      {stage === 2 ? (
        <FormModal
          showModal={showModal}
          closeModal={refreshOnClose}
          title={capitalize(
            secondaryEntity.title ?? secondaryEntity.entityName
          )}
          mode={secondaryEditMode}
          formId={formId ?? `${editMode}-${title}-form`}
          onSubmit={onIntermediateSubmit}
          inputs={secondaryFormInputs}
        />
      ) : null}
    </>
  );
}

export default EntityWithNestedEntityCreationModal;
