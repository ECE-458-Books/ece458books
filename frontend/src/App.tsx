import { useState } from "react";
import LoginPage, { AccessType } from "./pages/auth/LoginPage";
import Router from "./components/navigation/Router";
import { BrowserRouter } from "react-router-dom";

function App() {
  const [currentUser, setCurrentUser] = useState<AccessType | undefined>();

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  const logout = () => {
    setCurrentUser(undefined);
  };

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;
