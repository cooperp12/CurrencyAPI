import { product } from "../BasicUtils"

describe('BasicUtils test suite', ()=> {
    it('returns the product of 3 and 2', ()=>{
        const actual = product(3,2)
        expect(actual).toBe(6)
    });
});