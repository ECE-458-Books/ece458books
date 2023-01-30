import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

interface ModifyButtonProps {
  path: string;
}

export default function ModifyButton(props: ModifyButtonProps) {
  const navigate = useNavigate();
  const modifyPage = () => {
    navigate(props.path);
  };
  return (
    <div>
      <Button label="Modify" onClick={modifyPage} />
    </div>
  );
}
