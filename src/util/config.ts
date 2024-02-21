
class Config {
    static accessTokenTTLHours = 24 * 7;
    static refreshTokenTTLHours = 24 * 180;

    constructor() {}

    static createExpiry (ttlHours: number): number {
        return Math.floor(Date.now()/1000) + (ttlHours * (60 * 60));
    }
}

export { Config };