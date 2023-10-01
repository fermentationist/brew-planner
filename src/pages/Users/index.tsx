import { memo, useEffect, useState } from "react";
import Page from "../../components/Page";
import UserModal from "./UserModal";
import DataTable, { columnOptions } from "../../components/DataTable";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAPI from "../../hooks/useAPI";
import { APIError, BreweryData, UserData } from "../../types";

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
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { confirmDelete, confirm } = useConfirm();
  const {users: usersQuery, breweries: breweriesQuery, APIRequest, ADMIN_PATH, breweryPath} = useAPI(["users", "breweries"]);
  
  useEffect(() => {
    if (usersQuery && breweriesQuery) {
      if (usersQuery.isLoading || breweriesQuery.isLoading) {
        console.log("enabling users and breweries")
        usersQuery.enable();
        breweriesQuery.enable();
      }
      if (!usersQuery.isLoading && !breweriesQuery.isLoading) {
        if (usersQuery.data) {
          let usersArray = usersQuery.data.data.users;
          if (breweriesQuery.data){
            const breweriesMap = breweriesQuery.data.data.breweries.reduce((map: any, brewery: BreweryData) => {
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
        if (usersQuery.error) {
          console.error(usersQuery.error);
          alertError(usersQuery.error);
        }
        doneLoading();
      }
    }
  }, [usersQuery, doneLoading, alertError, breweriesQuery]);

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
      baseURL: auth?.user?.role === "admin" ? ADMIN_PATH : breweryPath,
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
    return deleteUser.request().catch(async (error: APIError) => await alertErrorProm(error));
  };

  const deleteRows = async (rowsDeleted: any) => {
    const uidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].uid;
      }
    );
    const qty = uidsToDelete.length;
    const confirmResult = await confirmDelete(qty, "user");
    if (!confirmResult) {
      return;
    }
    if (uidsToDelete.includes(auth?.user?.uid)) {
      callAlert({
        message: "You may not delete your own user!",
        title: "Error"
      });
      return;
    }
    if (qty > 4) {
      const secondConfirm = await confirm("Please be patient, this may take a little while...", x => x);
      console.log("secondConfirm:", secondConfirm)
      if (!secondConfirm) {
        return;
      }
    }
    startLoading();
    let count = 1;
    for (const uid of uidsToDelete) {
      console.log("attempting to delete user:", uid);
      callAlert({message: `Deleting ${count} of ${uidsToDelete.length} users...`, showCloseButton: false});
      await deleteSingleUser(uid);
      count ++;
    }
    await resetAlertState();
    usersQuery.refetch();
    doneLoading();
  };

  const onUserModalFormSubmit = async (formData: any) => {
    const { resetLink } = await createOrUpdateUser(formData);
    if (resetLink) {
      console.log("new user password reset link:", resetLink);
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
    usersQuery.refetch();
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
    console.log("ADMIN_PATH:", ADMIN_PATH)
    const apiReq = new APIRequest({
      baseURL: auth?.user?.role === "admin" ? ADMIN_PATH : breweryPath,
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
        refresh={usersQuery?.refetch}
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

export default withLoadingSpinner(memo(Users, () => true));
