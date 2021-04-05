import { objectFilter } from './object-filter';

describe('objectFilter', () => {
    it('filters keys', () => {
        const keys = ['a', 'b'];
        const obj = {
            a: 1,
            b: 2,
            c: 3,
        };

        const result = objectFilter(obj, keys);
        expect(Object.keys(result)).toEqual(keys);
    });

    it('does not return with missing keys', () => {
        const keys = ['a'];
        const obj = {};

        expect(objectFilter(obj, keys)).toMatchInlineSnapshot(`Object {}`);
    });

    it('returns same object if all keys match', () => {
        const keys = ['a', 'b'];
        const obj: { [prop: string]: number } = {
            a: 1,
            b: 2,
        };

        const result = objectFilter(obj, keys);
        expect(result).toEqual(obj);
    });
});
