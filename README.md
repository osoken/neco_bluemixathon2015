# NECO server

This is the server-side application of the [NECO project](http://devpost.com/software/neco).
This project is for [Bluemixathon: Operation Rescure & Recovery](http://bluemixathon.devpost.com/).

## REST API

|Method|Route|Description|
|---|---|---|
|`GET`|`/api/image`|get the recent images with tags and location in json|
|`POST`|`/api/image`|post a new image to the server. Request body must contain `lon`(longitude), `lat`(latitude) and `image`(base 64 encoded image)|
|`GET`|`/api/image/<id>`|get image as jpeg|

## Configuration

You must place `config.json` file in the application's root directory to run the application on a server.
`config.json` consists of an object with the following attributes:

- "dbUser": username for the Mongo DB instance.
- "dbPassword": password for the Mongo DB instance.
- "dbHost": address for the Mongo DB instance.
- "dbPort": port for the Mongo DB instance.
- "dbName": name of the database in Mongo DB.
- "selfHostAddress": host name.
- "alchemyAPIKey": Alchemy API key.
