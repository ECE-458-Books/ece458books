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
      })
      .catch(() => showFailure(toast, "Could not fetch book data"));
  }, [stock, id]);

  const toast = useRef<Toast>(null);

  const backButton = (
    <div className="flex col-4">
      <BackButton className="ml-1" />
    </div>
  );

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="col-12 pb-0 justify-content-start">{backButton}</div>
      <div className="jusity-content-center col-12 p-1">
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800); p-0 m-0">
          Book Details
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
            <TextLabel label="Title" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-3xl text-center my-0">
              {title}
            </p>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 my-2">
          <div>
            <TextLabel label="Author(s)" />
          </div>
          <div className="border-round surface-100">
            <p className="p-component p-text-secondary text-900 text-2xl text-center m-0">
              {authors}
            </p>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 my-2">
          <div className="flex justify-content-between">
            <TextLabel label="ISBN 13" />
            <TextLabel label="ISBN 10" />
          </div>
          <div className="flex justify-content-between">
            <div className="border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {isbn13}
              </p>
            </div>
            <div className="border-round surface-100">
              <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
                {isbn10}
              </p>
            </div>
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
        <div className="shadow-2 border-round">
          <div className="justify-content-center p-1">
            <h1 className="p-component p-text-secondary text-xl text-center text-teal-900 color: var(--surface-800); m-2">
              Dimensions (in)
            </h1>
          </div>
          <div className="col-12 justify-content-center p-1">
            <div className="flex justify-content-between">
              <div className="flex w-4 justify-content-center">
                <TextLabel
                  label="Height"
                  labelClassName="p-component p-text-secondary text-teal-900 my-auto"
                />
              </div>
              <div className="flex w-4 justify-content-center">
                <TextLabel
                  label="Width"
                  labelClassName="p-component p-text-secondary text-teal-900 my-auto"
                />
              </div>
              <div className="flex w-4 justify-content-center">
                <TextLabel
                  label="Thickness"
                  labelClassName="p-component p-text-secondary text-teal-900 my-auto"
                />
              </div>
            </div>
          </div>
          <div className="col-12 flex justify-content-between p-1">
            <div className="flex w-4 justify-content-center mb-2">
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {height ?? "None"}
              </p>
            </div>
            <div className="flex w-4 justify-content-center mb-2">
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {width ?? "None"}
              </p>
            </div>
            <div className="flex w-4 justify-content-center mb-2">
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {width ?? "None"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-center p-1 mt-4">
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Page Count" />
            </div>
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Shelf Space (in)" />
            </div>
          </div>
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {pageCount}
              </p>
            </div>
            <div className="flex w-6 justify-content-center">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {shelfSpace < 0 ? 0 : `${shelfSpace}${thickness ? "" : "*"}`}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-start p-1 my-2">
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Inventory Count" />
            </div>
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Days of Supply" />
            </div>
          </div>
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {stock}
              </p>
            </div>
            <div className="flex w-6 justify-content-center">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {daysOfSupply < 0 ? 0 : daysOfSupply}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-start p-1 my-2">
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Best Buyback Price" />
            </div>
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Retail Price" />
            </div>
          </div>
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {PriceTemplate(bestBuybackPrice)}
              </p>
            </div>
            <div className="flex w-6 justify-content-center">
              <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                {PriceTemplate(price)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 justify-content-start p-1 my-2">
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <TextLabel label="# of Related Books" />
            </div>
            <div className="flex w-6 justify-content-center">
              <TextLabel label="Last Month Sales" />
            </div>
          </div>
          <div className="flex justify-content-between">
            <div className="flex w-6 justify-content-center">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-0">
                {numOfRelatedBooks}
              </p>
            </div>
            <div className="flex w-6 justify-content-center">
              <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                {lastMonthSales}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
