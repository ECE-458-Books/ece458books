import { useEffect, useRef, useState } from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useParams } from "react-router-dom";
import { Book, emptyBook } from "../list/BookList";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { APIBook, BOOKS_API } from "../../apis/BooksAPI";
import { FormikErrors, useFormik } from "formik";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { CommaSeparatedStringToArray } from "../../util/StringOperations";
import { Image } from "primereact/image";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import GenreDropdown from "../../components/dropdowns/GenreDropdown";
import { IMAGES_API } from "../../apis/ImagesAPI";
import ImageUploader from "../../components/uploaders/ImageFileUploader";
import { showFailure, showSuccess } from "../../components/Toast";
import { InputSwitch } from "primereact/inputswitch";
import { APIToInternalBookConversion } from "../../apis/Conversions";

interface ErrorDisplay {
  message: string;
}

interface ImageUrlHashStruct {
  imageSrc: string;
  imageHash: number;
}

export default function BookDetail() {
  // From URL
  const { id } = useParams();
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  const [originalBookData, setOriginalBookData] = useState<Book>(emptyBook);
  const [title, setTitle] = useState<string>("");
  const [authors, setAuthors] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [isbn13, setISBN13] = useState<number>(0);
  const [isbn10, setISBN10] = useState<number>(0);
  const [publisher, setPublisher] = useState<string>("");
  const [pubYear, setPubYear] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [thickness, setThickness] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [image, setImage] = useState<ImageUrlHashStruct>({
    imageSrc: "",
    imageHash: Date.now(),
  });

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);

  // Load the book data on page load
  useEffect(() => {
    BOOKS_API.getBookDetail({ id: id! })
      .then((response) => {
        console.log(response);
        const book = APIToInternalBookConversion(response);
        setOriginalBookData(book);
        setTitle(book.title);
        setAuthors(book.author);
        setGenre(book.genres);
        setISBN13(book.isbn13);
        setISBN10(book.isbn10);
        setPublisher(book.publisher);
        setPubYear(book.publishedYear);
        setPageCount(book.pageCount);
        setPrice(book.retailPrice);
        setWidth(book.width);
        setHeight(book.height);
        setThickness(book.thickness);
        setStock(book.stock);
      })
      .catch(() => showFailure(toast, "Could not fetch book data"));
  }, []);

  // Load the book image on page load
  useEffect(() => {
    IMAGES_API.getImage({ id: id! })
      .then((response) =>
        setImage({
          imageSrc: response.url,
          imageHash: Date.now(),
        })
      )
      .catch(() =>
        showFailure(toast, "Image Cannot be Retrieved to Update Display")
      );
  }, []);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

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
        showFailure(toast, errors.message);
      }

      return errors;
    },
    onSubmit: () => {
      // TOOD: Change this to use InternalToAPIBookConversion
      const book: APIBook = {
        id: Number(id!),
        title: title,
        authors: CommaSeparatedStringToArray(authors),
        genres: [genre],
        isbn_13: isbn13,
        isbn_10: isbn10,
        publisher: publisher,
        publishedDate: pubYear,
        pageCount: pageCount,
        retail_price: price,
        width: width,
        height: height,
        thickness: thickness,
        stock: 0,
        urls: [""],
      };
      logger.debug("Submitting Book Modify", book);
      BOOKS_API.modifyBook({ book: book })
        .then(() => showSuccess(toast, "Book Edited"))
        .catch(() => showFailure(toast, "Could not modify book"));
      formik.resetForm();
    },
  });

  //Restore the original Page load data back when edit toggle is turned off
  useEffect(() => {
    if (!isModifiable) {
      setGenre(originalBookData.genres);
      setHeight(originalBookData.height);
      setWidth(originalBookData.width);
      setThickness(originalBookData.thickness);
      setPageCount(originalBookData.pageCount);
      setPrice(originalBookData.retailPrice);
    }
  }, [isModifiable]);

  // The dropdown configuration for each cell
  const genreDropdown = GenreDropdown({
    setSelectedGenre: setGenre,
    selectedGenre: genre,
    isModifiable: !isModifiable,
  });

  const uploadImageFileHandler = (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    IMAGES_API.uploadImage({ id: id!, image: file })
      .then(() => {
        IMAGES_API.getImage({ id: id! })
          .then((response) =>
            setImage({
              imageSrc: response.url,
              imageHash: Date.now(),
            })
          )
          .catch(() =>
            showFailure(toast, "Image Cannot be Retrieved to Update Display")
          );

        showSuccess(toast, "Image Uploaded Successfully");
      })
      .catch(() => showFailure(toast, "Image Upload Failed"));
    event.options.clear();
  };

  const imageDeleteSubtmit = () => {
    showSuccess(toast, "Image Deleted");
  };

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="col-12">
        <h1 className="p-component p-text-secondary my-3 text-5xl text-center text-900 color: var(--surface-800);">
          Book Details
        </h1>
      </div>
      <Image
        src={`${image.imageSrc}?${image.imageHash}`}
        id="imageONpage"
        alt="Image"
        height="350"
        className="col-12 align-items-center flex justify-content-center"
      />
      <div className="col-12">
        <ConfirmPopup
          className={"p-button-danger"}
          isVisible={isConfirmationPopupVisible}
          hideFunc={() => setIsConfirmationPopupVisible(false)}
          acceptFunc={() => {
            imageDeleteSubtmit;
          }}
          rejectFunc={() => {
            console.log("reject");
          }}
          buttonClickFunc={() => {
            setIsConfirmationPopupVisible(true);
          }}
          disabled={!isModifiable}
          label={"Delete Cover Image"}
        />
        <ImageUploader
          disabled={!isModifiable}
          uploadHandler={uploadImageFileHandler}
        />
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex col-12 justify-content-center p-1">
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="title"
            >
              Title:
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center my-0">
              {title}
            </p>
          </div>
        </div>
        <div className="flex col-12 justify-content-center p-1">
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="authors"
            >
              Author(s):
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {authors}
            </p>
          </div>
        </div>
        <div className="flex col-12 justify-content-evenly p-1">
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="isbn13"
            >
              ISBN13:
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {isbn13}
            </p>
          </div>
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="isbn10"
            >
              ISBN10:
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {isbn10}
            </p>
          </div>
        </div>
        <div className="flex col-12 justify-content-around p-1">
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="publisher"
            >
              Publisher:
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {publisher}
            </p>
          </div>
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="pubYear"
            >
              Publication Year:
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {pubYear}
            </p>
          </div>
        </div>
        <div className="flex col-12 justify-content-center p-1">
          <div className="flex p-0 col-4">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="genre"
            >
              Genre:
            </label>
            {genreDropdown}
          </div>
        </div>
        <h1 className="p-component p-text-secondary mb-1 mt-2 p-0 text-xl text-center text-900 color: var(--surface-800);">
          Dimensions (cm)
        </h1>
        <div className="flex col-12 justify-content-around p-1">
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="height"
            >
              Height:
            </label>
            <InputNumber
              id="height"
              className="w-4"
              name="height"
              value={height}
              maxFractionDigits={15}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setHeight(e.value ?? 0)
              }
            />
          </div>
          <div className="flex p-0 mx-4">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="width"
            >
              Width:
            </label>
            <InputNumber
              id="width"
              className="w-4"
              name="width"
              value={width}
              disabled={!isModifiable}
              maxFractionDigits={15}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setWidth(e.value ?? 0)
              }
            />
          </div>
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="thickness"
            >
              Thickness:
            </label>
            <InputNumber
              id="thickness"
              className="w-4"
              name="thickness"
              value={thickness}
              maxFractionDigits={15}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setThickness(e.value ?? 0)
              }
            />
          </div>
        </div>
        <div className="flex col-12 justify-content-center p-1">
          <div className="flex p-0 col-5 -ml-2">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="pageCount"
            >
              Page Count:
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
        </div>
        <div className="flex col-12 justify-content-around p-1">
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="genre"
            >
              Inventory Count:
            </label>
            <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
              {stock}
            </p>
          </div>
          <div className="flex p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="retail_price"
            >
              Retail Price ($):
            </label>
            <InputNumber
              id="retail_price"
              className="w-4"
              name="retail_price"
              value={price}
              maxFractionDigits={15}
              disabled={!isModifiable}
              onValueChange={(e: InputNumberValueChangeEvent) =>
                setPrice(e.value ?? 0)
              }
            />
          </div>
        </div>

        <div className="grid col-12 justify-content-evenly">
          <div className="flex col-2 p-0">
            <label
              className="p-component p-text-secondary text-teal-900 my-auto mr-2"
              htmlFor="retail_price"
            >
              {isModifiable ? "Reset?" : "Edit?"}
            </label>
            <InputSwitch
              checked={isModifiable}
              id="modifyBookToggle"
              name="modifyBookToggle"
              onChange={() => setIsModifiable(!isModifiable)}
              className="my-auto "
            />
          </div>

          <ConfirmPopup
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
