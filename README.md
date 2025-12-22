Setup posgresql local
docker run --name im-alive-db -e POSTGRES_PASSWORD=123456 -d -p 5432:5432 postgres

Create migration
npm run migration:generate --name=CreateUserTable