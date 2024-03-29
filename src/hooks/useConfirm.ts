import useAlert from "./useAlert";

const useConfirm = () => {
  const { callAlert } = useAlert();
  const confirm = (message: string, callback = (x: string): any => x) => {
    return new Promise((resolve, reject) => {
      callAlert({
        message,
        promptForInput: false,
        confirmCallback: input => {
          try {
            return resolve(callback(input));
          } catch (err) {
            callAlert({ message: err.message, title: err.name });
            return reject(input);
          }
        }
      });
    });
  };
  const confirmWithInput = (
    message: string,
    password: string,
    callback = (x: string): any => x
  ) => {
    return new Promise((resolve, reject) => {
      callAlert({
        message,
        promptForInput: !!password,
        confirmCallback: input => {
          if (password && input !== password) {
            callAlert("Operation cancelled.");
            return resolve(input);
          }
          try {
            return resolve(callback(input));
          } catch (error) {
            callAlert({ message: error.message, title: error.name });
            return reject(input);
          }
        }
      });
    });
  };
  
  const confirmDelete = async (quantity: number, typeOfEntity: string, pluralTypeOfEntity?: string) => {
    const confirmDelete = await confirmWithInput(
      `Are you sure you want to delete ${quantity > 1 ? "these " : "this "}${
        quantity > 1 ? quantity + " " : ""
      }${
        quantity > 1 ? (pluralTypeOfEntity || typeOfEntity + "s") : typeOfEntity
      }? This cannot be undone. Please type "delete" to confirm.`,
      "delete"
    );
    if (confirmDelete !== "delete") {
      return false;
    }
    return true;
  };

  return { confirm, confirmWithInput, confirmDelete };
};
export default useConfirm;
