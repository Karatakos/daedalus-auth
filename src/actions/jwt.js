
import crypto from 'crypto';

class Jwt {
    constructor() {}

    static defaultHeader = {
        alg: "HS256",
        typ: "JWT"
    };

    static verify(secret, token) {
        const parts = token.split('.');

        let header = JSON.parse(Buffer.from(parts[0], 'base64').toString('ascii'));
        let payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('ascii'));
        
        let signedToken = Jwt.sign(secret, payload, header);

        if (signedToken != token)
            throw Error("Token invalid");
        
        return payload;
    };
    
    static sign(secret, payload, header = Jwt.defaultHeader) {
        if (header.alg != 'HS256')
            throw new Error("Only HS256 supported.");

        const token = 
            Jwt.urlSafeString(Buffer.from(JSON.stringify(header)).toString('base64')) + '.' +
            Jwt.urlSafeString(Buffer.from(JSON.stringify(payload)).toString('base64'))

        const urlSafeSignedToken = 
            token + '.' + 
            Jwt.urlSafeString(crypto.createHmac('sha256', secret).update(token).digest('base64'));

        return urlSafeSignedToken;
    };

    static urlSafeString(string) {
        return string
            .replace(/\+/g, '-') // Convert '+' to '-'
            .replace(/\//g, '_') // Convert '/' to '_'
            .replace(/=+$/, ''); // Remove ending '=' 
    }
}

export {Jwt};