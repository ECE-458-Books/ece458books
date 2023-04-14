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
        # It’s a good practice to set connect timeouts to slightly larger than a multiple of 3, which is the default TCP packet retransmission window.
        # https://www.hjp.at/doc/rfc/rfc2988.txt
        response = requests.request("POST", url, headers=headers, data=payload, timeout=(3.05, 9.05))

        ret = response.json()

        if isinstance(isbn, list):
            return ret

        ret = ret[isbn]
        return ret
    
    def create_headers(self):
        return {'Content-Type': 'application/json'}
    
    def create_payload(self, isbn):
        payload = isbn
        if not isinstance(payload, list):
            payload = [isbn]

        return json.dumps({'isbns': payload})

