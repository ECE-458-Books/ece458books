shared_headers = ["isbn_13", "quantity"]

csv_column_headers = {
    "purchases": ["unit_wholesale_price"],
    "sales": ["unit_retail_price"],
    "buybacks": ["unit_buyback_price"]
}


def get_csv_headers(csv_import_type: str) -> list:
    if csv_import_type is None:
        raise ValueError("You must specify the type of csv import")

    headers = csv_column_headers.get(csv_import_type, None) + shared_headers

    if headers is None:
        raise ValueError("The specified csv import type is not a valid option. Please choose one of:" +
                         list(csv_column_headers.keys()))
    return headers
