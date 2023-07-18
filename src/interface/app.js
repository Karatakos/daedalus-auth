import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import http from 'http';
import { Jwt } from '../actions/jwt.js';
import { SecretsManager } from '../actions/secrets-manager.js';

import AuthRouter from './routes/auth.route.js';
import { parseCookies } from './util/cookie-parser.js';

const app = express();
const port = 3000;
const server = http.createServer(app);

//  Unused for now but leaving it in place for the invevitable expansion of 
//  responsibilities for this microservice, e.g. user admin, GDPR, etc.
//
let authenticator = (req, res, next) => {
    try {
        req.user = authenticate(req);
        console.log(`[REST] Successfully authenticated user ${req.user.userId}`);

        next() ;
    }
    catch (err) {
        console.log("Exception occured authorizing a user: " + err.Message);
        res.status(401).send({Status: "Unauthorized", Message: err.Message});
    }
};

let authenticate = (req) => {
    if (req.headers.cookie) {
        let cookies = parseCookies(req.headers.cookie);

        if (cookies && cookies?.accessToken) {
            const payload = Jwt.verify(SecretsManager.accessTokenSecret, cookies.accessToken);
            const timestamp = new Date(payload.exp);

            if (timestamp.getTime() < new Date().getTime())
                throw Error("Access token expired.");

            return {
                userId: payload.userId,
                policy: JSON.parse(payload.policy)
            }
        }
    }

    throw Error("No access token provided.");
};
  
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.get('/status', (req, res) => {
    res.send("OK");
});

app.use('/auth', AuthRouter);

server.listen(port, () => {
    console.log(`Listening on ${port}`)
});

