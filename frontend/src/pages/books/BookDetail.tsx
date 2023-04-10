import { useEffect, useRef, useState } from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useNavigate, useParams } from "react-router-dom";
import { Book, emptyBook, RemoteBook } from "./BookList";
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
import Restricted from "../../permissions/Restricted";
import TextLabel from "../../components/text/TextLabels";
import { TextWrapperNullableNumberEditor } from "../../components/text/TextWrapperNullableNumberEditor";
import { PriceEditor } from "../../components/editors/PriceEditor";
import { Divider } from "primereact/divider";
import BookDetailRelatedBooks, { RelatedBook } from "./BookDetailRelatedBooks";
import { arrowColorDeterminer, colorDeterminer } from "../../util/CSSFunctions";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import "../../css/MiscellaneousCSS.css";
import { calculateDaysOfSupply, updateShelfSpace } from "../../util/NumberOps";
import { scrollToTop } from "../../util/WindowViewportOps";
import ImportFieldButton from "../../components/buttons/ImportFieldButton";

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
  const [daysOfSupply, setDaysOfSupply] = useState<number | string>(0);
  const [shelfSpace, setShelfSpace] = useState<number>(0);
  const [lastMonthSales, setLastMonthSales] = useState<number>();
  const [numOfRelatedBooks, setNumOfRelatedBooks] = useState<number>();
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
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
  const [inventoryAdjustment, setInventoryAdjustment] = useState<number>(0);
  const [remoteBook, setRemoteBook] = useState<RemoteBook>();

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is visible
  const [isInventoryCorrectionVisible, setIsInventoryCorrectionVisible] =
    useState<boolean>(false);

  // Load the book data on page load
  useEffect(() => {
    BOOKS_API.getBookDetail({ id: id! })
      .then((response) => {
        if (response.isGhost == true) {
          showFailure(
            toast,
            `This book has been deleted from the database, and needs 
            to be re-added before it can be viewed or edited (ISBN-13: ${response.isbn_13})`
          );
          return;
        }

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
        setShelfSpace(updateShelfSpace(book.thickness, book.stock));
        setInventoryAdjustment(0);
        setDaysOfSupply(calculateDaysOfSupply(book));
        setImage({
          imageSrc: response.image_url,
          imageHash: Date.now().toString(),
        });
        setNumOfRelatedBooks(book.numRelatedBooks);
        setRelatedBooks(book.relatedBooks!);
        setRemoteBook(book.remoteBook);
      })
      .catch(() => showFailure(toast, "Could not fetch book data"));
    scrollToTop();
  }, [stock, id]);

  const bookModifyAPIRequest = (book: APIBook) => {
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
  };

  // Update shelf space

  useEffect(() => {
    setShelfSpace(updateShelfSpace(thickness, stock));
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

      if (inventoryAdjustment !== 0) {
        BOOKS_API.inventoryCorrection({
          id: id!,
          adjustment: inventoryAdjustment,
        })
          .then((response) => {
            setStock(stock + response.adjustment);
            setInventoryAdjustment(0);
            setOriginalBookData({
              id: originalBookData.id!,
              title: originalBookData.title,
              author: originalBookData.author,
              isbn10: originalBookData.isbn10,
              isbn13: originalBookData.isbn13,
              publisher: originalBookData.publisher,
              publishedYear: originalBookData.publishedYear,
              genres: originalBookData.genres,
              height: originalBookData.height,
              width: originalBookData.width,
              thickness: originalBookData.thickness,
              pageCount: originalBookData.pageCount,
              stock: stock,
              retailPrice: originalBookData.retailPrice,
              thumbnailURL: originalBookData.thumbnailURL,
              lineItems: originalBookData.lineItems,
              bestBuybackPrice: originalBookData.bestBuybackPrice,
              lastMonthSales: originalBookData.lastMonthSales,
              shelfSpace: originalBookData.shelfSpace,
              daysOfSupply: originalBookData.daysOfSupply,
            });
            showSuccess(toast, "Inventory Adjusted");
            bookModifyAPIRequest(book);
          })
          .catch(() => showFailure(toast, "Could not modify inventory"));
      } else {
        bookModifyAPIRequest(book);
      }
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
      setInventoryAdjustment(0);
      setIsInventoryCorrectionVisible(false);
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

  const relatedBooksTable = (
    <BookDetailRelatedBooks relatedBooks={relatedBooks} />
  );

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
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={formik.handleSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      buttonLabel={"Submit"}
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

  const inventoryCorrectionButton = (
    <Restricted to={"modify"}>
      <Button
        icon="pi pi-pencil"
        type="button"
        visible={isModifiable && !isInventoryCorrectionVisible}
        onClick={() => {
          setIsInventoryCorrectionVisible(true);
          console.log(inventoryAdjustment);
        }}
        className="p-button-rounded p-button-sm ml-2"
        style={{ width: 10, height: 35 }}
      />
    </Restricted>
  );

  const inventoryCorrectionEditLine = (
    <Restricted to={"modify"}>
      <InputNumber
        value={inventoryAdjustment}
        onValueChange={(e: InputNumberValueChangeEvent) =>
          setInventoryAdjustment(e.value ?? 0)
        }
        mode="decimal"
        showButtons
        buttonLayout="horizontal"
        step={1}
        size={5}
        decrementButtonClassName="p-button-danger"
        incrementButtonClassName="p-button-success"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        min={-stock}
        className="inventoryCorrectionInLineFormat plusMinusButtonsForInventoryCorrection"
      />
      <Button
        type="button"
        icon="pi pi-times"
        className="p-button-sm"
        style={{ width: "1rem" }}
        tooltip="Cancel Inventory Correction"
        tooltipOptions={{ showDelay: 1000, hideDelay: 300 }}
        onClick={() => {
          setIsInventoryCorrectionVisible(false);
          setInventoryAdjustment(0);
        }}
      />
    </Restricted>
  );

  const importPageCountButton = (
    <ImportFieldButton
      onClick={() => setPageCount(remoteBook?.pageCount)}
      isVisible={remoteBook?.pageCount != null && isModifiable}
    />
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
                {remoteBook && remoteBook.title != title
                  ? `\xa0 (${remoteBook.title})`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0">
              <TextLabel label="Author(s):" />
              <p className="p-component p-text-secondary text-900 text-2xl text-center m-0">
                {authors}
                {remoteBook && remoteBook.authors != authors
                  ? `\xa0 (${remoteBook.authors})`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-6">
              <TextLabel label="ISBN 13:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {isbn13}
                {remoteBook && remoteBook.isbn13 != isbn13
                  ? `\xa0 (${remoteBook.isbn13})`
                  : ""}
              </p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="ISBN 10:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {isbn10}
                {remoteBook && remoteBook.isbn10 != isbn10
                  ? `\xa0 (${remoteBook.isbn10})`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-6">
              <TextLabel label="Publisher:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {publisher}
                {remoteBook && remoteBook.publisher != publisher
                  ? `\xa0 (${remoteBook.publisher})`
                  : ""}
              </p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Publication Year:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {pubYear}
                {remoteBook && remoteBook.publishedYear != pubYear
                  ? `\xa0 (${remoteBook.publishedYear})`
                  : ""}
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
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {remoteBook?.pageCount && remoteBook?.pageCount != pageCount
                  ? `\xa0 (${remoteBook.pageCount})`
                  : ""}
              </p>
              <p className=" vertical-align-middle">{importPageCountButton}</p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Shelf Space (in):" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {shelfSpace < 0 ? 0 : `${shelfSpace}${thickness ? "" : "*"}`}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex col-6 p-0">
              <div className="my-auto">
                <TextLabel label="Inventory Count:" />
              </div>
              <div className="flex flex-wrap" style={{ width: "25%" }}>
                <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                  {stock}
                </p>
                {isModifiable && inventoryAdjustment !== 0 && (
                  <>
                    <span
                      className="pi pi-arrow-right my-auto font-semibold px-1"
                      style={arrowColorDeterminer(inventoryAdjustment)}
                    ></span>
                    <p
                      className={
                        "p-component p-text-secondary text-xl text-center my-0 text-center my-auto " +
                        colorDeterminer(inventoryAdjustment)
                      }
                    >
                      {stock + inventoryAdjustment}
                    </p>
                  </>
                )}
              </div>
              <div className="flex" style={{ width: "47%" }}>
                {isInventoryCorrectionVisible &&
                  isModifiable &&
                  inventoryCorrectionEditLine}
                {inventoryCorrectionButton}
              </div>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Days of Supply:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {daysOfSupply < 0 ? 0 : daysOfSupply}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex p-0 col-6">
              <TextLabel label="Last Month Sales:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {lastMonthSales}
              </p>
            </div>
            <div className="flex p-0 col-6">
              <TextLabel label="Best Buyback Price:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {PriceTemplate(bestBuybackPrice)}
              </p>
            </div>
          </div>
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex col-6 p-0">
              <TextLabel label="# of Related Books:" />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-0">
                {numOfRelatedBooks}
              </p>
            </div>
            <div className="flex col-6 p-0">
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
          <div className="flex col-12 justify-content-start p-1">
            <div className="flex col-6 p-0">
              <TextLabel label="Remote Inventory Count: " />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-0">
                {remoteBook?.stock ?? "-"}
              </p>
            </div>
            <div className="flex col-6 p-0">
              <TextLabel label="Remote Retail Price ($): " />
              <p className="p-component p-text-secondary text-900 text-xl text-center my-0">
                {remoteBook?.retailPrice ?? "-"}
              </p>
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
                min={0.01}
              />
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {remoteBook?.height && remoteBook?.height != height
                  ? `\xa0 (${remoteBook.height})`
                  : ""}
              </p>
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
                min={0.01}
              />
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {remoteBook?.width && remoteBook?.width != width
                  ? `\xa0 (${remoteBook.width})`
                  : ""}
              </p>
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
                min={0.01}
              />
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {remoteBook?.thickness && remoteBook?.thickness != thickness
                  ? `\xa0 (${remoteBook.thickness})`
                  : ""}
              </p>
            </div>
          </div>
        </form>
      </div>
      {deletePopupVisible && deletePopup}
      <Divider align="center">
        <div className="inline-flex align-items-center">
          <b>Book Related Transactions and Adjustments</b>
        </div>
      </Divider>
      <div className="flex justify-content-center col-10">{lineItemsTable}</div>
      <Divider align="center">
        <div className="inline-flex align-items-center">
          <b>Related Books</b>
        </div>
      </Divider>
      <div className="col-10">{relatedBooksTable}</div>
    </div>
  );
}
