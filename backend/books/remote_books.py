import os, environ, requests, json

class RemoteSubsidiaryTools:
    def __init__(self):
        env = environ.Env()
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

        self._remote_store_api_url = env('EXTERNAL_SUBSIDIARY_STORE_REMOTE_ENDPOINT')

    def get_remote_book_data(self, isbn):
        url = self._remote_store_api_url
        headers = self.create_headers()
        payload = self.create_payload(isbn)
        response = requests.request("POST", url, headers=headers, data=payload)

        # The first index will be removed if the reponse is only a dictionary
        ret = response.json()[0]
        ret = ret[isbn]

        return ret
    
    def create_headers(self):
        return {'Content-Type': 'application/json'}
    
    def create_payload(self, isbn):
        return json.dumps({'isbns': [isbn]})

