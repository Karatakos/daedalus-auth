
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
docker build -t 869229378759.dkr.ecr.ap-northeast-1.amazonaws.com/daedalus:daedalus-auth-latest -f service.Dockerfile .

docker run -d -p 80:3000 869229378759.dkr.ecr.ap-northeast-1.amazonaws.com/daedalus:daedalus-auth-latest
```

## Release

###  Step 1: Deploy Image 

Images should be pushed into the pre-provisioned `daedalus` ECR repo, and our naming convenstion is <IMAGE_NAME>-<IMAGE_VERSION>. 

```
aws ecr get-login-password | docker login --username AWS --password-stdin "869229378759.dkr.ecr.ap-northeast-1.amazonaws.com"

docker push 869229378759.dkr.ecr.ap-northeast-1.amazonaws.com/daedalus-backend:daedalus-auth-latest
```

### Step 2: Deploy Pods to Kubernetes Cluster
 
Kubernetes config files for this service are maintained in the daedalus-infra GitHub repo. Clone the repo, assume the eks-admin role and deploy pod(s) via `kubectl apply -f auth/`. See repo's README for more details on maintainence and deployment of the kubernetes infrastructure and how to run an app locally via Minikube.


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

### Validate Access Token

Important: This is temporary. It's not scalable for services to have to hit this endpoint to validate a token. Instead, we will move to async encryption and expose and endpoint with public certs that can be cached.

#### Use a refresh token to aquire a new access token 

- Endpoint: **https://localhost/auth/validate**  
- Method: POST 
- Payload:
```
    {
        accessToken: STRING
    }
``` 
- Response:
```
    {
        status: Valid | Invalid 
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