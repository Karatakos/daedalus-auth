import {expect} from 'chai';
import {Jwt} from '../util/jwt.js'

const secret: string = "23423dfsdf232fsd2#$ooo22sdssdaa3";

const payload = {
    userId: "Timmy1",
    exp: "2025-08-04T12:07:38.753Z"
}

const testtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJUaW1teSIsImV4cCI6IjIwMjUtMDgtMDRUMTI6MDc6MzguNzUzWiJ9.H6FWAWqAO0InE2-UK4uwF_ZbFm1rQpNkPifYdbkLiZE';

describe('Sign and verify token', () => {
    const token = Jwt.sign(secret, payload);

    it('Should generate a signed token', async () => {
        expect(token).to.not.be.empty;
    });

    it('Should verify signed token', async () => {
        expect(!!Jwt.verify(secret, token)).to.equal(true);
    });
});

