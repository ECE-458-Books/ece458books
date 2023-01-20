# Frontend

## Deployment Guide:

Set up an SSH key on your local machine, and then add the public key to Duke's OIT Self-Service [here]( https://idms-web-selfservice.oit.duke.edu/advanced)

Create a VM, and SSH into it by running ssh (netID)@(vmAddress)

Once in the VM, install Docker. This can be done by running the commands in the "Set up the repository" section and the "Install Docker Engine" section 
 (reference [here](https://docs.docker.com/engine/install/ubuntu/#set-up-the-repository)):

Then, to start the Docker daemon service, run

`sudo systemctl start docker`

`sudo schmod 666 /var/run/docker.sock`

The VM setup is now complete. Now, we can deploy the service from our local machine (The "service" I'm currently deploying is just a template for a React app that came with a Dockerfile, and I added a simple docker-compose.yml file as well)

Run the following commands to let docker target the VM (from the same folder that has the Dockerfile/docker-compose.yml):

`docker context create remote --docker host=ssh:/crs79@books-front.colab.duke.edu`

`docker context use remote`

Then, build the image and deploy it to the VM

`docker build -t frontend .` to build the Docker image
`docker compose run --service-ports frontend` to deploy it
`docker --context remote ps` to check that it's running



