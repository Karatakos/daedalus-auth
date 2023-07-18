
/*
*   @enum
*/
const FederatedAccountType = {
    STEAM: "FA#ST"
}

/*
*   @enum
*/
const UserAccountStatus = {
    ENABLED: "Enabled",
    DISABLED: "Disabled"
}

class User {
    userAccount;
    refreshToken; 
    accessToken = "";
    federatedAccount;

    constructor() {
        this.refreshToken = new RefreshToken();
        this.federatedAccount = new FederatedAccount();
        this.userAccount = new UserAccount();
    }

    toDO() {
        return {
            account: this.userAccount.toDO(),
            refreshToken: this.refreshToken.toDO(),
            federatedAccount: this.federatedAccount.toDO()
        };
    }
}

class UserAccount {
    userId = "";
    username = "";
    policy = {
        studio: "",
        capabilities: []
    };
    status = UserAccountStatus.ENABLED;
    createdOn = "";

    constructor() {}

    fromDO(userAccountDO) {
        if (userAccountDO) {
            this.userId = userAccountDO.PK.split('#')[1],
            this.username = userAccountDO.username,
            this.policy = userAccountDO.policy,
            this.status = userAccountDO.status,
            this.createdOn = userAccountDO.createdOn
        }
    }

    toDO() {
        return {
            PK: 'US#' + this.userId,
            SK: 'US#' + this.userId,
            username: this.username,
            policy: JSON.stringify(this.policy),
            status: this.status.toString(),
            createdOn: this.createdOn.toJSON()
        }
    }
}

class RefreshToken {
    userId = "";
    token = "";

    constructor() {}

    fromDO(refreshTokenDO) {
        if (refreshTokenDO) {
            this.userId = refreshTokenDO.PK.split('#')[1];
            this.token = refreshTokenDO.SK.split('#')[1];
        }
    }

    toDO() {
        return {
            PK: 'US#' + this.userId,
            SK: 'RT#' + this.token
        }
    }
}

class FederatedAccount {
    userId = "";
    accountId = "";
    type = FederatedAccountType.STEAM;
    token = "";

    constructor() {}

    fromDO(federatedAccountDO) {
        if (federatedAccountDO) {
            this.userId = federatedAccountDO.PK.split('#')[1];
            this.accountId = federatedAccountDO.SK.split('#')[2];
            this.type = `FA-${federatedAccountDO.SK.split('#')[1]}`;
            this.token = federatedAccountDO.token;
        }
    }

    toDO() {
        return {
            PK: 'US#' + this.userId,
            SK: `${this.type.toString()}#${this.accountId}`,
            token: this.token
        }
    }
}

export {User, UserAccount, FederatedAccount, RefreshToken, UserAccountStatus, FederatedAccountType};