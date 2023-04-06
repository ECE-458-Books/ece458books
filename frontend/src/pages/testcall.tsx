import axios from "axios";
import { useEffect } from "react";

interface APIBook {
  title: string;
  authors: string[];
  isbn13: string;
  //etc
}

interface BookDict {
  [isbn13: string]: APIBook;
}

export default function ExampleCall() {
  useEffect(() => {
    axios
      .request({
        url: "https://books-test.colab.duke.edu/api/v1/books/remote/lookup",
        method: "POST",
        data: {
          isbns: ["9780099536666", "9781948579674"],
        },
      })
      .then((response) => {
        const respTyped = response.data as BookDict[];
        console.log(response);
        for (const dict of respTyped) {
          console.log(dict);
        }
      });
  });

  return <div>Example Call</div>;
}
