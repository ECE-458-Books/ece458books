from paramiko import SSHClient, AutoAddPolicy
from scp import SCPClient
import environ, os, io
import PIL.Image as Image

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
        file_bytes,
        file_location: str,
    ):
        self.connect_ssh()
        self.connect_scp()
        image = Image.open(io.BytesIO(file_bytes))
        image.save(file_location)
        self.scp.put(file_location, remote_path='/srv/media/books')
        self.close_scp_ssh()

        return self.SCP_HOST+'/media/books'
