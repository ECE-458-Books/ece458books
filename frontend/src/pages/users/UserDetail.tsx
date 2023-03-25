import { FormEvent, useEffect, useRef, useState } from "react";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { InputSwitch } from "primereact/inputswitch";
import {
  passwordValueCheck,
  pwCheckFooter,
  pwCheckHeader,
} from "../../util/auth/PWValueCheck";
import { showFailure, showSuccess } from "../../components/Toast";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import DeletePopup from "../../components/popups/DeletePopup";
import DeleteButton from "../../components/buttons/DeleteButton";
import { AUTH_API } from "../../apis/auth/AuthAPI";

export default function VendorAdd() {
  // From URL
  const { id } = useParams();
  const isUserAddPage = id === undefined;

  const [userName, setUserName] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDeletable, setIsDeletable] = useState<boolean>(false);
  const [isAdminToggleModifiable, setIsAdminToggleModifiable] =
    useState<boolean>(true);
  const [isPasswordChangeModifiable, setIsPasswordChangeModifiable] =
    useState<boolean>(true);

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is visible

  const toast = useRef<Toast>(null);

  const isSuperAdminDetail = (username: string) => {
    return username === "admin";
  };

  const isCurrentlyLoggedInUserDetail = () => {
    return id === localStorage.getItem("userID");
  };

  // Load the user data on page load
  useEffect(() => {
    if (!isUserAddPage) {
      AUTH_API.getUserDetail({ id: id! })
        .then((response) => {
          setUserName(response.username);
          setIsAdmin(response.is_staff);
          setIsAdminToggleModifiable(
            !isSuperAdminDetail(response.username) &&
              !isCurrentlyLoggedInUserDetail()
          );
          setIsPasswordChangeModifiable(true); // I believe this is always true, but should be easy to fix if not
          setIsDeletable(
            !isSuperAdminDetail(response.username) &&
              !isCurrentlyLoggedInUserDetail()
          );
        })
        .catch(() => showFailure(toast, "Could not fetch user data"));
    }
  }, []);

  // Called to make delete pop up show
  const deleteUserPopup = () => {
    logger.debug("Delete Purchase Order Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteUserFinal = () => {
    logger.debug("Edit Purchase Order Finalized");
    setDeletePopupVisible(false);
    AUTH_API.deleteUser({
      id: id!,
    })
      .then(() => {
        showSuccess(toast, "User Deleted");
        navigate("/users");
      })
      .catch(() => showFailure(toast, "User Failed to Delete"));
  };

  const tryToModifyUser = () => {
    const pwCheckReturnValidandError = passwordValueCheck(password1, password2);
    if (password1 === "" && password2 === "") {
      pwCheckReturnValidandError[0] = true;
    }

    if (pwCheckReturnValidandError[0]) {
      AUTH_API.modifyUser({
        id: id!,
        password: password1 === "" ? undefined : password1,
        password2: password2 === "" ? undefined : password2,
        is_staff: isAdmin,
      })
        .then(() => {
          showSuccess(toast, "Successfully Modified User");
        })
        .catch(() => {
          showFailure(toast, "Failed to Modify User");
        });
    } else {
      showFailure(toast, pwCheckReturnValidandError[1]);
    }
  };

  const tryToAddUser = () => {
    const pwCheckReturnValidandError = passwordValueCheck(password1, password2);
    if (pwCheckReturnValidandError[0]) {
      AUTH_API.addUser({
        username: userName,
        password: password1,
        password2: password2,
        is_staff: isAdmin,
      })
        .then(() => {
          showSuccess(toast, "Successfully Added User");
          navigate("/users");
        })
        .catch((error) => {
          showFailure(
            toast,
            error.data.errors?.username?.[0]
              ? "User with this username already exists"
              : "Failed to Add User"
          );
        });
    } else {
      showFailure(toast, pwCheckReturnValidandError[1]);
    }
  };

  const onSubmit = (): void => {
    logger.debug(
      "Add User Submitted:",
      userName,
      password1,
      password2,
      isAdmin
    );

    if (!isUserAddPage) {
      tryToModifyUser();
    } else {
      tryToAddUser();
    }
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-4">
      <BackButton className="ml-1" />
    </div>
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this user"}
      onConfirm={deleteUserFinal}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Right
  const submitButton = (
    <ConfirmPopup
      isButtonVisible={isPasswordChangeModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isPasswordChangeModifiable}
      buttonLabel={"Submit"}
      className="p-button-success ml-1 p-button-sm"
      classNameDiv="flex my-auto"
    />
  );

  const deleteButton = (
    <DeleteButton
      visible={!isUserAddPage}
      disabled={!isDeletable}
      onClick={deleteUserPopup}
      className={"ml-1 "}
    />
  );

  const rightButtons = (
    <div className="flex col-4 justify-content-end">{deleteButton}</div>
  );

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="flex col-12 p-0">
        {backButton}
        <div className="pt-2 col-4">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            {isUserAddPage ? "Add User" : "Modify User"}
          </h1>
        </div>
        {rightButtons}
      </div>
      <form onSubmit={onSubmit}>
        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-5 justify-content-end my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="user"
            >
              Username:
            </label>
          </div>
          <div className="col-7 justify-content-left flex">
            {isUserAddPage && (
              <InputText
                value={userName}
                disabled={!isPasswordChangeModifiable}
                onChange={(event: FormEvent<HTMLInputElement>) =>
                  setUserName(event.currentTarget.value)
                }
              />
            )}
            <p className="p-component p-text-secondary text-900 text-3xl text-center my-0">
              {!isUserAddPage && userName}
            </p>
          </div>
        </div>

        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-5 justify-content-end my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="user"
            >
              {isUserAddPage ? "Password:" : "Change Password:"}
            </label>
          </div>
          <div className="col-7">
            <Password
              value={password1}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setPassword1(event.currentTarget.value)
              }
              toggleMask
              header={pwCheckHeader}
              footer={pwCheckFooter}
              disabled={!isPasswordChangeModifiable}
              promptLabel="Choose a password"
              weakLabel="Too simple"
              mediumLabel="Average complexity"
              strongLabel="Complex password"
            />
          </div>
        </div>

        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-5 justify-content-end text-right my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="user"
            >
              {isUserAddPage
                ? "Password Confirm:"
                : "Confirm to Change Password:"}
            </label>
          </div>
          <div className="col-7">
            <Password
              value={password2}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setPassword2(event.currentTarget.value)
              }
              toggleMask
              disabled={!isPasswordChangeModifiable}
              feedback={false}
            />
          </div>
        </div>

        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-6 justify-content-end text-right my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="user"
            >
              Is Administrator:
            </label>
          </div>
          <div className="col-6 flex">
            <InputSwitch
              checked={isAdmin}
              disabled={!isAdminToggleModifiable}
              id="isAdmintoggle"
              name="isAdmintoggle"
              onChange={() => setIsAdmin(!isAdmin)}
              className={"my-auto"}
            />
          </div>
        </div>

        <div className="flex col-12 justify-content-center">{submitButton}</div>
      </form>
      {deletePopupVisible && deletePopup}
    </div>
  );
}
