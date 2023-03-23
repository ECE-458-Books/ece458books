import { useNavigate } from "react-router-dom";
import AddPageButton from "../../components/buttons/AddPageButton";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

import { GetUsersResp, USER_API } from "../../apis/users/UserAPI";
import {
  APIToInternalUserConversion,
  APIUserSortFieldMap,
} from "../../apis/users/UserConversion";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import { scrollToTop } from "../../util/WindowViewportOps";
import ListTemplate from "../../templates/list/ListTemplate";
import { TableColumn } from "../../components/datatable/TableColumns";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";

export interface User {
  id: string;
  userName: string;
  isAdmin: boolean;
}

export default function UserList() {
  const [numberOfUsers, setNumberOfUsers] = useState<number>(0); // The number of elements that match the query
  const [users, setUsers] = useState<User[]>([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not

  const COLUMNS: TableColumn<User>[] = [
    {
      field: "userName",
      header: "Username",
      sortable: true,
      style: { width: "70%" },
    },
    {
      field: "isAdmin",
      header: "Adminstrator Account?",
      sortable: true,
      style: { width: "30%" },
      customBody: (rowData: User) => {
        return rowData.isAdmin ? "Yes" : "No";
      },
    },
  ];

  // ----------------- METHODS -----------------
  // Navigator used to go to a different page
  const navigate = useNavigate();

  const toast = useRef<Toast>(null);

  // Calls the Users API
  const callAPI = (page: number, pageSize: number, sortField: string) => {
    USER_API.getUsers({
      page: page,
      page_size: pageSize,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetUsersResp) => {
    setUsers(response.results.map((user) => APIToInternalUserConversion(user)));
    setNumberOfUsers(response.count);
    setIsLoading(false);
  };

  const addUserButton = (
    <AddPageButton
      onClick={() => navigate("/users/add")}
      label="Add User"
      className="mr-2"
    />
  );

  const noPaginationSwitch = (
    <LabeledSwitch
      label="Show All"
      onChange={() => {
        if (!isNoPagination) {
          scrollToTop();
        }
        setIsNoPagination(!isNoPagination);
      }}
      value={isNoPagination}
    />
  );

  const selectSizeButton = (
    <SelectSizeDropdown
      value={tableWhitespaceSize}
      onChange={(e) => setTableWhitespaceSize(e.value)}
    />
  );

  const dataTable = (
    <ListTemplate
      columns={COLUMNS}
      detailPageURL={"/users/detail/"}
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfUsers}
      setTotalNumberOfEntries={setNumberOfUsers}
      rows={users}
      APISortFieldMap={APIUserSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={noPaginationSwitch}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      <div className="flex justify-content-end">
        <div className="card col-9 pt-0 px-3 justify-content-center;">
          <Toast ref={toast} />
          {dataTable}
        </div>
        <div
          className="flex justify-content-end align-items-start mr-1 my-2"
          style={{ width: "12.4%" }}
        >
          {addUserButton}
        </div>
      </div>
    </div>
  );
}
