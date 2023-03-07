import os, fnmatch
from django.conf import settings
import environ

def delete_all_files_in_folder_location(folder):
    for filename in os.listdir(folder):
        if filename == '.gitkeep':
            continue

        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            raise e
            # print('Failed to delete %s. Reason: %s' % (file_path, e))

def delete_all_files_in_file_location(file_location):
    folder = '/'.join(file_location.split('/')[:-1])
    delete_all_files_in_folder_location(folder)

def find(name, path):
    for root, dirs, files in os.walk(path):
        if name in files:
            return os.path.join(root, name)

def find_pattern(pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append({
                    "full_path": os.path.join(root,name),
                    "filename": name,
                })
    return result

def reformat_url(url):
    reformat_url = url.replace("http://", "https://")
    port = get_port_number(reformat_url)

    reformat_url = reformat_url.replace(f":{port}", "")

    return reformat_url

def get_port_number(url):
    if(len(url.split(":"))<2):
        return None
    return url.split(":")[2].split("/")[0]

def url_to_static_image_service(url):
    # This gets rid of the /api/v1 format of the url
    # e.g. https://books.colab.duke.edu/api/v1 => https://books.colab.duke.edu
    # In this case, static images are served in https://books.colab.duke.edu/media/books
    return '/'.join(url.split('/')[:3])

def uri_to_local_image_location(uri, static_file_location):
    url = url_to_static_image_service(reformat_url(uri))
    local_image_location = url + static_file_location

    return local_image_location


def str2bool(v):
    if v: return v.lower() in ("true", "1")
    return False

class ImageTools:
    def __init__(
        self,
    ):
        env = environ.Env()
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

        self._base_url = env('EXTERNAL_BOOK_METADATA_API_ENDPOINT')
        self._image_base_url = env('EXTERNAL_BOOK_IMAGE_API_ENDPOINT')
        self._internal_image_base_url = env('INTERNAL_BOOK_IMAGE_API_ENDPOINT')
        self._default_image_name = env('DEFAULT_IMAGE_NAME')
    

    def _get_local_image_files(self, book_isbn_13):
        path = settings.STATICFILES_DIRS[0]
        regex_book = f'{book_isbn_13}.*'
        local_image_files = find_pattern(regex_book, path)

        return local_image_files

    def get_local_image_url(self, book_isbn_13, uri):
        endpoint = uri_to_local_image_location(uri)
        local_image_files = self._get_local_image_files(book_isbn_13)

        if len(local_image_files) != 0:
            return endpoint + local_image_files[0]['filename'], True

        return endpoint + self._default_image_name, False

    def destroy_local_image(self, book_isbn_13):
        local_image_files = self._get_local_image_files(book_isbn_13)

        destroyed_files = []

        for image_file in local_image_files:
            destroyed_files.append(image_file['filename'])
            os.remove(image_file['full_path'])

        return destroyed_files
