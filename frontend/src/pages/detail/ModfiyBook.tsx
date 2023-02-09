import { FormEvent, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";
import { useLocation } from "react-router-dom";
import { Book } from "../list/BookList";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { BOOKS_API } from "../../apis/BooksAPI";
import { FormikErrors, useFormik } from "formik";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";

export interface BookDetailState {
  book: Book;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

interface ErrorDisplay {
  message: string;
}

export default function BookDetail() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as BookDetailState;
  const [id, setId] = useState(detailState.book.id);
  const [title, setTitle] = useState(detailState.book.title);
  const [authors, setAuthors] = useState(detailState.book.author);
  const [genre, setGenre] = useState(detailState.book.genres);
  const [isbn13, setISBN13] = useState(detailState.book.isbn_13);
  const [isbn10, setISBN10] = useState(detailState.book.isbn10);
  const [publisher, setPublisher] = useState(detailState.book.publisher);
  const [pubYear, setPubYear] = useState(detailState.book.publishedYear);
  const [pageCount, setPageCount] = useState(detailState.book.pageCount);
  const [price, setPrice] = useState(detailState.book.retail_price);
  const [width, setWidth] = useState(detailState.book.width);
  const [height, setHeight] = useState(detailState.book.height);
  const [thickness, setThickness] = useState(detailState.book.thickness);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Book Edited" });
  };

  const showFailure = (message: string) => {
    toast.current?.show({ severity: "error", summary: message });
  };

  // Validation for the form
  const formik = useFormik({
    initialValues: {},

    validate: () => {
      const errors: FormikErrors<ErrorDisplay> = {};

      if (!genre) {
        errors.message = "Genre is a required field";
      }

      if (!price) {
        errors.message = "Retail Price is a required Field";
      }

      if (errors.message) {
        showFailure(errors.message);
      }

      return errors;
    },
    onSubmit: () => {
      const book: Book = {
        id: id,
        title: title,
        author: authors,
        genres: genre,
        isbn_13: isbn13,
        isbn10: isbn10,
        publisher: publisher,
        publishedYear: pubYear,
        pageCount: pageCount,
        retail_price: price,
        width: width,
        height: height,
        thickness: thickness,
        stock: 0,
      };
      logger.debug("Submitting Book Modify", book);
      BOOKS_API.modifyBook(book);
      showSuccess();
      formik.resetForm();
    },
  });

  return (
    <div className="grid flex justify-content-center">
      <div className="col-12">
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
          Book Details
        </h1>
      </div>
      <form onSubmit={formik.handleSubmit} className="col-12">
        <Toast ref={toast} />
        <div className="grid col-offset-1 col-11 justify-content-center">
          <div className="col-4 card justify-content-center">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="title"
            >
              Title
            </label>
            <InputText
              id="title"
              className="w-8"
              name="title"
              value={title}
              disabled={true}
              onChange={(event: FormEvent<HTMLInputElement>): void => {
                setTitle(event.currentTarget.value);
              }}
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="authors"
            >
              Authors
            </label>
            <InputText
              id="authors"
              className="w-8"
              name="authors"
              value={authors}
              disabled={true}
              onChange={(event: FormEvent<HTMLInputElement>): void => {
                setAuthors(event.currentTarget.value);
              }}
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="isbn13"
            >
              ISBN13
            </label>
            <InputNumber
              id="isbn13"
              className="w-6"
              name="isbn13"
              value={isbn13}
              disabled={true}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setISBN13(e.value ?? 0)
              }
            />
          </div>
        </div>
        <div className="grid col-offset-1 col-11 justify-content-center">
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="isbn10"
            >
              ISBN10
            </label>
            <InputNumber
              id="isbn10"
              className="w-6"
              name="isbn10"
              value={isbn10}
              disabled={true}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setISBN10(e.value ?? 0)
              }
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="publisher"
            >
              Publisher
            </label>
            <InputText
              id="publisher"
              className="w-8"
              name="publisher"
              value={publisher}
              disabled={true}
              onChange={(event: FormEvent<HTMLInputElement>): void => {
                setPublisher(event.currentTarget.value);
              }}
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="pubYear"
            >
              Publication Year
            </label>
            <InputNumber
              id="pubYear"
              className="w-4"
              name="pubYear"
              value={pubYear}
              disabled={true}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setPubYear(e.value ?? 0)
              }
            />
          </div>
        </div>
        <div className="grid col-offset-1 col-11 justify-content-center">
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="pageCount"
            >
              Page Count
            </label>
            <InputNumber
              id="pageCount"
              className="w-4"
              name="pageCount"
              value={pageCount}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setPageCount(e.value ?? 0)
              }
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="width"
            >
              Width
            </label>
            <InputNumber
              id="width"
              className="w-4"
              name="width"
              value={width}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setWidth(e.value ?? 0)
              }
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="height"
            >
              Height
            </label>
            <InputNumber
              id="height"
              className="w-4"
              name="height"
              value={height}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setHeight(e.value ?? 0)
              }
            />
          </div>
        </div>
        <div className="grid col-offset-1 col-11 justify-content-center">
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="thickness"
            >
              Dimensions
            </label>
            <InputNumber
              id="thickness"
              className="w-4"
              name="thickness"
              value={thickness}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setThickness(e.value ?? 0)
              }
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="retail_price"
            >
              Retail Price
            </label>
            <InputNumber
              id="retail_price"
              className="w-4"
              name="retail_price"
              value={price}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setPrice(e.value ?? 0)
              }
            />
          </div>
          <div className="col-4">
            <label
              className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
              htmlFor="genre"
            >
              Genre
            </label>
            <InputText
              id="genre"
              className="w-8"
              name="genre"
              value={genre}
              disabled={!isModifiable}
              onChange={(event: FormEvent<HTMLInputElement>): void => {
                setGenre(event.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div className="grid col-12 justify-content-evenly">
          <ToggleButton
            className=""
            id="modifyBookToggle"
            name="modifyBookToggle"
            onLabel="Editable"
            offLabel="Edit"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={isModifiable}
            onChange={() => setIsModifiable(!isModifiable)}
          />

          <ConfirmButton
            isVisible={isConfirmationPopupVisible}
            hideFunc={() => setIsConfirmationPopupVisible(false)}
            acceptFunc={formik.handleSubmit}
            rejectFunc={() => {
              console.log("reject");
            }}
            buttonClickFunc={() => {
              setIsConfirmationPopupVisible(true);
            }}
            disabled={!isModifiable}
            label={"Update"}
            className="p-button-success p-button-raised"
          />
        </div>
        {/* Maybe be needed in case the confrim button using the popup breaks */}
        {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
      </form>
    </div>
  );
}
