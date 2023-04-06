import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { BOOKS_API } from "../../../apis/books/BooksAPI";
import { showFailure } from "../../../components/Toast";
import { APIToInternalBookConversion } from "../../../apis/books/BooksConversions";
import { Toast } from "primereact/toast";
import BackButton from "../../../components/buttons/BackButton";
import { Image } from "primereact/image";
import TextLabel from "../../../components/text/TextLabels";
import PriceTemplate from "../../../components/templates/PriceTemplate";
import {
  calculateDaysOfSupply,
  updateShelfSpace,
} from "../../../util/NumberOps";
import { Divider } from "primereact/divider";
import BookDetailRelatedBooks, { RelatedBook } from "../BookDetailRelatedBooks";
import { TableColumn } from "../../../components/datatable/TableColumns";

// Leaving this line in case of future image browser side caching workaround is needed
interface ImageUrlHashStruct {
  imageSrc: string;
  imageHash: string;
}

export default function BookDetailMobile() {
  // From URL
  const { id } = useParams();

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
  // Leaving this line in case of future image browser side caching workaround is needed
  const [image, setImage] = useState<ImageUrlHashStruct>({
    imageSrc: "",
    imageHash: Date.now().toString(),
  });
  //const [image, setImage] = useState<string>("");

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
        setBestBuybackPrice(book.bestBuybackPrice);
        setLastMonthSales(book.lastMonthSales);
        setShelfSpace(updateShelfSpace(book.thickness, book.stock));
        setDaysOfSupply(calculateDaysOfSupply(book));
        setImage({
          imageSrc: response.image_url,
          imageHash: Date.now().toString(),
        });
        setNumOfRelatedBooks(book.numRelatedBooks);
        setRelatedBooks(book.relatedBooks!);
      })
      .catch(() => showFailure(toast, "Could not fetch book data"));
  }, [stock, id]);

  const toast = useRef<Toast>(null);

  const backButton = (
    <div className="flex col-4">
      <BackButton className="ml-1" />
    </div>
  );

  const RELATED_BOOKS_COLUMN: TableColumn<RelatedBook>[] = [
    {
      field: "title",
      header: "Title",
      style: {
        minWidth: "11rem",
        width: "22rem",
        textAlign: "right",
      },
    },
    {
      field: "publisher",
      header: "Publisher",
      style: {
        minWidth: "8rem",
        width: "14rem",
        textAlign: "right",
      },
    },
    {
      field: "publishedYear",
      header: "Publication Year",
      style: {
        minWidth: "4rem",
        width: "4rem",
        textAlign: "right",
      },
    },
  ];

  const relatedBooksTable = (
    <BookDetailRelatedBooks
      relatedBooks={relatedBooks}
      columnsOverride={RELATED_BOOKS_COLUMN}
      showGridLines={true}
    />
  );

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="col-12 pb-0 justify-content-start">{backButton}</div>
      <div className="jusity-content-center col-12 p-1">
        <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800); p-0 m-0">
          {title}
        </h1>
      </div>
      <div className="flex justify-content-center col-10">
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
            maxHeight: 350,
            maxWidth: 300,
          }}
          imageClassName="shadow-2 border-round"
        />
      </div>

      <div className="col-11">
        <div className="col-12 justify-content-center p-1 my-2">
          <div>
            <TextLabel label="Price" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-3xl text-center my-0">
              {PriceTemplate(price)}
            </p>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 my-2">
          <div className="flex justify-content-between">
            <TextLabel label="ISBN 13" />
            <TextLabel label="ISBN 10" />
          </div>
          <div className="flex justify-content-between">
            <div
              className="flex border-round surface-100 justify-content-start"
              style={{ width: "45%" }}
            >
              <p className="p-component p-text-secondary text-900 text-xl text-right m-0">
                {isbn13}
              </p>
            </div>
            <div
              className="flex border-round surface-100 justify-content-end"
              style={{ width: "45%" }}
            >
              <p className="p-component p-text-secondary text-900 text-xl text-left m-0">
                {isbn10}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-start p-1 my-2">
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="Inventory Count"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="Days of Supply"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
          </div>
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {stock}
              </p>
            </div>
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {daysOfSupply < 0 ? 0 : daysOfSupply}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 mt-2 mb-3">
          <div>
            <TextLabel label="Genre" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
              {genre}
            </p>
          </div>
        </div>
        <Divider />
        <div className="col-12 justify-content-center p-1 mb-2 mt-4">
          <div>
            <TextLabel label="Author(s)" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {authors}
            </p>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 my-2">
          <div>
            <TextLabel label="Publisher" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {publisher}
            </p>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 my-2">
          <div>
            <TextLabel label="Publication Year" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
              {pubYear}
            </p>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 my-2">
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="Page Count"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="Shelf Space (in)"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
          </div>
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {pageCount}
              </p>
            </div>
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {shelfSpace < 0 ? 0 : `${shelfSpace}${thickness ? "" : "*"}`}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-start p-1 my-2">
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="Best Buyback Price"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="Last Month Sales"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
          </div>
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {PriceTemplate(bestBuybackPrice)}
              </p>
            </div>
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {lastMonthSales}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-start p-1 my-2">
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center">
              <TextLabel
                label="# of Related Books"
                labelClassName="p-component p-text-secondary text-teal-900 m-auto text-center"
              />
            </div>
          </div>
          <div className="flex justify-content-around">
            <div className="flex w-5 justify-content-center border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-0">
                {numOfRelatedBooks}
              </p>
            </div>
          </div>
        </div>
        <Divider />
        <div className="justify-content-center p-1">
          <h1 className="p-component p-text-secondary text-xl text-center text-teal-900 color: var(--surface-800); m-2">
            Dimensions (in)
          </h1>
        </div>
        <div className="col-12 justify-content-center p-1">
          <div className="flex justify-content-evenly">
            <div
              className="flex justify-content-center"
              style={{ width: "30%" }}
            >
              <TextLabel
                label="Height"
                labelClassName="p-component p-text-secondary text-teal-900 my-auto text-center"
              />
            </div>
            <div
              className="flex justify-content-center"
              style={{ width: "30%" }}
            >
              <TextLabel
                label="Width"
                labelClassName="p-component p-text-secondary text-teal-900 my-auto text-center"
              />
            </div>
            <div
              className="flex justify-content-center"
              style={{ width: "30%" }}
            >
              <TextLabel
                label="Thickness"
                labelClassName="p-component p-text-secondary text-teal-900 my-auto text-center"
              />
            </div>
          </div>
        </div>
        <div className="col-12 flex justify-content-evenly p-1">
          <div
            className="flex justify-content-center mb-2 border-round surface-100"
            style={{ width: "30%" }}
          >
            <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
              {height ?? "None"}
            </p>
          </div>
          <div
            className="flex justify-content-center mb-2 border-round surface-100"
            style={{ width: "30%" }}
          >
            <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
              {width ?? "None"}
            </p>
          </div>
          <div
            className="flex justify-content-center mb-2 border-round surface-100"
            style={{ width: "30%" }}
          >
            <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
              {width ?? "None"}
            </p>
          </div>
        </div>
        <Divider align="center">
          <div className="inline-flex align-items-center">
            <b>Related Books</b>
          </div>
        </Divider>
        <div className="flex w-12 justify-content-center">
          {relatedBooksTable}
        </div>
      </div>
    </div>
  );
}
