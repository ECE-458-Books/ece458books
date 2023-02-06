import React, { FormEvent, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

export default function GenreAdd() {
  const [textBox, setTextBox] = useState("");

  const onSubmit = (): void => {
    console.log(textBox);
  };

  return onSubmit;
}
