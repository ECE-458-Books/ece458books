import { useState } from "react";
import LoginPage, {
  AccessType,
  administrator,
  user,
} from "./pages/auth/LoginPage";
import Router from "./components/navigation/Router";
import { USER_API } from "./apis/users/UserAPI";

function App() {
  const [currentUser, setCurrentUser] = useState<AccessType | undefined>();

  if (!currentUser && localStorage.getItem("accessToken") === null) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  if (!currentUser && localStorage.getItem("accessToken") !== null) {
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
    <>
      <Router onLogout={setCurrentUser} />
    </>
  );
}

export default App;
