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
        file_bytes,
        file_location: str,
    ):
        self.connect_ssh()
        self.connect_scp()
        image = Image.open(io.BytesIO(file_bytes))
        image.save(file_location)
        self.scp.put(file_location, remote_path='/srv/media/books')
        self.close_scp_ssh()

        # Delete images
        self.delete_all_files_in_file_location(file_location)

        return self.SCP_HOST+'/media/books'
    
    def delete_all_files_in_file_location(self, file_location):
        folder = '/'.join(file_location.split('/')[:-1])
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                raise e
                # print('Failed to delete %s. Reason: %s' % (file_path, e))
