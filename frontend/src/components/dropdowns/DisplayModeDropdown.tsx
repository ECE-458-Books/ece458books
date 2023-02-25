import { Dropdown } from "primereact/dropdown";

export enum DisplayMode {
  COVER_OUT = "Cover Out",
  SPINE_OUT = "Spine Out",
}

const displayModeList = Object.values(DisplayMode);

export interface DisplayModeDropdownProps {
  setSelectedDisplayMode: (arg0: DisplayMode) => void;
  selectedDisplayMode: DisplayMode;
}

// This cannot be used in a table cell in the current form, only when there is one on the page
export default function DisplayModeDropdown(props: DisplayModeDropdownProps) {
  return (
    <Dropdown
      value={props.selectedDisplayMode}
      options={displayModeList}
      appendTo={"self"}
      onChange={(e) => props.setSelectedDisplayMode(e.value)}
      placeholder={"Select Display Mode"}
    />
  );
}
