import { useEffect, useState } from "react";
import Router from "./components/navigation/Router";
import { USER_API } from "./apis/users/UserAPI";
import PermissionProvider from "./permissions/PermissionProvider";
import { AccessType, administrator, user } from "./util/auth/UserTypes";
import LoginPage from "./pages/auth/LoginPage";
import IsUserLoggedIn from "./util/auth/CheckLoginStatus";
import { useLocation, useNavigate } from "react-router-dom";

function App() {
  const [currentUser, setCurrentUser] = useState<AccessType | undefined>();
  const navigate = useNavigate();
  const location = useLocation();

  // When the user is updated (or when visiting the site on a new tab), we re-run the code inside this block
  useEffect(() => {
    /* If access token is over 1 day old or not valid, we set URL
    to the login page. The actual component that is shown 
    is defined below the useEffect */
    if (!IsUserLoggedIn()) {
      navigate("/");
    } else {
      USER_API.getUserType()
        .then((response) => {
          if (response.is_staff) {
            setCurrentUser(administrator);
          } else {
            setCurrentUser(user);
          }
          if (location.pathname == "/") {
            navigate("/books");
          }
        })
        .catch(() => {
          navigate("/");
        });
    }
  }, [currentUser]);

  // Decide what to render based on the state of authentication.
  // This assumes that all access tokens less than 1 day old are valid
  if (!IsUserLoggedIn()) {
    return <LoginPage onLogin={setCurrentUser} />;
  }
  return (
    <PermissionProvider permissions={currentUser?.permissions ?? []}>
      <Router
        onLogout={() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userID");
          localStorage.removeItem("loginTime");
          localStorage.removeItem("refreshToken");
          setCurrentUser(undefined);
        }}
        currentUser={currentUser}
      />
    </PermissionProvider>
  );
}

export default App;
