export const generateDockerCompose=(data)=>{
  const { name, author, dbType, dbname}= data
  const dbConfigs ={
    ['postgres']:`
  db:
    image: postgres:16
    container_name: db
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          memory: 2gb
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - '127.0.0.1:5432:5432'
    volumes:
      - db_data:/var/lib/postgresql/data`,
    ['mssql']:`
  db:
    image: mcr.microsoft.com/mssql/server:2017-latest
    ports:
      - 1433:1433
    container_name: db
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          memory: 2gb
    environment:
      - MSSQL_SA_PASSWORD=passw0rd
      - ACCEPT_EULA=Y
      - MSSQL_PID=Developer
    volumes:
      - ./db_data:/var/opt/mssql`,
  }

  
  const template = `version: '3'
services:
  api:
    restart: always
    env_file:
      - .docker-compose.env
    ports:
      - '8888:8888'
    volumes:
      - .:/home/node/app
    build:
      context: .
      dockerfile: ./Dockerfile
    command: node dist/main.js
    depends_on:
      - db
${dbConfigs[dbType]}
volumes:
  db_data:`

    return template
}

