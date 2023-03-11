import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  className?: string;
}

export default function BackButton(props: BackButtonProps) {
  // The navigator to switch pages
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      label="Back"
      icon="pi pi-arrow-left"
      onClick={() => navigate(-1)}
      className={"p-button-sm my-auto " + props.className}
    />
  );
}
