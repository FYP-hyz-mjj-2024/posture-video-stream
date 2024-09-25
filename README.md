### Start WebSocket Server
`node public/ws-server.js`

### Start Next Server
`npm run dev`

# Build with Docker
## 1. Build Docker Mirror
```shell
docker build -t smart-device-usage-detection .
```
- `-t smart-device-usage-detection`: Name the Docker image as `smart-device-usage-detection`.
- `.`: Build context is current directory, which contains `Dockerfile` and all codes.

## 2. Run the docker container
```shell
docker run -p 3000:3000 -p 8080:8080 smart-device-usage-detection
```
- `-p 3000:3000`: Map main port `3000` to container port `3000`, for `Next.js` app.
- `-p 8080:8080`: Map main port `8080` to container port `8080`, for `WebSocket` server.

After running this command, the container will run:
- the next app at `http://localhost:3000`, and 
- the websocket at `ws://localhost:8080`.

## 3. Access and Test the Miror
### 3.1 Find running containers
```shell
docker ps
```
You will receive:
```console
CONTAINER ID   IMAGE                          COMMAND                   CREATED          STATUS         PORTS                                            NAMES
d4238047209a   smart-device-usage-detection   "docker-entrypoint.s…"    3 minutes ago    Up 3 minutes   0.0.0.0:3000->3000/tcp, 0.0.00:8080->8080/tcp   eloquent_swirles
```
You will be mainly using the `CONTAINER ID`.

### 3.2 Stop a container
Using the `CONTAINER ID` get from `docker ps`, run
```shell
docker stop <CONTAINER_ID>
```

### 3.3 Remove a container
Using the `CONTAINER ID` get from `docker ps`, run
```shell
docker rm <CONTGAINER_ID>
```
