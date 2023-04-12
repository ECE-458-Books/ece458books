import { FormEvent, useEffect, useRef, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import {
  DataTable,
  DataTableExpandedRows,
  DataTableRowToggleEvent,
} from "primereact/datatable";
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
import { filterById, findById } from "../../util/IDOps";
import BackButton from "../../components/buttons/BackButton";
import "../../css/TableCell.css";
import DeleteColumn from "../../components/datatable/DeleteColumn";
import { ProgressSpinner } from "primereact/progressspinner";
import { Column } from "primereact/column";
import BookDetailRelatedBooks from "./BookDetailRelatedBooks";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ImportFieldButton from "../../components/buttons/ImportFieldButton";
import { Tooltip } from "primereact/tooltip";

export interface BookWithDBTag extends Book {
  fromDB: boolean;
}

export default function BookAdd() {
  const navigate = useNavigate();
  const [textBox, setTextBox] = useState<string>("");
  const [books, setBooks] = useImmer<BookWithDBTag[]>([]);
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);

  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | undefined
  >(undefined);

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
      className="genreDropdown"
      showClearButton={false}
    />
  );

  // Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
  const COLUMNS: TableColumn<BookWithDBTag>[] = [
    {
      field: "fromDB",
      header: "Book Status",
      customBody: statusTemplate,
      style: { width: "2%", fontSize: "small" },
    },
    {
      field: "thumbnailURL",
      header: "Cover Art",
      customBody: (rowData: BookWithDBTag) =>
        ImageTemplateWithButtons(
          imageImportButton(rowData),
          imageDeleteButton(rowData),
          imageUploadButton(rowData),
          rowData.thumbnailURL
        ),
      style: { width: "2%", fontSize: "small" },
    },

    {
      field: "title",
      header: "Title",
      style: { width: "25%", fontSize: "small" },
    },
    {
      field: "author",
      header: "Authors",
      style: { width: "10%", fontSize: "small" },
    },
    {
      field: "genres",
      header: "Genre (Required)",
      style: { width: "10%", fontSize: "small" },
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
      header: "ISBN 13 & ISBN 10",
      style: { width: "4%", fontSize: "small" },
      customBody: (rowData: BookWithDBTag) => (
        <>
          <div>{rowData.isbn13}</div>
          <div>{rowData.isbn10}</div>
        </>
      ),
    },
    {
      field: "publisher",
      header: "Publisher",
      style: { width: "10%", fontSize: "small" },
    },
    {
      field: "publishedYear",
      header: "Publish Year",
      style: { width: "4%", fontSize: "small" },
    },
    {
      field: "pageCount",
      header: "Page Count",
      style: { width: "2%", fontSize: "small" },
      customBody: (rowData: BookWithDBTag) => (
        <>
          <div>
            {NullableIntegerEditor(
              rowData.pageCount,
              (newValue) => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.pageCount = newValue;
                });
              },
              "integerNumbeBookAdd"
            )}
          </div>
          <div>
            <label style={{ fontSize: "0.7rem" }}>
              {rowData.remoteBook &&
              rowData.remoteBook.pageCount != rowData.pageCount
                ? `(R: ${rowData.remoteBook.pageCount})`
                : ""}
            </label>
            <ImportFieldButton
              onClick={() => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.pageCount = book.remoteBook!.pageCount;
                });
              }}
              isDisabled={
                rowData.remoteBook?.pageCount == rowData.pageCount ||
                !rowData.remoteBook?.pageCount
              }
              isVisible={rowData.remoteBook?.pageCount != null}
              className="mt-1 ml-1 addPageImportIcon"
              style={{ height: 20, width: 20 }}
            />
          </div>
        </>
      ),
    },
    {
      field: "width",
      header: "Width",
      style: { width: "2%", fontSize: "small" },
      customBody: (rowData: BookWithDBTag) => (
        <>
          <div>
            {NullableNumberEditor(
              rowData.width,
              (newValue) => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.width = newValue;
                });
              },
              "decimalNumberBookAdd",
              false,
              0.01
            )}
          </div>
          <div>
            <label style={{ fontSize: "0.7rem" }}>
              {rowData.remoteBook && rowData.remoteBook.width != rowData.width
                ? `(R: ${rowData.remoteBook.width})`
                : ""}
            </label>
            <ImportFieldButton
              onClick={() => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.width = book.remoteBook!.width;
                });
              }}
              isDisabled={
                rowData.remoteBook?.width == rowData.width ||
                !rowData.remoteBook?.width
              }
              isVisible={rowData.remoteBook?.width != null}
              className="mt-1 ml-1 addPageImportIcon"
              style={{ height: 20, width: 20 }}
            />
          </div>
        </>
      ),
    },
    {
      field: "height",
      header: "Height",
      style: { width: "2%", fontSize: "small" },
      customBody: (rowData: BookWithDBTag) => (
        <>
          <div>
            {NullableNumberEditor(
              rowData.height,
              (newValue) => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.height = newValue;
                });
              },
              "decimalNumberBookAdd",
              false,
              0.01
            )}
          </div>
          <div>
            <label style={{ fontSize: "0.7rem" }}>
              {rowData.remoteBook && rowData.remoteBook.height != rowData.height
                ? `(R: ${rowData.remoteBook.height})`
                : ""}
            </label>
            <ImportFieldButton
              onClick={() => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.height = book.remoteBook!.height;
                });
              }}
              isDisabled={
                rowData.remoteBook?.height == rowData.height ||
                !rowData.remoteBook?.height
              }
              isVisible={rowData.remoteBook?.height != null}
              className="mt-1 ml-1 addPageImportIcon"
              style={{ height: 20, width: 20 }}
            />
          </div>
        </>
      ),
    },
    {
      field: "thickness",
      header: "Thickness",
      style: { width: "2%", fontSize: "small" },
      customBody: (rowData: BookWithDBTag) => (
        <>
          <div>
            {NullableNumberEditor(
              rowData.thickness,
              (newValue) => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.thickness = newValue;
                });
              },
              "decimalNumberBookAdd",
              false,
              0.01
            )}
          </div>
          <div>
            <label style={{ fontSize: "0.7rem" }}>
              {rowData.remoteBook &&
              rowData.remoteBook.thickness != rowData.thickness
                ? `(R: ${rowData.remoteBook.thickness})`
                : ""}
            </label>
            <ImportFieldButton
              onClick={() => {
                setBooks((draft) => {
                  const book = findById(draft, rowData.id)!;
                  book.thickness = book.remoteBook!.thickness;
                });
              }}
              isDisabled={
                rowData.remoteBook?.thickness == rowData.thickness ||
                !rowData.remoteBook?.thickness
              }
              isVisible={rowData.remoteBook?.thickness != null}
              className="mt-1 ml-1 addPageImportIcon"
              style={{ height: 20, width: 20 }}
            />
          </div>
        </>
      ),
    },
    {
      field: "retailPrice",
      header: "Retail Price (Required)",
      style: { width: "2%", fontSize: "small" },
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
    {
      field: "numRelatedBooks",
      header: "Number of Related Books",
      style: { width: "4%", fontSize: "small" },
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

  const onImageImport = (book: BookWithDBTag) => {
    const remoteImageURL = book.remoteBook!.thumbnailURL!;
    axios
      .get(remoteImageURL, {
        responseType: "blob",
      })
      .then((r) => {
        const blob = new Blob([r.data]);
        const file = new File([blob], "imageFile" + book.id);
        const newImageData: NewImageUploadData = {
          imageFile: file,
          isImageUpload: true,
          isImageDelete: false,
        };

        setBooks((draft) => {
          const newBook = findById(draft, book.id)!;
          newBook.newImageData = newImageData;
          newBook.thumbnailURL = URL.createObjectURL(file);
        });
      })
      .catch(() => {
        showFailure(toast, "Could not import image");
      });
  };

  // Image template buttons
  const imageUploadButton = (rowData: BookWithDBTag) => {
    return (
      <>
        <Tooltip target=".custom-bookadd-tooltip" showDelay={100} />
        <div
          className="custom-bookadd-tooltip"
          data-pr-tooltip={"Upload Custom Image"}
        >
          <ImageUploader
            uploadHandler={(e: FileUploadHandlerEvent) =>
              onImageChange(e, rowData.id)
            }
            className="addPageImportIcon"
            style={{ height: 20, width: 20, paddingLeft: 3, paddingRight: 3 }}
          />
        </div>
      </>
    );
  };

  const imageDeleteButton = (rowData: BookWithDBTag) => {
    return (
      <Button
        type="button"
        icon="pi pi-trash"
        onClick={() => onImageDelete(rowData.id)}
        className="addPageImportIcon"
        style={{ height: 20, width: 20 }}
        tooltip="Delete Image"
        tooltipOptions={{ showDelay: 100 }}
      />
    );
  };

  const imageImportButton = (rowData: BookWithDBTag) => {
    return (
      <ImportFieldButton
        onClick={() => onImageImport(rowData)}
        isDisabled={
          rowData.remoteBook?.thumbnailURL == rowData.thumbnailURL ||
          !rowData.remoteBook?.thumbnailURL
        }
        isVisible={rowData.remoteBook?.thumbnailURL != null}
        className="addPageImportIcon"
        style={{ height: 20, width: 20 }}
        tooltip="Import Remote Image"
        tooltipOptions={{ showDelay: 100 }}
      />
    );
  };

  // Initial add book

  const onISBNInitialSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Submitting Initial Book Lookup", textBox);
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

      // Only add book if ISBN 13 is unique
      if (!draft.some((book) => book.isbn13 === newBook.isbn13)) {
        draft.push(newBook);
      }
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

    const bookRequests = [];

    for (const book of books) {
      if (!book.fromDB || (book.isGhost && book.fromDB)) {
        bookRequests.push(
          BOOKS_API.addBookFinal({
            book: InternalToAPIBookConversion(book),
            image: book.newImageData!.imageFile,
            isImageUploaded: book.newImageData!.isImageUpload!,
            isImageRemoved: book.newImageData!.isImageDelete!,
          })
        );
      } else {
        bookRequests.push(
          BOOKS_API.modifyBook({
            book: InternalToAPIBookConversion(book),
            image: book.newImageData!.imageFile!,
            isImageUploaded: book.newImageData!.isImageUpload!,
            isImageRemoved: book.newImageData!.isImageDelete!,
          })
        );
      }
    }

    axios
      .all(bookRequests)
      .then(() => {
        showSuccess(toast, "Books added successfully");
        navigate("/books");
      })
      .catch(() => {
        showFailure(toast, "One or more of the books failed to add");
      });
    event.preventDefault();
  };

  const clearEditTable = () => {
    setBooks([]);
  };

  // Delete icon for each row
  const deleteColumn = DeleteColumn<BookWithDBTag>({
    onDelete: (rowData) => {
      filterById(books, rowData.id, setBooks);
    },
    style: { width: "2%", fontSize: 12 },
    buttonStyle: { width: 30, height: 30 },
    hideHeader: true,
  });

  const columns = createColumns(COLUMNS);

  const backButton = (
    <div className="flex col-1">
      <BackButton className="ml-1" />
    </div>
  );

  const rowExpansionTemplate = (rowData: BookWithDBTag) => {
    return (
      <div>
        <h5 className="p-2 m-0">Related Books for {rowData.title}</h5>
        <div className="col-10 p-0 pb-3">
          <BookDetailRelatedBooks
            relatedBooks={rowData.relatedBooks}
            globalClassName="text-sm"
            disableRowClick={true}
          />
        </div>
      </div>
    );
  };

  const allowExpansion = (rowData: BookWithDBTag) => {
    return rowData.relatedBooks!.length > 0;
  };

  const rowExpanderColumn = (
    <Column
      header="View Related Books"
      expander={allowExpansion}
      style={{ width: "2%", fontSize: 12, padding: "0.1rem" }}
    />
  );

  const collapseAll = () => {
    setExpandedRows(undefined);
  };

  const collapseAllButton = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        icon="pi pi-minus"
        type="button"
        label="Collapse All"
        onClick={collapseAll}
      />
    </div>
  );

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
                Enter ISBN-13 values, separated by comma, space, or newline:
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
              <div className="flex">
                {isLoadingButton && (
                  <div className="justify-content-center mr-2 my-auto">
                    <ProgressSpinner
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                      strokeWidth="8"
                      fill="var(--surface-ground)"
                      animationDuration=".5s"
                    />
                  </div>
                )}
                <Button
                  id="addbooksubmission"
                  name="addbooksubmission"
                  label="Lookup"
                  type="submit"
                  disabled={textBox.length == 0}
                  icon
                  className="p-button-success"
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
          <div className="grid flex justify-content-center">
            <div className="col-12">
              <DataTable
                emptyMessage={"Lookup books to add them to this table"}
                value={books}
                showGridlines
                editMode="cell"
                className="editable-cells-table py-5"
                responsiveLayout="scroll"
                size="small"
                expandedRows={expandedRows}
                header={collapseAllButton}
                onRowToggle={(e: DataTableRowToggleEvent) =>
                  setExpandedRows(e.data as DataTableExpandedRows)
                }
                // I think something is wrong with the PrimeReact library, because
                // the code in the demo works, but TypeScript complains about it
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                rowExpansionTemplate={rowExpansionTemplate}
              >
                {rowExpanderColumn}
                {columns}
                {deleteColumn}
              </DataTable>
            </div>
            <div className="flex justify-content-between col-4">
              <Button
                id="clearEditTable"
                name="clearEditTable"
                label="Clear"
                type="button"
                onClick={clearEditTable}
                className="p-button-info"
              />
              <Button
                id="confirmbooks"
                name="confirmbooks"
                label="Submit & Go Back"
                disabled={books.length == 0}
                className="p-button-success p-button-raised"
                type="submit"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
