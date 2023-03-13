import { useState } from "react";
import Router from "./components/navigation/Router";
import { USER_API } from "./apis/users/UserAPI";
import PermissionProvider from "./permissions/PermissionProvider";
import { AccessType, administrator, user } from "./util/auth/UserTypes";
import LoginPage from "./pages/auth/LoginPage";
import IsUserLoggedIn from "./util/auth/CheckLoginStatus";
import { useNavigate } from "react-router-dom";

function App() {
  const [currentUser, setCurrentUser] = useState<AccessType | undefined>();
  const navigate = useNavigate();

  if (!currentUser || !IsUserLoggedIn()) {
    navigate("/");
    return <LoginPage onLogin={setCurrentUser} />;
  } else {
    USER_API.getUserType()
      .then((response) => {
        if (response.is_staff) {
          setCurrentUser(administrator);
        } else {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        return <LoginPage onLogin={setCurrentUser} />;
      });
  }

  return (
    <PermissionProvider permissions={currentUser?.permissions ?? []}>
      <Router onLogout={setCurrentUser} currentUser={currentUser} />
    </PermissionProvider>
  );
}

export default App;
