import {Event} from './event.js';

class UserSignedInEvent extends Event {
    timestamp;
    refreshToken;
    accessToken;
    federatedAccountId;

    constructor(federatedAccountId, userId, timestamp, refreshToken, accessToken, commandId) {
        super(userId, commandId, "UserSignedIn", false);

        this.federatedAccountId = federatedAccountId;
        this.userId = userId;
        this.timestamp = timestamp;
        this.refreshToken = refreshToken;
        this.accessToken = accessToken;
    }
}

export {UserSignedInEvent};