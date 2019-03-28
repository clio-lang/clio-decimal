class Decimal {
    constructor(data) {
        if (data.constructor == Number) {
            data = data.toString();
        }
        if (data.constructor == String) {
            var dot = data.indexOf('.');
            if (dot == -1) {
                data = {
                    numerator: BigInt(data),
                    denominator: 1n
                }
            } else {
                data = {
                    numerator: BigInt(data.replace(/\./, '')),
                    denominator: 10n ** BigInt(data.length - dot - 1)
                }
            }
        }
        this.numerator = data.numerator;
        this.denominator = data.denominator;
    }

    normalize() {
        // find greatest common divisor and divide
        var _gcd = gcd(this.numerator, this.denominator);
        this.numerator /= _gcd;
        this.denominator /= _gcd;
        return this;
    }

    add(n) {
        /*
            b / c + B / C = (bC + Bc) / cC
        */
        var numerator = this.numerator * n.denominator + n.numerator * this.denominator;
        var denominator = this.denominator * n.denominator;
        return new Decimal({numerator, denominator});
    }

    sub(n) {
        /*
            b / c - B / C = (bC - Bc) / cC
        */
        var numerator = this.numerator * n.denominator - n.numerator * this.denominator;
        var denominator = this.denominator * n.denominator;
        return new Decimal({numerator, denominator});
    }

    mul(n) {
        /*
            b / c * B / C = bB / cC
        */
        var numerator = this.numerator * n.numerator;
        var denominator = this.denominator * n.denominator;
        return new Decimal({numerator, denominator});
    }

    div(n) {
        /*
            (b / c) / (B / C) = bC / Bc
        */
        var numerator = this.numerator * n.denominator;
        var denominator = n.numerator * this.denominator;
        return new Decimal({numerator, denominator});
    }

    abs() {
        var numerator = this.numerator > 0n ? this.numerator : this.numerator * -1n;
        var denominator = this.denominator > 0n ? this.denominator : this.denominator * -1n;
        return new Decimal({numerator, denominator});
    }
    
    gt(n) {
        /*
            a/b > A/B -> aB > Ab
        */
       return (this.numerator * n.denominator) > (n.numerator * this.denominator)
    }

    ipow(n) {
        var numerator = this.numerator ** (n.numerator / n.denominator)
        var denominator = this.denominator ** (n.numerator / n.denominator)
        return new Decimal({numerator, denominator});
    }

    pow(n, it) {
        /*
            a ^ n = e ^ (n * ln(a))
            e ^ (n * ln(a)) = [1 + 1/k! (n ln(a)) ** k]
        */
       it = it || 36; // good accuracy without killing much performance
       var result = new Decimal('1');
       var nln = this.ln().mul(n);
       var nln_pow = nln;
       var fact = new Decimal('1');
       for (let i = 1; i < it; i++) {
           var k = new Decimal(`${i}`);
           fact = fact.mul(k);
           result = result.add(nln_pow.div(fact));
           nln_pow = nln_pow.mul(nln);
       }
       return result.normalize();
    }

    fact() {
        /*
            n! = n * (n-1)!
        */
        var one = new Decimal('1');
        if (!this.gt(new Decimal('0'))) {
            return one;
        }
        return this.mul(this.sub(one).fact())
    }

    ln(it) {
        /*
            Area hyperbolic tangent function
            https://en.wikipedia.org/wiki/Logarithm#Calculation
        */
        it = it || 10; // max iterations
        var one = new Decimal('1');
        var ln = new Decimal('0');
        var z = this;
        for (let i = 1; i < it; i += 2) {
            var _i = new Decimal(`${i}`)
            ln = ln.add((z.sub(one).div(z.add(one))).ipow(_i).div(_i));
        }
        return ln.mul(new Decimal('2')).normalize();
    }

    toNumber() {        
        return Number(this.numerator) / Number(this.denominator);
    }

    toString() {
        var left = this.numerator / this.denominator;
        var right = (this.numerator * (10n**56n)) / this.denominator;
        var left = left.toString();
        var right = right.toString().replace(/0+$/, '');
        if (left != '0') {
            right = right.slice(left.length)
        }
        if (right.length > 54) {
            right = right.slice(0, 54) + '...'
        }
        return `${left}.${right}`
    }
}

// https://gist.github.com/bellbind/5468385accdee9df0d88
var gcd = function (a, b) {
    // fast GCD aka Binary GCD
    if (a === 0n) return b;
    if (b === 0n) return a;
    if (a === b) return a;
    // remove even divisors
    var sa = 0n;
    while (!(a & 1n)) sa++, a >>= 1n;
    var sb = 0n;
    while (!(b & 1n)) sb++, b >>= 1n;
    var p = sa < sb ? sa : sb; // Power part of 2^p Common Divisor
    // euclidean algorithm: limited only odd numbers
    while (a !== b) {// both a and b should be odd
        if (b > a) {var t = a; a = b; b = t;} // swap as a > b
        a -= b; // a is even because of odd - odd
        do a >>= 1n; while (!(a & 1n)); // a become odd
    }
    return a << p; // Odd-Common-Divisor * 2^p
};

module.exports = Decimal;
