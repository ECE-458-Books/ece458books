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
} from "../../util/PWValueCheck";
import { showFailure, showSuccess } from "../../components/Toast";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import DeletePopup from "../../components/popups/DeletePopup";
import DeleteButton from "../../components/buttons/DeleteButton";
import { USER_API } from "../../apis/users/UserAPI";

export default function VendorAdd() {
  // From URL
  const { id } = useParams();
  const isUserAddPage = id === undefined;
  const [isModifiable] = useState<boolean>(true);

  const [userName, setUserName] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is visible
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPageDeleteable, setIsPageDeleteable] = useState<boolean>(true);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Load the Genre data on page load
  useEffect(() => {
    USER_API.getUserDetail({ id: id! })
      .then((response) => {
        setUserName(response.username);
        setIsAdmin(response.is_staff);
      })
      .catch(() => showFailure(toast, "Could not fetch user data"));
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
    USER_API.deleteUser({
      id: id!,
    })
      .then(() => {
        showSuccess(toast, "User Deleted");
        navigate("/users");
      })
      .catch(() => showFailure(toast, "User Failed to Delete"));
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
      if (password1 === "" && password2 === "") {
        const pwCheckRet = passwordValueCheck(password1, password2);
        if (pwCheckRet[0]) {
          USER_API.modifyUser({
            id: id,
            password_1: password1,
            password_2: password2,
            is_staff: isAdmin,
          });
        } else {
          showFailure(toast, pwCheckRet[1]);
        }
      } else {
        USER_API.modifyUser({
          id: id,
          password_1: password1,
          password_2: password2,
          is_staff: isAdmin,
        });
      }
    } else {
      const pwCheckRet = passwordValueCheck(password1, password2);
      if (pwCheckRet[0]) {
        USER_API.addUser({
          username: userName,
          password_1: password1,
          password_2: password2,
          is_staff: isAdmin,
        });
      } else {
        showFailure(toast, pwCheckRet[1]);
      }
    }
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-4">
      <BackButton onClick={() => navigate("/users")} className="ml-1" />
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
      isButtonVisible={isModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      label={"Submit"}
      className="p-button-success ml-1 p-button-sm"
      classNameDiv="flex my-auto"
    />
  );

  const deleteButton = (
    <DeleteButton
      visible={!isUserAddPage}
      disabled={!isPageDeleteable}
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
              htmlFor="genre"
            >
              User Name:
            </label>
          </div>
          <div className="col-7 justify-content-left flex">
            {isUserAddPage && (
              <InputText
                value={userName}
                disabled={!isModifiable}
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
              htmlFor="genre"
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
              disabled={!isModifiable}
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
              htmlFor="genre"
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
              disabled={!isModifiable}
              feedback={false}
            />
          </div>
        </div>

        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-6 justify-content-end text-right my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="genre"
            >
              Is Administrator:
            </label>
          </div>
          <div className="col-6 flex">
            <InputSwitch
              checked={isAdmin}
              disabled={!isModifiable}
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
