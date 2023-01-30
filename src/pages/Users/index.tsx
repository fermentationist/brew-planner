import { useEffect, useState } from "react";
import Page from "../../components/Page";
import UserModal from "./UserModal";
import DataTable, { columnOptions, getRowData } from "../../components/DataTable";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAPI, { APIRequest } from "../../hooks/useAPI";
import { APIError, BreweryData } from "../../types";

export interface UserData {
  uid: string;
  displayName?: string;
  email: string;
  customClaims: {
    role: string;
    breweries?: string[];
  };
  breweries?: BreweryData[]
}

const Users = function ({
  startLoading,
  doneLoading
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) {
  const [tableData, setTableData] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [mode, setMode] = useState("create" as "create" | "edit");
  const [userData, setUserData] = useState(null);
  const { auth, sendPasswordResetEmail } = useAuth();
  const { callAlert, alertError, alertErrorProm } = useAlert();
  const { confirmDelete, confirm } = useConfirm();
  const { isLoading: loadingUsers, data: usersData, error: usersError, refetch: refresh } = useAPI("users");
  const { isLoading: loadingBreweries, data: breweriesData, error: breweriesError} = useAPI("breweries");

  useEffect(() => {
    if (!loadingUsers && !loadingBreweries) {
      if (usersData) {
        let usersArray = usersData.data.users;
        if (breweriesData){
          const breweriesMap = breweriesData.data.breweries.reduce((map: any, brewery: BreweryData) => {
            if (!Object.hasOwn(map, brewery.breweryUuid)) {
              map[brewery.breweryUuid] = brewery;
            }
            return map;
          }, {});
          usersArray = usersArray.map((user: UserData) => {
            const breweries = user.customClaims?.breweries.map((breweryUuid: string) => {
              return breweriesMap[breweryUuid];
            })
            user.breweries = breweries;
            return user;
          })
        }
        setTableData(usersArray);
      }
      if (usersError) {
        console.error(usersError);
        alertError(usersError);
      }
      doneLoading();
    }
  }, [usersData, usersError, loadingUsers, doneLoading, alertError]);

  const editUser = (rowData: UserData) => {
    setUserData(rowData);
    setMode("edit");
    setShowUserModal(true);
  };

  const addUser = () => {
    setUserData(null);
    setMode("create");
    setShowUserModal(true);
  };

  const deleteSingleUser = async (uid: string) => {
    const deleteUser = new APIRequest({
      url: `/users/${uid}`,
      method: "delete"
    });
    if (uid === auth?.user?.uid) {
      callAlert({
        message: "You may not delete your own user!",
        title: "Error"
      });
      return;
    }
    return deleteUser.request().catch(async error => await alertErrorProm(error));
  };

  const deleteRows = async (rowsDeleted: any) => {
    const uidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].uid;
      }
    );
    const qty = uidsToDelete.length;
    const confirm = await confirmDelete(qty, "user");
    if (!confirm) {
      return;
    }
    if (uidsToDelete.includes(auth?.user?.uid)) {
      callAlert({
        message: "You may not delete your own user!",
        title: "Error"
      });
      return;
    }
    if (qty > 1) {
      startLoading();
    }
    if (qty > 4) {
      callAlert("Please be patient, this may take a little while...");
    }
    for (const uid of uidsToDelete) {
      console.log("attempting to delete user:", uid);
      await deleteSingleUser(uid);
    }
    refresh();
    doneLoading();
  };

  const onUserModalFormSubmit = async (formData: any) => {
    const { resetLink } = await createOrUpdateUser(formData);
    console.log("new user password reset link:", resetLink);
    if (resetLink) {
      // was create operation
      // confirm password reset email
      const sendEmail = await confirm(
        `New user ${
          formData.displayName ? formData.displayName + " " : ""
        }created. To send a password reset email to ${
          formData.email
        }, please click "confirm".`
      );
      if (sendEmail) {
        sendPasswordResetEmail(formData.email);
        callAlert("Password reset email sent.");
      } else {
        callAlert({
          message:
            "No email sent. Alternately, the password may be reset with this link:",
          child: <a href={resetLink}>click here</a>
        });
      }
    }
    refresh();
    setShowUserModal(false);
  };

  const createOrUpdateUser = async (formData: any) => {
    const reqBody =
      mode === "create"
        ? {
            ...formData,
            email: formData.email,
            displayName: formData.displayName,
            role: formData.role || "user",
            password: null
          }
        : {
            role: formData.role,
            breweries: formData.breweries
          };
    const apiReq = new APIRequest({
      url: mode === "create" ? "/users" : "/users/" + userData?.uid,
      method: mode === "create" ? "post" : "patch",
      data: reqBody
    });
    const response = await apiReq
      .request()
      .catch(async (error: APIError) => {
        await alertErrorProm(error);
      });
    return response?.data;
  };
  
  const sharedColumns = [
    {
      label: "UID",
      name: "uid",
      options: columnOptions.options
    },
    {
      label: "Name",
      name: "displayName",
      options: columnOptions.options
    },
    {
      label: "Email",
      name: "email",
      options: columnOptions.options
    },
    {
      label: "Role",
      name: "customClaims.role",
      options: columnOptions.options
    },
    {
      label: "Breweries",
      name: "breweries",
      options: {
        customBodyRender: (breweries: any[]) => {
          if (!Array.isArray(breweries)) {
            return null;
          }
          return breweries.map((brewery, index) => {
            return (
            <Tooltip key={index} title={JSON.stringify(brewery?.address, null, 2) || ""}>
              <span>{brewery?.name}</span>
            </Tooltip>
          )});
        },
        ...columnOptions.options
      }
    }
  ];

  const editColumn = {
    name: "",
    options: columnOptions.createRenderEditButtonOptions("edit user", editUser)
  };

  // only admin users should be shown the edit button
  const columns =
    auth?.user?.role === "admin"
      ? [...sharedColumns, editColumn]
      : sharedColumns;

  return (
    <Page>
      <Tooltip title="Add User">
        <IconButton onClick={addUser}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        data={tableData}
        columns={columns}
        options={{
          selectableRows: "multiple",
          selectableRowsHeader: true,
          onRowsDelete: deleteRows
        }}
        refresh={refresh}
      />
      {showUserModal ? (
        <UserModal
          mode={mode}
          showModal={showUserModal}
          closeModal={() => setShowUserModal(false)}
          data={userData}
          isAdmin={auth?.user?.role === "admin"}
          onSubmit={onUserModalFormSubmit}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Users);
