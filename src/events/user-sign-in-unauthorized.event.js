import {Event} from './event.js';

/*
* @enum
*/ 
const UserSignInUnauthorizedReason = {
    ERROR: "UnknownError",
    ACCOUNT_DISABLED: "AccountDisabled"
}

class UserSignInUnauthorizedEvent extends Event {
    federatedAccountId;
    timestamp;
    message;
    reason;

    constructor(federatedAccountId, timestamp, message, reason, commandId) {
        super("", commandId, "UserSignInUnauthorized", false);

        this.federatedAccountId = federatedAccountId;
        this.timestamp = timestamp;
        this.message = message;
        this.reason = reason;
    }
}

export {UserSignInUnauthorizedEvent, UserSignInUnauthorizedReason};