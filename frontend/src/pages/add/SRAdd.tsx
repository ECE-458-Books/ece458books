import { useState } from "react";
import { SRDetailState } from "../detail/SRDetail";
import { useNavigate } from "react-router-dom";
import { logger } from "../../util/Logger";
import { v4 as uuid } from "uuid";

export default function GenreAdd() {
  // The navigator to switch pages
  const navigate = useNavigate();

  const onSubmit = (): void => {
    logger.debug("Add Sales Reconciliation ReRoute");
    const detailState: SRDetailState = {
      date: new Date().getDate(),
      data: [
        {
          rowID: uuid(),
          books: "",
          quantity: 1,
          retailPrice: 0,
        },
      ],
      isAddPageState: true,
      isModifiable: true,
      isConfirmationPopupVisible: false,
    };

    navigate("/sales-reconciliations/detail", { state: detailState });
  };

  return onSubmit;
}
