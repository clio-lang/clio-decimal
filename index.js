class Decimal {
    constructor(data) {
        if (data.constructor == Number) {
            data = data.toString();
        }
        if (data.constructor == String) {
            data = data.toLowerCase();
            if (data == 'inf') {
                data = {
                    numerator: Infinity,
                    denominator: 1n,
                }
            }
            else if (data == '-inf') {
                data = {
                    numerator: -Infinity,
                    denominator: 1n,
                }
            }
            else {
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
        /*
              abs(a / b) = abs(a) / abs(b)
            | or when both have the same sign
        */
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
    
    gte(n) {
        /*
            a/b >= A/B -> aB > Ab
        */
       return (this.numerator * n.denominator) >= (n.numerator * this.denominator)
    }
    
    lt(n) {
        /*
            a < b -> b > a
        */
       return n.gt(this)
    }
    
    lte(n) {
        /*
            a <= b -> b >= a
        */
       return n.gte(this)
    }
    
    eq(n) {
        /*
            a/b == A/B -> aB == Ab
        */
       return (this.numerator * n.denominator) == (n.numerator * this.denominator)
    }

    pow(n) {
        /*
            (a / b) ^ (c / d) = a ^ (c / d) / b ^ (c / d)
        */
        var numerator = this.numerator ** (n.numerator / n.denominator)
        var denominator = this.denominator ** (n.numerator / n.denominator)
        return new Decimal({numerator, denominator});
    }

    tpow(n, it) {
        /*
            Taylor series power approximation

            a^b.c = a^b * a^0.c

            a ^ n = e ^ (n * ln(a))
            e ^ (n * ln(a)) = [1 + 1/k! (n ln(a)) ** k]
        */
       var left = n.numerator / n.denominator;
       var right = n.numerator - (left * n.denominator);
       left = new Decimal({numerator: left, denominator: 1n});
       right = new Decimal({numerator: right, denominator: n.denominator});       
       it = it || 34; // good accuracy without killing much performance
       // taylor series approximation of the right side
       var result = new Decimal('1');
       var rln = this.ln().mul(right).normalize();
       var rln_pow = rln;
       var fact = new Decimal('1');
       for (let i = 1; i < it; i++) {
           var k = new Decimal(`${i}`);
           fact = fact.mul(k).normalize();
           result = result.add(rln_pow.div(fact));
           rln_pow = rln_pow.mul(rln).normalize();
       }       
       return this.pow(left).mul(result).normalize();
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
            This isn't fast, nor accurate
            We need a better approximation
        */
        it = it || 10; // max iterations
        var one = new Decimal('1');
        var ln = new Decimal('0');
        var z = this;
        for (let i = 1; i < it; i += 2) {
            var _i = new Decimal(`${i}`)
            ln = ln.add((z.sub(one).div(z.add(one))).pow(_i).div(_i));
        }
        return ln.mul(new Decimal('2')).normalize();
    }

    floor() {
        return new Decimal({numerator: this.toBigInt(), denominator: 1n});
    }

    toBigInt() {
        return this.numerator / this.denominator;
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
