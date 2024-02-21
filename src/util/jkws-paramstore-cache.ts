import { SSMClient, GetParametersByPathCommand, GetParameterCommand} from '@aws-sdk/client-ssm'

interface IJwksCache {
    getSigningKey(): Promise<any | undefined>;
    getVerificationKey(kid: string | undefined): Promise<any | undefined>;
    getVerificationKeys(): Promise<any[]> ;
} 

class JwksParameterStoreCache implements IJwksCache {
    private privateKey: any | undefined;
    private publicKeys: any[];

    private readonly ssm: SSMClient;

    constructor(ssm: SSMClient) {
        this.ssm = ssm;
        this.publicKeys = [];
    }

    async getSigningKey(): Promise<any | undefined> {
        if (!this.privateKey) {
            const cmd: GetParameterCommand = new GetParameterCommand({
                Name: "/daedalus-auth-cert/private/jwk",
                WithDecryption: true
            })

            const res = await this.ssm.send(cmd);

            if (!res.Parameter || !res.Parameter || !res.Parameter.Value)
                throw new Error("No private key found in AWS Parameter Store");

            this.privateKey = JSON.parse(res.Parameter.Value);
        }

        return this.privateKey;
    }

    async getVerificationKey(kid: string): Promise<any | undefined> {
        if (this.publicKeys.length == 0) 
            await this.refreshPublicKeys();

        const jwk = this.publicKeys.find((jwk: any) => jwk.kid == kid);
        if (!jwk)
            throw new Error(`No public key found for ${kid}`);

        return jwk;
    }

    async getVerificationKeys(): Promise<any[]> {
        if (this.publicKeys.length == 0) 
            await this.refreshPublicKeys();

        return this.publicKeys;
    }

    private async refreshPublicKeys(): Promise<void> {
        const cmd: GetParametersByPathCommand = new GetParametersByPathCommand({
            Path: "/daedalus-auth-cert/public/jkw",
            WithDecryption: true
        })

        const res = await this.ssm.send(cmd);

        if (!res.Parameters || res.Parameters.length == 0)
            throw new Error("No public keys found in AWS Parameter Store");

        res.Parameters.map((p) => { if (p.Value) this.publicKeys.push(JSON.parse(p.Value)) })
    }
}  

export { IJwksCache, JwksParameterStoreCache }