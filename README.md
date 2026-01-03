Setup posgresql local
docker run --name im-alive-db -e POSTGRES_PASSWORD=xxxx -d -p 5432:5432 postgres

Create migration
npm run migration:generate --name=CreateCheckInModule
npm run migration:run
