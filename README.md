# Winmonopolet

Winmonopolet is a webapp that matches all the beers, ciders and meads at [Vinmonopolet](https://vinmonopolet.no) to [Untappd](https://untappd.com/) in order to help you find the best rated beers in stock, right now, at your local Vinmonopolet outlet.

<br>
<br>
<br>

<p align="center"><img src="https://winmonopolet.no/images/snirkel.svg" width="200"></p>

## Development setup

### Note

Some functionality will not work locally. API calls to untappd and user authentication will not work without an API key, but is not strictly required for general development. I am currently working on mocking more of the external services to make it easier to develop locally without API access to untappd.

I also plan on providing a sample database, but as of this writing this is not available just yet. But soon!

### Prerequisites

- A Postgres instance
- Node v16 or later

### Install

#### Clone the project:

```
git clone https://github.com/LarsEllefsen/WinMonopolet.git
```

#### Install the dependencies for both the frontend and backend modules:

```
cd frontend && npm install
```

```
cd backend && npm install
```

#### Set up environment variables:

Create a .env file in both the backend and frontend folders.

```
#backend/.env

#Your postgres database databse connection string. Is used by dbmate to run migrations
DATABASE_URL=postgres://<user>:<password>@l<host>:<port>/<db>?sslmode=disable

# The postgres database user
DB_USER=<user>

# The postgres database port
DB_PORT=<port>

# The postgres database user
DB_PASSWORD=<password>

# The postgres database name
DB_NAME=<name>

# The api key used to send mails. Unless you want to test email sending this can be a dummy value
MAILGUN_API_KEY=dummykey

# A key used to decode JWTs. Can be changed to any 256-bit string of your choice or kept as is.
JWT_SECRET=17oHEhYkSOSWTrW7rue46UJmKqIoBmaC

# A key used to encrypt user access tokens. Can be changed to any 256-bit string of your choice or kept as is.
ACCESS_TOKEN_ENCRYPTION_KEY=nfUZ6nCUm34sQUsGQwrGpwA3B8TkNKRw

# the base url of the untappd api
UNTAPPD_BASE_URL=https://api.untappd.com/v4/

# The client id and client secret for the untappd api. Unless you have an actual api these can be kept as dummy values
UNTAPPD_CLIENT_ID=dummyClientId
UNTAPPD_CLIENT_SECRET=dummySecret

# Turn on development mode. Turns on debug logging and disables schedules jobs.
DEV=TRUE

```

```
#frontend/.env

# The backend api url.
API_URL=http://localhost:3000

# A key used to encode JWTs. Should be the same as the one in the backend .env file
JWT_SECRET=17oHEhYkSOSWTrW7rue46UJmKqIoBmaC

```

#### Run database migrations

In the backend directory run:

```
npm run migrate
```

#### Start the backend

In the backend directory run:

```
npm start:dev
```

#### Start the frontend

In the frontend directory run:

```
npm start:dev
```

The app should now available on `http://localhost:5173`
