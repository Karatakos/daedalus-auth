import {expect} from 'chai';
import {Jwt} from '../actions/jwt.js'

const secret = "23423dfsdf232fsd2#$ooo22sdssdaa3";

const payload = {
    userId: "Timmy1",
    exp: "2025-08-04T12:07:38.753Z"
}

const testtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJUaW1teSIsImV4cCI6IjIwMjUtMDgtMDRUMTI6MDc6MzguNzUzWiJ9.H6FWAWqAO0InE2-UK4uwF_ZbFm1rQpNkPifYdbkLiZE';

describe('Given request to verify an externally created token with our secret', () => {
    it('Should accept a valid signed token', async () => {
        const payload = Jwt.verify(secret, testtoken);
        expect(!!payload).to.equal(true);
    });
});

describe('Given request to sign and verify a token', () => {
    let token = Jwt.sign(secret, payload);

    it('Should generate a signed token', async () => {
        expect(token).to.not.be.empty;
    });

    it('Should accept a valid signed token', async () => {
        expect(!!Jwt.verify(secret, token)).to.equal(true);
    });
});

