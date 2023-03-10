import environ, os, io
import asyncio, asyncssh, sys
from datetime import datetime

# from .utils import delete_all_files_in_file_location

class SCPTools:
    def __init__(
        self,
    ):
        self.ssh = None
        self.scp = None
        self.setup_envvar()
    
    def setup_envvar(
        self,
    ):
        env = environ.Env()
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

        self.SCP_HOST = env('SCP_HOST')
        self.SCP_USER= env('SCP_USER')
        self.SCP_PASSWORD = env('SCP_PASSWORD')
        self.INTERNAL_BOOK_IMAGE_ABSOLUTE_PATH=env('INTERNAL_BOOK_IMAGE_ABSOLUTE_PATH')
        self.INTERNAL_BOOK_IMAGE_REMOTE_PATH=env('INTERNAL_BOOK_IMAGE_REMOTE_PATH')
    
    def get_host(self):
        return self.SCP_HOST
    
    def send_image_data(
        self,
        file_location: str,
    ):
        retry = 0
        retry_limit = 5
        while True:
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                asyncio.get_event_loop().run_until_complete(self.program(file_location))
                break
            except (OSError, asyncssh.Error) as exc:
                if retry > retry_limit:
                    sys.exit(f'SSH connection failed after retrying {retry_limit} times ' + str(exc))
                    
                retry = retry + 1
                print(f'SSH connection failed.. retrying {retry}:{file_location}')

        # Delete my sent image
        os.remove(file_location)

        return self.SCP_HOST + self.INTERNAL_BOOK_IMAGE_REMOTE_PATH
    
    async def run_client(self):
        while True:
            conn = await asyncio.wait_for(asyncssh.connect(self.SCP_HOST, username=self.SCP_USER, password=self.SCP_PASSWORD, known_hosts = None),20)
            if conn != None:
                break
        return conn

    async def program(self, file_location):
        await asyncio.gather(self.run_command(file_location))

    async def run_command(self, file_location):    
        conn = await self.run_client()        
        await asyncssh.scp(file_location, (conn, self.INTERNAL_BOOK_IMAGE_ABSOLUTE_PATH))
        conn.close()
