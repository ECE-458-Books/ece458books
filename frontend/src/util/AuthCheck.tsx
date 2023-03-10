import { useNavigate } from "react-router";
import LoginPage from "../pages/auth/LoginPage";

export default function GoToLoginPageIfNotLoggedIn() {
  const loginTime = localStorage.getItem("loginTime");
  const now = new Date();
  const navigate = useNavigate();

  // if (localStorage.getItem("accessToken") == null) {
  //   navigate("/");
  //   return <LoginPage />;
  // }

  // if (!loginTime || AddOneDay(loginTime!) < now) {
  //   navigate("/");
  //   return <LoginPage />;
  // }
}

function AddOneDay(dateStr: string) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date;
}
