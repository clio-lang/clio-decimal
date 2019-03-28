const Decimal = require('./index.js');

test('add', async () => {
    expect((new Decimal(10.25).add(new Decimal(10.25))).toNumber()).toEqual(10.25 + 10.25)
    expect((new Decimal(10.25).add(new Decimal(10.205))).toNumber()).toEqual(10.25 + 10.205)
})

test('mul', async () => {
    expect((new Decimal(10.25).mul(new Decimal(10.25))).toNumber()).toEqual(10.25 * 10.25);
    expect((new Decimal(10.25).mul(new Decimal(104.254))).toNumber()).toEqual(10.25 * 104.254);
})

test('div', async () => {
    expect((new Decimal(10.25).div(new Decimal(10.25))).toNumber()).toEqual(10.25 / 10.25);
    expect((new Decimal(10.25).div(new Decimal(104.254))).toNumber()).toEqual(10.25 / 104.254);
    expect((new Decimal(104.254).div(new Decimal(10.25))).toNumber()).toEqual(104.254 / 10.25);
})

test('sub', async () => {
    expect((new Decimal(10.25).sub(new Decimal(10.25))).toNumber()).toEqual(10.25 - 10.25);
    expect((new Decimal(10.25).sub(new Decimal(3.14159))).toNumber()).toEqual(10.25 - 3.14159);
    expect((new Decimal(3.14159).sub(new Decimal(10.25))).toNumber()).toEqual(3.14159 - 10.25);
})