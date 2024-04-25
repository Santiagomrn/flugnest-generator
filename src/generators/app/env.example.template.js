
export const generateEnvExample=(data)=>{
    const { name, author, dbType, dbname}= data
    const dbUsers={
        ['postgres']:'postgres',
        ['mssql']:'sa',
        ['mysql']:`root`,
        ['sqlite']:'root'
      }
    const template =`# APP
APP_NAME="${name}"
SERVER_PORT="3000"
env="development"
LOG_TO_FILES="true"

# URL
API_URL="(your api server url)"
URLS_PROTOCOL="http"
URLS_URL="localhost"
URLS_PORT="3000"
URLS_API_ROOT=""

#JWT
JWT_SECRET="USE A REAL SECRET VALUE"
JWT_EXPIRY_HOURS="2"

#LOGS
LOG_LEVEL="http"
LOG_TO_FILES="false"

# Swagger
SWAGGER_ROUTE="swagger"
SWAGGER_USERNAME="admin"
SWAGGER_PASSWORD="password"
SWAGGER_HAS_AUTH="true"

# DB
DB_TYPE="${dbType}"
DB_HOST="localhost"
DB_NAME="${dbname}"
DB_USER="${dbUsers[dbType]}"
DB_PASSWORD=""

EMAIL_FROM_ADDRESS="from@example.com"
EMAIL_SMTP_HOST="sandbox.smtp.mailtrap.io"
EMAIL_SMPT_PORT=2525
EMAIL_SMTP_SECURE="false"
EMAIL_SMTP_USER=""
EMAIL_SMTP_PASS=""


GOOGLE_CLIENT_ID="apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET=""

#TEST_DB
TEST_DB_NAME='sqlite_db'
TEST_DB_USER='root'
TEST_DB_PASSWORD='root'
TEST_DB_HOST='localhost'
TEST_DB_TYPE='sqlite'
`
return template
}
