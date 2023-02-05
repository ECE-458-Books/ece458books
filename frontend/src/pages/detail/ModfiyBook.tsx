import React, { FormEvent, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";
import { useLocation } from "react-router-dom";
import { Book } from "../list/BookList";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";

interface BookDetailState {
  book: Book;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export default function BookDetail() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as BookDetailState;
  const [title, setTitle] = useState(detailState.book.title);
  const [authors, setAuthors] = useState(detailState.book.authors);
  const [isbn, setISBN] = useState(detailState.book.isbn13);
  const [publisher, setPublisher] = useState(detailState.book.publisher);
  const [pubYear, setPubYear] = useState(detailState.book.publishedYear);
  const [pageCount, setPageCount] = useState(detailState.book.pageCount);
  const [genres, setGenres] = useState(detailState.book.genres);
  const [price, setPrice] = useState(detailState.book.retailPrice);
  const [width, setWidth] = useState(detailState.book.width);
  const [height, setHeight] = useState(detailState.book.height);
  const [thickness, setThickness] = useState(detailState.book.thickness);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const onSubmit = (): void => {
    setIsModifiable(false);
  };

  // TODO: Fix these set functions
  const setAuthorsModified = (authors: string[]): void => {
    setAuthors(authors);
  };

  // TODO: Fix these set functions
  const setGenresModified = (genres: string[]): void => {
    setGenres(genres);
  };

  return (
    <div>
      <h1>Modify Book</h1>
      <form onSubmit={onSubmit}>
        <ToggleButton
          id="modifyBookToggle"
          name="modifyBookToggle"
          onLabel="Modifiable"
          offLabel="Modify"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
          checked={isModifiable}
          onChange={() => setIsModifiable(!isModifiable)}
        />

        <label htmlFor="title">Title</label>
        <InputText
          id="title"
          className="p-inputtext-sm"
          name="title"
          value={title}
          disabled={true}
          onChange={(event: FormEvent<HTMLInputElement>): void => {
            setTitle(event.currentTarget.value);
          }}
        />

        <label htmlFor="authors">Authors</label>
        <InputText
          id="authors"
          className="p-inputtext-sm"
          name="authors"
          value={authors[0]}
          disabled={true}
          onChange={(event: FormEvent<HTMLInputElement>): void => {
            setAuthors([event.currentTarget.value]);
          }}
        />

        <label htmlFor="isbn">ISBN</label>
        <InputNumber
          id="isbn"
          className="p-inputtext-sm"
          name="isbn"
          value={isbn}
          disabled={true}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setISBN(e.value ?? 0)
          }
        />

        <label htmlFor="publisher">Publisher</label>
        <InputText
          id="publisher"
          className="p-inputtext-sm"
          name="publisher"
          value={publisher}
          disabled={true}
          onChange={(event: FormEvent<HTMLInputElement>): void => {
            setPublisher(event.currentTarget.value);
          }}
        />

        <label htmlFor="pubYear">Publication Year</label>
        <InputNumber
          id="pubYear"
          className="p-inputtext-sm"
          name="pubYear"
          value={pubYear}
          disabled={true}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setPubYear(e.value ?? 0)
          }
        />

        <label htmlFor="pageCount">Page Count</label>
        <InputNumber
          id="pageCount"
          className="p-inputtext-sm"
          name="pageCount"
          value={pageCount}
          disabled={!isModifiable}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setPageCount(e.value ?? 0)
          }
        />

        <label htmlFor="width">Dimensions</label>
        <InputNumber
          id="width"
          className="p-inputtext-sm"
          name="width"
          value={width}
          disabled={!isModifiable}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setWidth(e.value ?? 0)
          }
        />

        <label htmlFor="retailPrice">Retail Price</label>
        <InputNumber
          id="retailPrice"
          className="p-inputtext-sm"
          name="retailPrice"
          value={price}
          disabled={!isModifiable}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setPrice(e.value ?? 0)
          }
        />

        <label htmlFor="genre">Genre</label>
        <InputText
          id="genre"
          className="p-inputtext-sm"
          name="genre"
          value={genres[0]}
          disabled={!isModifiable}
          onChange={(event: FormEvent<HTMLInputElement>): void => {
            setGenresModified([event.currentTarget.value]);
          }}
        />

        <ConfirmButton
          isVisible={isConfirmationPopupVisible}
          hideFunc={() => setIsConfirmationPopupVisible(false)}
          acceptFunc={onSubmit}
          rejectFunc={() => {
            console.log("reject");
          }}
          buttonClickFunc={() => {
            setIsConfirmationPopupVisible(true);
          }}
          disabled={!isModifiable}
          label={"Submit"}
        />
        {/* Maybe be needed in case the confrim button using the popup breaks */}
        {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
      </form>
    </div>
  );
}
