shared_headers = ["isbn", "quantity"]

csv_column_headers = {"purchases": ["unit_price"], "sales": ["unit_price"], "buybacks": ["unit_price"]}

csv_export_column_headers = {
    'books': ['title', 'authors', 'isbn_13', 'isbn_10', 'publisher', 'publication_year', 'page_count', 'height', 'width', 'thickness', 'retail_price', 'genre', 'inventory_count', 'shelf_space_inches', 'last_month_sales', 'days_of_supply', 'best_buyback_price', 'num_related_books']
}

def get_csv_headers(csv_import_type: str) -> list:
    if csv_import_type is None:
        raise ValueError("You must specify the type of csv import")

    headers = csv_column_headers.get(csv_import_type, None) + shared_headers

    if headers is None:
        raise ValueError("The specified csv import type is not a valid option. Please choose one of:" + list(csv_column_headers.keys()))
    return headers

def get_csv_export_headers(csv_export_type: str) -> list:
    headers = csv_export_column_headers.get(csv_export_type, None)
    return headers
