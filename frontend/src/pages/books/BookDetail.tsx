import { useEffect, useRef, useState } from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useNavigate, useParams } from "react-router-dom";
import { Book, emptyBook } from "./BookList";
import { APIBook, BOOKS_API } from "../../apis/books/BooksAPI";
import { FormikErrors, useFormik } from "formik";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { CommaSeparatedStringToArray } from "../../util/StringOps";
import { Image } from "primereact/image";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import { GenresDropdownData } from "../../components/dropdowns/GenreDropdown";
import ImageUploader, {
  DEFAULT_BOOK_IMAGE,
} from "../../components/uploaders/ImageFileUploader";
import { showFailure, showSuccess } from "../../components/Toast";
import { APIToInternalBookConversion } from "../../apis/books/BooksConversions";
import { Button } from "primereact/button";
import GenreDropdown from "../../components/dropdowns/GenreDropdown";
import BookDetailLineItems, { BookDetailLineItem } from "./BookDetailLineItems";
import DeleteButton from "../../components/buttons/DeleteButton";
import BackButton from "../../components/buttons/BackButton";
import PriceTemplate from "../../components/templates/PriceTemplate";
import DeletePopup from "../../components/popups/DeletePopup";
import { DEFAULT_THICKNESS } from "../casedesigner/util/Calculations";
import Restricted from "../../permissions/Restricted";
import TextLabel from "../../components/text/TextLabels";
import { TextWrapperNullableNumberEditor } from "../../components/text/TextWrapperNullableNumberEditor";
import { PriceEditor } from "../../components/editors/PriceEditor";

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
  const [isbn13, setISBN13] = useState<string>("");
  const [isbn10, setISBN10] = useState<string>("");
  const [publisher, setPublisher] = useState<string>("");
  const [pubYear, setPubYear] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>();
  const [price, setPrice] = useState<number>(0);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [thickness, setThickness] = useState<number>();
  const [stock, setStock] = useState<number>(0);
  const [bestBuybackPrice, setBestBuybackPrice] = useState<number>();
  const [daysOfSupply, setDaysOfSupply] = useState<number | string>();
  const [shelfSpace, setShelfSpace] = useState<number>();
  const [lastMonthSales, setLastMonthSales] = useState<number>();
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
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is visible

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
        setBestBuybackPrice(book.bestBuybackPrice);
        setLastMonthSales(book.lastMonthSales);
        updateShelfSpace(book.thickness);
        setDaysOfSupply(calculateDaysOfSupply(book));
        setImage({
          imageSrc: response.image_url,
          imageHash: Date.now().toString(),
        });
      })
      .catch(() => showFailure(toast, "Could not fetch book data"));
  }, []);

  const calculateDaysOfSupply = (book: Book) => {
    if (book.stock === 0) {
      return "inf";
    } else {
      return Math.floor((book.stock / book.lastMonthSales!) * 30);
    }
  };

  const updateShelfSpace = (thickness: number | undefined) => {
    const calcThickness = thickness ? thickness : DEFAULT_THICKNESS;
    setShelfSpace(
      Math.round((calcThickness * stock + Number.EPSILON) * 100) / 100
    );
  };

  // Update shelf space

  useEffect(() => {
    updateShelfSpace(thickness);
  }, [thickness]);

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
        image_url: image.imageSrc,
      };
      logger.debug("Submitting Book Modify", book);
      BOOKS_API.modifyBook({
        book: book,
        image: imageFile,
        isImageUploaded: isImageUploaded,
        isImageRemoved: isImageRemoved,
      })
        .then((response) => {
          const updatedBook = APIToInternalBookConversion(response);
          setOriginalBookData({
            id: updatedBook.id!,
            title: updatedBook.title,
            author: updatedBook.author,
            isbn10: updatedBook.isbn10,
            isbn13: updatedBook.isbn13,
            publisher: updatedBook.publisher,
            publishedYear: updatedBook.publishedYear,
            genres: updatedBook.genres,
            height: updatedBook.height,
            width: updatedBook.width,
            thickness: updatedBook.thickness,
            pageCount: updatedBook.pageCount,
            stock: updatedBook.stock,
            retailPrice: updatedBook.retailPrice,
            thumbnailURL: updatedBook.thumbnailURL,
            lineItems: updatedBook.lineItems,
            bestBuybackPrice: updatedBook.bestBuybackPrice,
            lastMonthSales: updatedBook.lastMonthSales,
            shelfSpace: updatedBook.shelfSpace,
            daysOfSupply: updatedBook.daysOfSupply,
          });
          setIsModifiable(false);
          setIsImageUploaded(false);
          setIsImageRemoved(false);
          showSuccess(toast, "Book Edited");
        })
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
      showClearButton={false}
    />
  );

  // Image handlers

  // For the delete button
  const onImageDelete = () => {
    setImage({
      imageSrc: DEFAULT_BOOK_IMAGE,
      imageHash: Date.now().toString(),
    });
    setImageFile(new File([""], "filename"));
    setIsImageUploaded(false);
    setIsImageRemoved(true);
  };

  // For the cancel button (revert to original)
  const onImageCancel = () => {
    setImage({
      imageSrc: originalBookData.thumbnailURL,
      imageHash: Date.now().toString(),
    });
    setImageFile(new File([""], "filename"));
    setIsImageUploaded(false);
    setIsImageRemoved(false);
  };

  // For the upload button
  const onImageUpload = (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    setImage({ imageSrc: URL.createObjectURL(file), imageHash: "" });
    setImageFile(file);
    setIsImageUploaded(true);
    setIsImageRemoved(false);
    event.options.clear();
  };

  const deleteBookPopup = () => {
    logger.debug("Delete Book Clicked");
    setDeletePopupVisible(true);
  };

  const deleteBookFinal = () => {
    logger.debug("Delete Book Finalized");
    setDeletePopupVisible(false);
    BOOKS_API.deleteBook({ id: id! })
      .then(() => {
        showSuccess(toast, "Book deleted");
        navigate("/books");
      })
      .catch(() => {
        showFailure(toast, "Book could not be deleted");
        return;
      });
  };

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={title}
      onConfirm={() => deleteBookFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // The navigator to switch pages
  const navigate = useNavigate();

  // Line item table
  const lineItemsTable = <BookDetailLineItems lineItems={lineItems} />;

  const backButton = (
    <div className="flex col-4">
      <BackButton className="ml-1" />
    </div>
  );

  const deleteButton = (
    <DeleteButton
      onClick={deleteBookPopup}
      disabled={stock > 0}
      className={"ml-1 "}
    />
  );

  // Right
  const submitButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={formik.handleSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      label={"Submit"}
      className="p-button-success ml-1 p-button-sm"
      classNameDiv="flex my-auto"
    />
  );

  const editButton = (
    <Restricted to={"modify"}>
      <Button
        type="button"
        visible={!isModifiable}
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-sm my-auto"
        onClick={() => setIsModifiable(true)}
      />
    </Restricted>
  );

  const cancelButton = (
    <Button
      type="button"
      label="Cancel"
      visible={isModifiable}
      icon="pi pi-times"
      className="p-button-warning p-button-sm my-auto"
      onClick={() => setIsModifiable(false)}
    />
  );

  const rightButtons = (
    <div className="flex col-4 justify-content-end">
      {cancelButton}
      {submitButton}
      {editButton}
      {deleteButton}
    </div>
  );

  // Image upploader buttons
  const imageUploadButton = (
    <ImageUploader
      disabled={!isModifiable}
      uploadHandler={onImageUpload}
      className="p-button-sm my-auto"
    />
  );

  const imageCancelButton = (
    <Button
      type="button"
      label="Cancel"
      icon="pi pi-times"
      onClick={onImageCancel}
      className={"p-button-sm my-auto ml-2"}
      disabled={!isImageUploaded && !isImageRemoved}
      visible={isModifiable}
    />
  );

  const imageDeleteButton = (
    <DeleteButton
      onClick={onImageDelete}
      visible={isModifiable}
      disabled={isImageRemoved}
      className={"my-auto ml-2"}
    />
  );

  const imageUploaderButtons = (
    <div className="flex justify-content-center">
      {isModifiable && imageUploadButton}
      {imageCancelButton}
      {imageDeleteButton}
    </div>
  );

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="grid col-12">
        {backButton}
        <div className="col-4">
          {isModifiable ? (
            <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
              Modify Book
            </h1>
          ) : (
            <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
              Book Details
            </h1>
          )}
        </div>
        {rightButtons}
      </div>
      <div className="col-4">
        <Image
          // Leaving this line in case of future image browser side caching workaround is needed
          src={`${image.imageSrc}${image.imageHash == "" ? "" : "?"}${
            image.imageHash
          }`}
          //src={image}
          id="imageONpage"
          alt="Image"
          imageStyle={{
            objectFit: "contain",
            maxHeight: 450,
            maxWidth: 400,
          }}
          className="col-12 align-items-center flex justify-content-center"
          imageClassName="shadow-2 border-round"
        />
        {imageUploaderButtons}
      </div>

      <div className="col-8">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0">
              <TextLabel label="Title:" />
              <p className="p-component p-text-secondary text-900 text-3xl text-center my-0">
                {title}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0">
              <TextLabel label="Author(s):" />
              <p className="p-component p-text-secondary text-900 text-2xl text-center m-0">
                {authors}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-6">
              <TextLabel label="ISBN13:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {isbn13}
              </p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="ISBN10:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {isbn10}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-6">
              <TextLabel label="Publisher:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {publisher}
              </p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Publication Year:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {pubYear}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-5">
              <TextLabel label="Genre:" />
              {!isModifiable ? (
                <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                  {genre}
                </p>
              ) : (
                genreDropdown
              )}
            </div>
          </div>
          <h1 className="col-9 p-component p-text-secondary mb-1 mt-2 p-0 text-xl text-center text-900 color: var(--surface-800);">
            Dimensions (in)
          </h1>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-4">
              <TextLabel label="Height:" />
              <TextWrapperNullableNumberEditor
                disabled={!isModifiable}
                textValue={height}
                value={height}
                onValueChange={(newValue) => setHeight(newValue ?? undefined)}
                defaultValue={undefined}
                valueClassName="flex 2rem"
              />
            </div>
            <div className="flex p-0 col-4">
              <TextLabel label="Width:" />
              <TextWrapperNullableNumberEditor
                disabled={!isModifiable}
                textValue={width}
                value={width}
                onValueChange={(newValue) => setWidth(newValue ?? undefined)}
                defaultValue={undefined}
                valueClassName="flex 2rem"
              />
            </div>
            <div className="flex p-0 col-4">
              <TextLabel label="Thickness:" />
              <TextWrapperNullableNumberEditor
                disabled={!isModifiable}
                textValue={thickness}
                value={thickness}
                onValueChange={(newValue) =>
                  setThickness(newValue ?? undefined)
                }
                defaultValue={undefined}
                valueClassName="flex 2rem"
              />
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-6">
              <TextLabel label="Page Count:" />
              <TextWrapperNullableNumberEditor
                disabled={!isModifiable}
                textValue={pageCount}
                value={pageCount}
                onValueChange={(newValue) =>
                  setPageCount(newValue ?? undefined)
                }
                defaultValue={undefined}
              />
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Shelf Space (in):" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                <label className={thickness ? "" : "font-bold"}>
                  {shelfSpace}
                </label>
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex col-6 p-0">
              <TextLabel label="Inventory Count:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {stock}
              </p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Days of Supply:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {daysOfSupply}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-4">
              <TextLabel label="Last Month Sales:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {lastMonthSales}
              </p>
            </div>
            <div className="flex p-0 col-4">
              <TextLabel label="Best Buyback Price:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {PriceTemplate(bestBuybackPrice)}
              </p>
            </div>
            <div className="flex col-4 p-0">
              <TextLabel label="Retail Price:" />
              {!isModifiable ? (
                <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                  {PriceTemplate(price)}
                </p>
              ) : (
                PriceEditor(
                  price,
                  (newValue: number) => setPrice(newValue ?? 0),
                  "w-4",
                  !isModifiable
                )
              )}
            </div>
          </div>
        </form>
      </div>
      {deletePopupVisible && deletePopup}
      <div className="flex justify-content-center col-10">{lineItemsTable}</div>
    </div>
  );
}
