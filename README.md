
# ece458books
Django based Web Application for Hypothetical Books

## Set up/Installation Guides

Make sure you have make installed.

Setting up/deploying with Docker: https://www.notion.so/Docker-dc44e0b9ae6e4e4396ae44f5c9522a44

## Deployment Commands

To deploy the frontend locally: `make front-local`

To deploy the frontend to the remote dev environment: `make front-remote`

## Owners

- Hosung Kim, [@hkder](https://github.com/hkder)
- Daniel Feinblatt [@danielfeinblatt](https://github.com/danielfeinblatt)
- Casey Szilagyi [@caseyszilagyi](https://github.com/caseyszilagyi)
- Haseeb Chaudhry [@nex-pixel](https://github.com/nex-pixel)

## Contributing

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/ubuntu/)
- [Make](https://www.gnu.org/software/make/)

### Getting Started (Backend)

1. Clone this repository.
2. Contact the repo owners for .env file and save them under `backend/hypothetical_books_backend/` directory.
3. From the project directory, run:
   - `make back-local` to deploy backend server locally
4. Use <http://[hostname]:8000> for the main application.
