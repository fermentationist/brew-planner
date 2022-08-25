import { memo } from "react";
import FormModal, { InputParams } from "../../../components/FormModal";
import UserBreweriesSelector from "../../../components/UserBreweriesSelector";

const UserModal = ({
  mode,
  showModal,
  closeModal,
  data,
  isAdmin,
  onSubmit
}: {
  mode: "create" | "edit";
  showModal: boolean;
  closeModal: () => void;
  data?: any;
  isAdmin?: boolean;
  onSubmit: (formData: any) => void;
}) => {
  const formInputs: InputParams[] = [
    {
      name: "email",
      label: "Email",
      defaultValue: data?.email,
      validation: { required: true },
      errorMessages: {
        required: "required field"
      },
      width: "250px"
    },
    {
      name: "displayName",
      label: "Display name",
      defaultValue: data?.displayName,
      width: "250px"
    }
  ];

  const adminInputs: InputParams[] = [
    {
      name: "role",
      label: "Role",
      type: "select",
      selectOptions: ["admin", "manager", "user"],
      selectRestricted: true,
      defaultValue: data?.customClaims?.role,
      width: "250px",
      callback: x => x
    },
    {
      name: "breweries",
      child: (
        <UserBreweriesSelector
          defaultSelected={(data?.breweries || []).map((brewery: any) => brewery?.breweryId || null)}
          callback={x => x}
        />
      ),
      defaultValue: data?.customClaims?.breweries,
      callback: x => x
    }
  ];

  // only show role selector if user is admin
  const inputs = isAdmin
    ? mode === "create"
      ? [...formInputs, ...adminInputs]
      : adminInputs
    : formInputs;

  return (
    <FormModal
      mode={mode}
      showModal={showModal}
      closeModal={closeModal}
      title={`User${data?.displayName ? " " + data.displayName : ""}`}
      formId="userForm"
      onSubmit={onSubmit}
      inputs={inputs}
    />
  );
};

export default memo(UserModal, () => true);
