import express from 'express';

import { RefreshTokenQuery } from '../../actions/queries/refresh-token.query.js';
import { Signin, SigninCmd } from '../../actions/commands/sign-in.command.js';
import { EventBus } from '../../events/event-bus.js';
import { UserSignedInEvent } from '../../events/user-signed-in.event.js';
import { UserSignInUnauthorizedEvent, UserSignInUnauthorizedReason } from '../../events/user-sign-in-unauthorized.event.js';
import { UserRepo } from '../../repository/user.repo.js';
import { UserRepoFactory } from '../../repository/user.repo.factory.js';
import { parseCookies } from '../util/cookie-parser.js';
import { FederatedAccountType } from '../../entities/user.js';

const router = express.Router();

router
    .route('/sign-in')
    .post(async (req, res) => {    
        try {
            // TODO: Proper validation
            if (!req.is('application/json') ||
                !req.body?.oauthAccountId || 
                !req.body?.oauthProvider ||
                !req.body?.oauthToken ||
                req.body?.oauthProvider != FederatedAccountType.STEAM) {
                console.log(req.is('application/json'));
                console.log(req.body);
                res.status(401).send({error: "Badly formed request."});
                return;
            }

            const eventBus = new EventBus();
        
            // TODO: To fix this we need a solution to access a centralized
            // event bus instance like a queue that will allow the client to 
            // call us back on this endpoint and still access events even if the
            // loadbalancer routes to a different node instance
            //
            // This is a very dirty work around in the meantime
            // 
            const signin = new Signin(
                UserRepoFactory.make(),
                eventBus,
                new SigninCmd(
                    req.body.oauthAccountId,
                    req.body.oauthProvider,
                    req.body.oauthToken,
                    req.body.commandId));

            await signin.execute();

            let event = eventBus.log.find(event => 
                event.federatedAccountId === req.body.oauthAccountId);  

            if (!event)
                res.status(401).send({error: "Unauthorized. Sign-in failed for unknown reason."});

            if (event instanceof UserSignedInEvent) {
                res.cookie('refreshToken', event.refreshToken, { httpOnly: true })
                res.cookie('accessToken', event.accessToken, { httpOnly: true })

                res.send({ 
                    result: 'OK',
                    accessToken: event.accessToken,
                    refreshToken: event.refreshToken
                }); 

                return;
            }

            if (event instanceof UserSignInUnauthorizedEvent) {
                res.status(401).send({
                    'reasonCode': event.reason, 
                    'error': event.error 
                });
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    });

router
    .route('/refresh-token')
    .get(async (req, res) => {    
        try {
            let refreshToken;
            if (req.headers.cookie) {
                let cookies = parseCookies(req.headers.cookie);
        
                if (cookies?.refreshToken)
                    refreshToken = cookies.refreshToken;
            }

            // TODO: Check auth/bearer header for refresh token

            if (!refreshToken) {
                res.status(401).send("Unauthorized. No refresh token presented.");
                return;
            }

            const eventBus = new EventBus();
            const refreshTokenQuery = new RefreshTokenQuery(
                UserRepoFactory.make(),
                eventBus);

            let accessToken = await refreshTokenQuery.execute(refreshToken);

            res.cookie(
                'accessToken', 
                accessToken, 
                { httpOnly: true })
    
            res.send({ 
                result: 'OK',
                accessToken: accessToken
            });
        }
        catch (e) {
            res.status(401).send(e.message);
        }
    });

export default router;
