# Contributing

## Building & Running Local Server

Run tests
```
npm test
```

Run local server
```
npm start
```

Run a local container

```
docker build -t 869229378759.dkr.ecr.ap-northeast-1.amazonaws.com/tsuke-assets-svc:latest -f service.Dockerfile .

docker run -d -p 80:3000 869229378759.dkr.ecr.ap-northeast-1.amazonaws.com/tsuke-assets-svc:latest
```

## Release


# API Documentation

## Authentication

A user doesn't need to authenticate directly with the API, but instead authenticates with an OpenID provider and sign-in's in using their token. Currently we support only Steam authentication.

Once authenticated we authorize the user by vending a JWT.

### Sign-in

#### Use a Steam token to get an access token 

- Endpoint: **https://localhost/auth/sign-in**  
- Method: POST  
- Payload:
```
    {
        oauthAccountId: STRING, 
        oauthProvider: STRING, 
        oauthToken: STRING
    }
```
- Response:
```
    {
        accessToken: STRING, 
        refreshToken: STRING
    }
```

### Refresh Access Token

#### Use a refresh token to aquire a new access token 

- Endpoint: **https://localhost/auth/refresh**  
- Method: GET  
- Response:
```
    {
        accessToken: STRING
    }
```