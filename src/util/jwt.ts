
import crypto from 'crypto';

type JwtHeader = {
    alg: string,
    typ: string
}

class Jwt {
    constructor() {}

    static defaultHeader: JwtHeader = {
        alg: "HS256",
        typ: "JWT"
    };

    static verify(secret: string, token: string): any {
        const parts = token.split('.');

        const header: any = JSON.parse(Buffer.from(parts[0], 'base64').toString('ascii'));
        const payload: any = JSON.parse(Buffer.from(parts[1], 'base64').toString('ascii'));
        
        const signedToken = Jwt.sign(secret, payload, header);

        if (signedToken != token)
            throw Error("Token invalid");
        
        return payload;
    }
    
    static sign(secret: string, payload: any, header: JwtHeader = Jwt.defaultHeader): string{
        if (header.alg != 'HS256')
            throw new Error("Only HS256 supported.");

        const token = 
            Jwt.urlSafeString(Buffer.from(JSON.stringify(header)).toString('base64')) + '.' +
            Jwt.urlSafeString(Buffer.from(JSON.stringify(payload)).toString('base64'))

        const urlSafeSignedToken = 
            token + '.' + 
            Jwt.urlSafeString(crypto.createHmac('sha256', secret).update(token).digest('base64'));

        return urlSafeSignedToken;
    }

    static urlSafeString(token: string): string {
        return token
            .replace(/\+/g, '-') // Convert '+' to '-'
            .replace(/\//g, '_') // Convert '/' to '_'
            .replace(/=+$/, ''); // Remove ending '=' 
    }
}

export {Jwt};