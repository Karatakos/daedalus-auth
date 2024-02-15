import {IEvent} from './event.js';

/*
* @enum
*/ 
enum UserSignInUnauthorizedReason {
    ERROR = "UnknownError",
    ACCOUNT_DISABLED = "AccountDisabled"
}

class UserSignInUnauthorizedEvent implements IEvent {
    public readonly type: string = "UserSignInUnauthorized";
    public readonly shouldBroadcast: boolean = false;
    public readonly userId: string = "";

    public readonly commandId: string;

    public readonly federatedAccountId;
    public readonly timestamp;
    public readonly message;
    public readonly reason;

    constructor(federatedAccountId, timestamp, message, reason, commandId) {
        this.federatedAccountId = federatedAccountId;
        this.timestamp = timestamp;
        this.message = message;
        this.reason = reason;
        this.commandId = commandId;
    }
}

export {UserSignInUnauthorizedEvent, UserSignInUnauthorizedReason};