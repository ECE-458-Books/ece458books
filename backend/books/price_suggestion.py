from bs4 import BeautifulSoup
import requests


def get_price_suggestion(isbn):
    base_url = 'https://www.abebooks.com/servlet/SearchResults?sts=t&cm_sp=SearchF-_-home-_-Results&ds=100&an=&tn=&kn=&isbn='
    page = requests.get(base_url + str(isbn))
    soup = BeautifulSoup(page.content, 'html.parser')
    results = soup.find_all(class_="item-price")
    prices = [float(x.text[-5:]) for x in results]

    if len(prices) == 0:
        return None

    return round(sum(prices) / len(prices), 2)
