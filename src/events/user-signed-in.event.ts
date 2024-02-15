import { IEvent } from './event.js';

class UserSignedInEvent implements IEvent {
    public readonly userId: string;
    public readonly commandId: string;

    public readonly type: string = "UserSignedIn";
    public readonly shouldBroadcast: boolean = false;

    public readonly timestamp: any;
    public readonly refreshToken: string;
    public readonly accessToken: string;
    public readonly federatedAccountId: string;

    constructor(federatedAccountId, userId, timestamp, refreshToken, accessToken, commandId) {
        this.userId = userId;
        this.commandId = commandId;

        this.federatedAccountId = federatedAccountId;
        this.timestamp = timestamp;
        this.refreshToken = refreshToken;
        this.accessToken = accessToken;
    }
}

export { UserSignedInEvent };