import { useNavigate } from "react-router-dom";
import AddPageButton from "../../components/buttons/AddPageButton";
import { Toast } from "primereact/toast";
import { useRef } from "react";

export interface User {
  id: string;
  userName: string;
  isAdmin: boolean;
}

export default function UserList() {
  // ----------------- METHODS -----------------
  // Navigator used to go to a different page
  const navigate = useNavigate();

  const toast = useRef<Toast>(null);

  const addGenreButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/users/add")}
        label="Add User"
        className="mr-2"
      />
    </div>
  );

  return (
    <div>
      <div className="grid flex m-1">{addGenreButton}</div>
      <div className="flex justify-content-center">
        <div className="card col-8 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
        </div>
      </div>
    </div>
  );
}
