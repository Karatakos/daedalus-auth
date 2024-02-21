
/*
*   @enum
*/
enum FederatedAccountType {
    STEAM = "FA#ST"
}

/*
*   @enum
*/
enum UserAccountStatus {
    ENABLED = "Enabled",
    DISABLED = "Disabled"
}

class User {
    constructor(
        public readonly accessToken: string | undefined,
        public readonly refreshToken: RefreshToken | undefined,
        public readonly federatedAccount: FederatedAccount,
        public readonly userAccount: UserAccount
    ) {}

    toDO(): UserDAO {
        return new UserDAO(
            this.userAccount.toDO(),
            this.refreshToken?.toDO(),
            this.federatedAccount.toDO());
    }
}

class UserDAO {
    constructor (
        public readonly userAccount: UserAccountDAO,
        public readonly refreshToken: RefreshTokenDAO | undefined,
        public readonly federatedAccount: FederatedAccountDAO
    ) {}
}

class UserAccount {
    public readonly createdOn;

    constructor(
        public readonly userId: string,
        public readonly username: string,
        public readonly status: UserAccountStatus,
        public readonly policy: UserAccountPolicy = new UserAccountPolicy()
    ) {
        this.createdOn = new Date();
    }

    toDO(): UserAccountDAO {
        return new UserAccountDAO (
            'US#' + this.userId,
            'US#' + this.userId,
            this.username,
            JSON.stringify(this.policy),
            this.status.toString(),
            this.createdOn.toJSON());
    }

    static fromDO(userAccountDO: UserAccountDAO): UserAccount {
        return new UserAccount(
            userAccountDO.PK.split('#')[1],
            userAccountDO.username,
            userAccountDO.status as UserAccountStatus,
            UserAccountPolicy.fromJSON(userAccountDO.policy));
    }
}

class UserAccountPolicy {
    constructor (
        public readonly capabilities: string[] = [],  
    ) {}

    static fromJSON(json: string): UserAccountPolicy {
        const tmp = JSON.parse(json);

        return new UserAccountPolicy(
            tmp.capabilities
        );
    }
}

class UserAccountDAO {
    constructor (
        public readonly PK: string,
        public readonly SK: string,
        public readonly username: string,
        public readonly policy: string,
        public readonly status: string,
        public readonly createdOn: string    
    ) {}
}

class RefreshToken {
    constructor(
        public readonly userId: string,
        public readonly token: string
    ) {}

    toDO(): RefreshTokenDAO {
        return new RefreshTokenDAO(
            'US#' + this.userId,
            'RT#' + this.token);
    }

    static fromDO(refreshTokenDO: RefreshTokenDAO): RefreshToken {
        return new RefreshToken(
            refreshTokenDO.PK.split('#')[1],
            refreshTokenDO.SK.split('#')[1]
        );
    }
}

class RefreshTokenDAO {
    constructor (
        public readonly PK: string,
        public readonly SK: string    
    ) {}
}

class FederatedAccount {
    constructor(
        public readonly userId: string,
        public readonly accountId: string,
        public readonly type: FederatedAccountType,
        public readonly token: string
    ) {}

    toDO(): FederatedAccountDAO {
        return new FederatedAccountDAO(
            'US#' + this.userId,
            `${this.type.toString()}#${this.accountId}`,
            this.token);
    }

    static fromDO(federatedAccountDO: FederatedAccountDAO): FederatedAccount {
        return new FederatedAccount(
            federatedAccountDO.PK.split('#')[1],
            federatedAccountDO.SK.split('#')[2],
            `FA-${federatedAccountDO.SK.split('#')[1]}` as FederatedAccountType,
            federatedAccountDO.token);
    }
}

class FederatedAccountDAO {
    constructor (
        public readonly PK: string,
        public readonly SK: string,
        public readonly token: string
    ) {}
}

export {
    User,
    UserDAO, 
    UserAccount, 
    UserAccountDAO, 
    UserAccountPolicy,
    FederatedAccount, 
    FederatedAccountDAO,
    RefreshToken, 
    RefreshTokenDAO,
    UserAccountStatus, 
    FederatedAccountType
};