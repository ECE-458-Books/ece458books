import { useEffect, useRef, useState } from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useNavigate, useParams } from "react-router-dom";
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
import { GenresDropdownData } from "../../components/dropdowns/GenreDropdown";
import { IMAGES_API } from "../../apis/ImagesAPI";
import ImageUploader from "../../components/uploaders/ImageFileUploader";
import { showFailure, showSuccess } from "../../components/Toast";
import { APIToInternalBookConversion } from "../../apis/Conversions";
import { Button } from "primereact/button";
import GenreDropdown from "../../components/dropdowns/GenreDropdown";
import BookDetailLineItems, { BookDetailLineItem } from "./BookDetailLineItems";

interface ErrorDisplay {
  message: string;
}

// Leaving this line in case of future image browser side caching workaround is needed
interface ImageUrlHashStruct {
  imageSrc: string;
  imageHash: string;
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
  const [pageCount, setPageCount] = useState<number>();
  const [price, setPrice] = useState<number>(0);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [thickness, setThickness] = useState<number>();
  const [stock, setStock] = useState<number>(0);
  const [lineItems, setLineItems] = useState<BookDetailLineItem[]>([]);
  // Leaving this line in case of future image browser side caching workaround is needed
  const [image, setImage] = useState<ImageUrlHashStruct>({
    imageSrc: "",
    imageHash: Date.now().toString(),
  });
  //const [image, setImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File>(new File([""], "filename"));
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [
    isConfirmationPopupVisibleImageDelete,
    setIsConfirmationPopupVisibleImageDelete,
  ] = useState<boolean>(false);
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]);

  // Load the book data on page load
  useEffect(() => {
    BOOKS_API.getBookDetail({ id: id! })
      .then((response) => {
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
        setLineItems(book.lineItems!);
      })
      .catch(() => showFailure(toast, "Could not fetch book data"));

    IMAGES_API.getImage({ id: id! })
      .then((response) => {
        setImage({
          imageSrc: response.url,
          imageHash: Date.now().toString(),
        });
      })
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
        url: "",
      };
      logger.debug("Submitting Book Modify", book);
      BOOKS_API.modifyBook({
        book: book,
        image: imageFile,
        isImageUploaded: isImageUploaded,
        isImageRemoved: isImageRemoved,
      })
        .then(() => {
          showSuccess(toast, "Book Edited");
          IMAGES_API.getImage({ id: id! })
            .then((response) => {
              //setImage(response.url);
              setImage({
                imageSrc: response.url,
                imageHash: Date.now().toString(),
              });
            })
            .catch(() =>
              showFailure(toast, "Image Cannot be Retrieved to Update Display")
            );
        })
        .catch(() => showFailure(toast, "Could not modify book"));
      formik.resetForm();
      setOriginalBookData({
        id: id!,
        title: title,
        author: authors,
        isbn10: isbn10,
        isbn13: isbn13,
        publisher: publisher,
        publishedYear: pubYear,
        genres: genre,
        height: height,
        width: width,
        thickness: thickness,
        pageCount: pageCount,
        stock: stock,
        retailPrice: price,
        thumbnailURL: image.imageSrc,
        lineItems: lineItems,
      });
      setIsModifiable(false);
      setIsImageUploaded(false);
      setIsImageRemoved(false);
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
      setImage({
        imageSrc: originalBookData.thumbnailURL,
        imageHash: Date.now().toString(),
      });
      setIsImageUploaded(false);
      setIsImageRemoved(false);
    }
  }, [isModifiable]);

  // Genre dropdown
  useEffect(() => {
    GenresDropdownData({ setGenreNamesList });
  }, []);

  const genreDropdown = (
    <GenreDropdown
      selectedGenre={genre}
      setSelectedGenre={setGenre}
      genresList={genreNamesList}
      isDisabled={!isModifiable}
    />
  );

  const onImageDelete = () => {
    setImage({
      imageSrc: "http://books-db.colab.duke.edu/media/books/default.jpg",
      imageHash: Date.now().toString(),
    });
    setImageFile(new File([""], "filename"));
    setIsImageUploaded(false);
    setIsImageRemoved(true);
  };

  const uploadImageFileHandler = (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    setImageFile(file);
    setImage({ imageSrc: URL.createObjectURL(file), imageHash: "" });
    setIsImageUploaded(true);
    event.options.clear();
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  // Line item table
  const lineItemsTable = <BookDetailLineItems lineItems={lineItems} />;

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="grid col-12">
        <div className="flex col-1">
          <Button
            type="button"
            label="Back"
            icon="pi pi-arrow-left"
            onClick={() => navigate("/books")}
            className="p-button-sm my-auto ml-1"
          />
        </div>
        <h1 className="p-component col-10 p-text-secondary my-3 text-5xl text-center text-900 color: var(--surface-800);">
          Book Details
        </h1>
      </div>
      <Image
        // Leaving this line in case of future image browser side caching workaround is needed
        src={`${image.imageSrc}${image.imageHash == "" ? "" : "?"}${
          image.imageHash
        }`}
        //src={image}
        id="imageONpage"
        alt="Image"
        height="350"
        className="col-12 align-items-center flex justify-content-center"
        imageClassName="shadow-2 border-round"
      />
      <div className="col-12">
        {isModifiable && (
          <ImageUploader
            disabled={!isModifiable}
            uploadHandler={uploadImageFileHandler}
          />
        )}
        {isModifiable && (
          <div className="card flex justify-content-center my-3">
            <ConfirmPopup
              id={"deleteImage"}
              name={"deleteImage"}
              className={"p-button-danger flex"}
              isPopupVisible={isConfirmationPopupVisibleImageDelete}
              hideFunc={() => setIsConfirmationPopupVisibleImageDelete(false)}
              onFinalSubmission={onImageDelete}
              onRejectFinalSubmission={() => {
                console.log("reject2");
              }}
              onShowPopup={() => {
                setIsConfirmationPopupVisibleImageDelete(true);
              }}
              disabled={!isModifiable}
              label={"Delete Cover Image"}
            />
          </div>
        )}
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
            <p className="p-component p-text-secondary text-900 text-3xl text-center my-0">
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
            <p className="p-component p-text-secondary text-900 text-2xl text-center m-0">
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
                setHeight(e.value ?? undefined)
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
                setWidth(e.value ?? undefined)
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
                setThickness(e.value ?? undefined)
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
                setPageCount(e.value ?? undefined)
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
        {lineItemsTable}

        <div className="grid col-12 justify-content-evenly mt-2">
          {isModifiable && (
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              className="p-button-warning"
              onClick={() => setIsModifiable(false)}
            />
          )}
          {!isModifiable && (
            <Button
              type="button"
              label="Edit"
              icon="pi pi-pencil"
              onClick={() => setIsModifiable(true)}
            />
          )}
          {isModifiable && (
            <ConfirmPopup
              id={"bookDetailSubmit"}
              name={"bookDetailSubmit"}
              isPopupVisible={isConfirmationPopupVisible}
              hideFunc={() => setIsConfirmationPopupVisible(false)}
              onFinalSubmission={formik.handleSubmit}
              onRejectFinalSubmission={() => {
                //do nothing
              }}
              onShowPopup={() => {
                setIsConfirmationPopupVisible(true);
              }}
              disabled={!isModifiable}
              label={"Update"}
              className="p-button-success p-button-raised"
              icons="pi pi-save"
            />
          )}
        </div>
      </form>
    </div>
  );
}
