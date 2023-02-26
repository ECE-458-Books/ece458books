from paramiko import SSHClient, AutoAddPolicy
from scp import SCPClient
import environ, os, io

from .utils import delete_all_files_in_file_location

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


    def connect_ssh(
        self,
    ):
        self.ssh = SSHClient()
        self.ssh.load_system_host_keys()
        self.ssh.set_missing_host_key_policy(AutoAddPolicy())
        self.ssh.connect(self.SCP_HOST, username=self.SCP_USER, password=self.SCP_PASSWORD)
    
    def connect_scp(
        self,
    ):
        self.scp = SCPClient(self.ssh.get_transport())
    
    def close_scp_ssh(
        self,
    ):
        self.scp.close()
        self.ssh.close()
    
    def send_image_data(
        self,
        file_location: str,
    ):
        self.connect_ssh()
        self.connect_scp()
        self.scp.put(file_location, remote_path=self.INTERNAL_BOOK_IMAGE_ABSOLUTE_PATH)
        self.close_scp_ssh()

        # Delete images
        delete_all_files_in_file_location(file_location)

        return self.SCP_HOST + self.INTERNAL_BOOK_IMAGE_REMOTE_PATH
    