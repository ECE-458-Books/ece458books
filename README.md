
## Set up/Installation Guides

Installing Task: https://taskfile.dev/installation/

Setting up/deploying with Docker: https://www.notion.so/Docker-dc44e0b9ae6e4e4396ae44f5c9522a44

## Deployment Commands

To deploy the frontend locally: `task deploy-frontend-local`

To deploy the frontend to the dev environment: `task deploy-frontend-dev`

# ece458books
Django based Web Application for Hypothetical Books

## Owners

- Hosung Kim, [@hkder](https://github.com/hkder)

## Contributing

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/ubuntu/)
- [Task](https://taskfile.dev/installation/)

### Getting Started (Backend)

1. Clone this repository.
2. Contact the repo owners for .env file and save them under `backend/hypothetical_books_backend/` directory.
3. From the project directory, run:
   - `task deploy-backend-local-dev` to deploy backend server locally
   - `task deploy-backend-local-docker` to deploy backend server locally using docker
4. Use <http://127.0.0.1:8000> for the main application.
4. Use <http://[hostname]:8000> for the main application.
