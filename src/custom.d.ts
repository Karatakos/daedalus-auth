type Account = {
    userId: string,
    policy: any
}

declare namespace Express {
    export interface Request {
       account?: Account
    }
 }