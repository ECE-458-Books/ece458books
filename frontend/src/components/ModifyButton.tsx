import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

interface ModifyButtonProps {
  path: string;
}

export default function ModifyButton(props: ModifyButtonProps) {
  const navigate = useNavigate();

  return (
    <div>
      <Button label="Modify" onClick={() => navigate(props.path)} />
    </div>
  );
}
