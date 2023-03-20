export default function IsUserLoggedIn() {
  const loginTime = localStorage.getItem("loginTime");
  const accessToken = localStorage.getItem("accessToken");
  const now = new Date();

  return accessToken && loginTime && AddOneDay(loginTime!) > now;
}

function AddOneDay(dateStr: string) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date;
}
