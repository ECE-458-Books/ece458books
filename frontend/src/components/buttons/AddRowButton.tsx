import { Button } from "primereact/button";
import { useState } from "react";
import { v4 as uuid } from "uuid";

interface IDer {
  id: string | number;
}

interface AddRowButtonProps<T extends IDer> {
  emptyItem: T;
  rows: T[];
  setRows: (items: T[]) => void;
  isModifiable?: boolean;
}

export default function AddRowButton<T extends IDer>(
  props: AddRowButtonProps<T>
) {
  const [lineData, setLineData] = useState<T>(props.emptyItem);

  const addNewRow = () => {
    setLineData(props.emptyItem);
    const _lineData = lineData;
    _lineData.id = uuid();
    setLineData(_lineData);
    const _data = [...props.rows];
    _data.push({ ...lineData });
    props.setRows(_data);
  };

  return (
    <Button
      type="button"
      label="New"
      icon="pi pi-plus"
      className="p-button-info mr-2"
      onClick={addNewRow}
      disabled={!!props.isModifiable}
    />
  );
}
