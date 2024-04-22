## Prerequisites 

To run the full app, you'll need to have Docker and Docker Compose installed on your machine. You can check if they're already installed by running `docker --version` and `docker-compose --version` in your terminal.

If you don't have them installed, please install Docker and Docker Compose according to the official [installation instructions](https://docs.docker.com/engine/install/)

## Configuring Environment Variables

There are 2 main variables to set before starting the app:
```
./src/app/config.ts 
```
This holds the URL that front end will use to access the backend (flask application). As we hosted it for testing, we setup both containers on the same machine via compose, pointing them to a reverse-proxy that exposed them to two separate urls, with the assumption to be able to scale either one, run each one on a separate machine, or put load balancing behind them, etc. If you'd like, its also possible to use local hostnames that compose provides automatically to have both containers run locally on the same machine and have them communicate correctly. Just make sure to adjust the url in `config.ts` accordingly. More info for this can be found [here](https://docs.docker.com/compose/networking/#use-auto-provided-hostnames)

```
./flask_db_conn_api/app.py --lines 8-16
```
Here can be configured the url/credentials for connecting the flask instance to a database. For our testing, we used an external posgres instance. While the ORM we used says it supports other SQL versions like mySQL, SQLite, etc, we only tested with Posgres. Upon connecting to a new database, our flask app will automatically populate it with the necessary tables, if they don't exist. 




## Running the Docker Compose File

Once you have them installed, navigate to the root directory of your project and run the following command:
```bash
docker-compose up -d
```
This will start all the services defined in the `docker-compose.yml` file in detached mode. You can then access your web app by visiting `http://localhost:8000` (or whichever port is specified in the `ports` section of your `docker-compose.yml` file) in a web browser.

If you want to stop the services, run:
```bash
docker-compose down
```




## Running the App with Docker

If for some reason you'd like to spin up each container individually, follow these steps to run the app using Docker:

1. Build the Docker image:
    ```bash
    docker build -t angular-fe-app .
    ```

2. Run the Docker container:
    ```bash
    docker run -d --name my-app -p 8080:80 angular-fe-app
    ```

    * This will run the container and expose it to the host's port 8080


