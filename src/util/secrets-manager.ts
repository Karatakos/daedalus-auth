
class SecretsManager {
    static accessTokenTTLHours = 1;
    static refreshTokenTTLHours = 24;

    static accessTokenSecret = "23423dfsdf232fsd2#$ooo22sdssdaa3";
    static refreshTokenSecret = "23423dfsdf232fsd2#$ooo22sdssdaa3";

    constructor() {}

    static createExpiry (ttl): string {
        let date = new Date().getTime();
        date += (ttl * 60 * 60 * 1000);
    
        return new Date(date).toJSON();
    }
}

export {SecretsManager};