import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import http from 'http';

import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

import { SSMClient } from '@aws-sdk/client-ssm'

import AuthRouter from './routes/auth.route.js';

import { parseCookies } from './util/cookie-parser.js';
import { JwksParameterStoreCache } from '../util/jkws-paramstore-cache.js'

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const jwks = new JwksParameterStoreCache(new SSMClient());

//  Unused for now but leaving it in place for the invevitable expansion of 
//  responsibilities for this microservice, e.g. user profile retrieval.
//
const authenticator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.account = await authenticate(req);
        console.log(`[REST] Successfully authenticated user ${req.account.userId}`);

        next() ;
    }
    catch (e) {
        const error = e as Error;

        console.log("Exception occured authorizing a user: " + error.message);
        res.status(401).send({Status: "Unauthorized", Message: error.message});
    }
};

const authenticate = async (req: Request): Promise<Account> => {
    if (req.headers.cookie) {
        const cookies = parseCookies(req.headers.cookie);

        if (cookies && cookies?.accessToken) {
            return new Promise((resolve, reject) => {
                jwt.verify(
                    cookies.accessToken, 
                    (header, callback) => { 
                        if (!header.kid)
                            reject("No kid found in token header so I don't know which key to use.");
                        else
                            jwks.getVerificationKey(header.kid)
                                .then((key) => callback(null, jwkToPem(key))) },
                    (error, decoded) => {
                        if (error || !decoded)  
                            reject("Token invalid.");

                        const payload = decoded as jwt.JwtPayload;

                        resolve( {
                            userId: payload.userId,
                            policy: JSON.parse(payload.policy)
                        });
                    });
            });
        }
    }

    throw Error("No access token provided.");
};
  
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.get('/status', (req: Request, res: Response) => {
    res.send("OK");
});

app.get('/.well-known/jwks.json', async (req: Request, res: Response) => {
    res.send(
        {
            // TODO: Key rotations won't take effect until the service is bounced. 
            //       this is obviously won't be viable if we have more than one auth  
            //       service running as one service could sign with keys the other
            //       does not have the public keys to validate against.
            //
            keys: await jwks.getVerificationKeys()
        });
});

app.use('/auth', AuthRouter);

server.listen(port, () => {
    console.log(`Listening on ${port}`)
});

