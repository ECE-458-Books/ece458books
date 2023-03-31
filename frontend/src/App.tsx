import { useEffect, useState } from "react";
import Router from "./components/navigation/Router";
import { AUTH_API } from "./apis/auth/AuthAPI";
import PermissionProvider from "./permissions/PermissionProvider";
import { AccessType, administrator, user } from "./util/auth/UserTypes";
import LoginPage from "./pages/auth/LoginPage";
import IsUserLoggedIn from "./util/auth/CheckLoginStatus";
import { useLocation, useNavigate } from "react-router-dom";
import MobileRouter from "./components/navigation/MobileRouter";

function App() {
  const [currentUser, setCurrentUser] = useState<AccessType | undefined>();
  const navigate = useNavigate();
  const location = useLocation();
  const deviceDetails = navigator.userAgent;
  const regexp = /android|iphone|kindle|ipad/i;
  const isMobileDevice = regexp.test(deviceDetails);

  // When the user is updated (or when visiting the site on a new tab), we re-run the code inside this block
  useEffect(() => {
    /* If access token is over 1 day old or not valid, we set URL
    to the login page. The actual component that is shown 
    is defined below the useEffect */
    if (!IsUserLoggedIn()) {
      navigate("/");
    } else {
      if (location.pathname == "/") {
        navigate(isMobileDevice ? "/books/lookup" : "/books");
      }
      AUTH_API.getUserType()
        .then((response) => {
          if (response.is_staff) {
            setCurrentUser(administrator);
          } else {
            setCurrentUser(user);
          }
        })
        .catch(() => {
          navigate("/");
        });
    }
  }, [currentUser]);

  // Decide what to render based on the state of authentication.
  // This assumes that all access tokens less than 1 day old are valid
  if (!IsUserLoggedIn() || location.pathname == "/") {
    return (
      <LoginPage IsMobileDevice={isMobileDevice} onLogin={setCurrentUser} />
    );
  }

  const desktopRouterAndPages = (
    <Router
      onLogout={() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userID");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUsername");
        setCurrentUser(undefined);
      }}
      currentUser={currentUser}
    />
  );

  const mobileRouterAndPages = (
    <MobileRouter
      onLogout={() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userID");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUsername");
        setCurrentUser(undefined);
      }}
      currentUser={currentUser}
    />
  );

  return (
    <PermissionProvider permissions={currentUser?.permissions ?? []}>
      {isMobileDevice ? mobileRouterAndPages : desktopRouterAndPages}
    </PermissionProvider>
  );
}

export default App;
