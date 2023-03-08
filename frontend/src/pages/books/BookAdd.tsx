import { FormEvent, useEffect, useRef, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { PriceEditor } from "../../components/editors/PriceEditor";
import { NullableNumberEditor } from "../../components/editors/NumberEditor";
import { NullableIntegerEditor } from "../../components/editors/IntegerEditor";
import ImageTemplateWithButtons from "../../components/templates/ImageTemplate";
import { APIBookWithDBTag, BOOKS_API } from "../../apis/books/BooksAPI";
import { Book, NewImageUploadData } from "./BookList";
import { Badge } from "primereact/badge";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import {
  APIToInternalBookConversionWithDB,
  InternalToAPIBookConversion,
} from "../../apis/books/BooksConversions";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import GenresDropdown, {
  GenresDropdownData,
} from "../../components/dropdowns/GenreDropdown";
import { showFailure, showSuccess } from "../../components/Toast";
import ImageUploader, {
  DEFAULT_BOOK_IMAGE,
} from "../../components/uploaders/ImageFileUploader";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import { useImmer } from "use-immer";
import { findById } from "../../util/IDOps";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate } from "react-router-dom";
import "../../css/TableCell.css";

export interface BookWithDBTag extends Book {
  fromDB: boolean;
}

export default function BookAdd() {
  const [textBox, setTextBox] = useState<string>("");
  const [books, setBooks] = useImmer<BookWithDBTag[]>([]);
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);

  const statusTemplate = (rowData: BookWithDBTag) => {
    if (rowData.fromDB && !rowData.isGhost!) {
      return <Badge value="Exists"></Badge>;
    } else {
      return <Badge value="New" severity="success"></Badge>;
    }
  };

  // Genre dropdown
  useEffect(() => {
    GenresDropdownData({ setGenreNamesList });
  }, []);

  const genresDropdownEditor = (
    value: string,
    onChange: (newValue: string) => void
  ) => (
    <GenresDropdown
      setSelectedGenre={onChange}
      genresList={genreNamesList}
      selectedGenre={value}
      style={{ width: "10rem" }}
      showClearButton={false}
    />
  );

  // Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
  const COLUMNS: TableColumn<BookWithDBTag>[] = [
    {
      field: "fromDB",
      header: "Book Status",
      customBody: statusTemplate,
      style: { width: "5%" },
    },
    {
      field: "thumbnailURL",
      header: "Cover Art",
      customBody: (rowData: BookWithDBTag) =>
        ImageTemplateWithButtons(
          imageDeleteButton(rowData),
          imageUploadButton(rowData),
          rowData.thumbnailURL
        ),
      style: { width: "1rem" },
    },

    {
      field: "title",
      header: "Title",
      style: { width: "15%" },
    },
    {
      field: "author",
      header: "Authors",
      style: { width: "10%" },
    },
    {
      field: "genres",
      header: "Genre",
      style: { width: "13%" },
      customBody: (rowData: BookWithDBTag) =>
        genresDropdownEditor(rowData.genres, (newValue) => {
          setBooks((draft) => {
            const book = findById(draft, rowData.id)!;
            book.genres = newValue;
          });
        }),
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      style: { width: "7%" },
    },
    {
      field: "isbn10",
      header: "ISBN 10",
      style: { width: "5%" },
    },
    {
      field: "publisher",
      header: "Publisher",
      style: { width: "10%" },
    },
    {
      field: "publishedYear",
      header: "Publish Year",
      style: { width: "2rem" },
    },
    {
      field: "pageCount",
      header: "Page Count",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        NullableIntegerEditor(
          rowData.pageCount,
          (newValue) => {
            setBooks((draft) => {
              const book = findById(draft, rowData.id)!;
              book.pageCount = newValue;
            });
          },
          "integerNumbeBookAdd"
        ),
    },
    {
      field: "width",
      header: "Width",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        NullableNumberEditor(
          rowData.width,
          (newValue) => {
            setBooks((draft) => {
              const book = findById(draft, rowData.id)!;
              book.width = newValue;
            });
          },
          "decimalNumberBookAdd"
        ),
    },
    {
      field: "height",
      header: "Height",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        NullableNumberEditor(
          rowData.height,
          (newValue) => {
            setBooks((draft) => {
              const book = findById(draft, rowData.id)!;
              book.height = newValue;
            });
          },
          "decimalNumberBookAdd"
        ),
    },
    {
      field: "thickness",
      header: "Thickness",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        NullableNumberEditor(
          rowData.thickness,
          (newValue) => {
            setBooks((draft) => {
              const book = findById(draft, rowData.id)!;
              book.thickness = newValue;
            });
          },
          "decimalNumberBookAdd"
        ),
    },
    {
      field: "retailPrice",
      header: "Retail Price",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        PriceEditor(
          rowData.retailPrice,
          (newValue) => {
            setBooks((draft) => {
              const book = findById(draft, rowData.id)!;
              book.retailPrice = newValue;
            });
          },
          "retailNumberBookAdd"
        ),
    },
  ];

  // Image event handlers

  const onImageChange = (event: FileUploadHandlerEvent, bookId: string) => {
    const file = event.files[0];
    setBooks((draft) => {
      const book = findById(draft, bookId)!;
      const newImage: NewImageUploadData = {
        imageFile: file,
        isImageUpload: true,
        isImageDelete: false,
      };

      book.newImageData = newImage;
      book.thumbnailURL = URL.createObjectURL(file);
    });
    event.options.clear();
  };

  const onImageDelete = (bookId: string) => {
    setBooks((draft) => {
      const book = findById(draft, bookId)!;
      book.thumbnailURL = DEFAULT_BOOK_IMAGE;

      const newImage: NewImageUploadData = {
        imageFile: new File([""], "filename"),
        isImageUpload: false,
        isImageDelete: true,
      };

      book.newImageData = newImage;
    });
  };

  // Image template buttons

  const imageUploadButton = (rowData: BookWithDBTag) => {
    return (
      <ImageUploader
        uploadHandler={(e: FileUploadHandlerEvent) =>
          onImageChange(e, rowData.id)
        }
        className=""
        style={{ height: "10", width: "10", paddingLeft: "5" }}
      />
    );
  };

  const imageDeleteButton = (rowData: BookWithDBTag) => {
    return (
      <Button
        type="button"
        icon="pi pi-trash"
        onClick={() => onImageDelete(rowData.id)}
        className=""
        style={{ height: 10, width: 22 }}
      />
    );
  };

  // Initial add book

  const onISBNInitialSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Submitting Initial Book Lookup", textBox);
    setBooks([]);
    setIsLoadingButton(true);
    BOOKS_API.addBookInitialLookup({ isbns: textBox })
      .then((response) => {
        setIsLoadingButton(false);
        for (const book of response.books) {
          downloadAndSetBook(book);
        }

        if (response.invalid_isbns.length > 0) {
          showFailure(
            toast,
            "The following ISBNs were not successfully added: ".concat(
              response.invalid_isbns.toString()
            )
          );
        }
      })
      .catch(() => {
        setIsLoadingButton(false);
        showFailure(toast, "Could not add books");
      });

    event.preventDefault();
  };

  const downloadAndSetBook = (book: APIBookWithDBTag) => {
    setBooks((draft) => {
      const newBook = APIToInternalBookConversionWithDB(book);
      const newImageUploadData: NewImageUploadData = {
        isImageDelete: false,
        isImageUpload: false,
        imageFile: new File([], "blank"),
      };
      newBook.newImageData = newImageUploadData;
      draft.push(newBook);
    });
  };

  const toast = useRef<Toast>(null);

  const validateRow = (book: BookWithDBTag) => {
    return book.retailPrice > 0 && book.genres;
  };

  const onFinalSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Validate before submitting any additions
    for (const book of books) {
      if (!validateRow(book)) {
        showFailure(
          toast,
          "The following book does not have all required fields set: ".concat(
            book.title
          )
        );
        event.preventDefault();
        return;
      }
    }

    logger.debug("Submitting Final Book Add", books);

    for (const book of books) {
      if (!book.fromDB || (book.isGhost && book.fromDB)) {
        BOOKS_API.addBookFinal({
          book: InternalToAPIBookConversion(book),
          image: book.newImageData!.imageFile,
          isImageUploaded: book.newImageData!.isImageUpload!,
          isImageRemoved: book.newImageData!.isImageDelete!,
        })
          .then(() => showSuccess(toast, "Book Added ".concat(book.title)))
          .catch(() => showFailure(toast, "Could not add ".concat(book.title)));
      } else {
        BOOKS_API.modifyBook({
          book: InternalToAPIBookConversion(book),
          image: book.newImageData!.imageFile!,
          isImageUploaded: book.newImageData!.isImageUpload!,
          isImageRemoved: book.newImageData!.isImageDelete!,
        })
          .then(() => showSuccess(toast, "Book Modified ".concat(book.title)))
          .catch(() => {
            showFailure(toast, "Could not modify ".concat(book.title));
          });
      }
    }
    event.preventDefault();
  };

  const columns = createColumns(COLUMNS);

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-1">
      <BackButton onClick={() => navigate("/books")} className="ml-1" />
    </div>
  );

  //Two Forms exist in order for the seperate submission of two seperate types of data.
  //First one is the submission of ISBNS that need to be added
  //Second one is the submission of the added books and their modified fields

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="flex col-12 p-0">
        {backButton}
        <div className="pt-2 col-10">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Add Books
          </h1>
        </div>
      </div>
      <div className="col-12">
        <form onSubmit={onISBNInitialSubmit}>
          <div className="justify content center col-6 col-offset-3">
            <div className="py-2">
              <label
                className="text-xl p-component text-teal-900 p-text-secondary"
                htmlFor="addbook"
              >
                Enter ISBN-13 values, separated by comma or space:
              </label>
            </div>
            <InputTextarea
              id="addbook"
              name="addbook"
              value={textBox}
              onChange={(e: FormEvent<HTMLTextAreaElement>) =>
                setTextBox(e.currentTarget.value)
              }
              rows={5}
              cols={30}
              className="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
            <div className="flex flex-row justify-content-between card-container col-12">
              <Button
                label="Clear"
                type="button"
                onClick={() => setTextBox("")}
                className="p-button-info"
              />
              <div>
                {isLoadingButton && (
                  <i
                    className="pi pi-spin pi-spinner mr-1"
                    style={{ fontSize: "2rem" }}
                  ></i>
                )}
                <Button
                  id="addbooksubmission"
                  name="addbooksubmission"
                  label="Lookup"
                  type="submit"
                  icon
                  className="p-button-success p-button-raised"
                />
              </div>
            </div>
          </div>
        </form>
        <div className="pt-3">
          <label
            htmlFor="addbookcompletion"
            className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);"
          >
            Edit Fields
          </label>
        </div>
        <form onSubmit={onFinalSubmit}>
          <DataTable
            value={books}
            showGridlines
            editMode="cell"
            className="editable-cells-table py-5"
            responsiveLayout="scroll"
            size="small"
          >
            {columns}
          </DataTable>
          <div className="flex justify-content-center col-12">
            <Button
              id="confirmbooks"
              name="confirmbooks"
              label="Submit"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
