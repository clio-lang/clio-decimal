# clio-decimal
Decimal numbers for Clio (and JavaScript)

The goal of the project is to make an accurate yet fast Decimal number implementation for Clio and JS.

## How does it work?

Any rational number can be written as a fraction. This library makes use of this fact to save any
number using a combination of a numerator and a denominator.

## Decimal Object

Accepts strings, numbers or an object as input. If object passed, it must include a numerator and a denominator.

## Methods

Currently these methods are implemented. If you want some extra functionality feel free to send a pull request.
Some of the functions aren't optimized, any help with these functions is much appreciated.

Basic math:

* add
* sub
* mul
* div

Comparison:

* eq
* lt
* gt
* lte
* gte

Power:

* pow (integer pow)
* tpow (decimal pow using taylor series: needs optimization)

Other math functions:

* abs
* ln (natural log: needs optimization)

Utilities:

* toBigInt
* toNumber (unsafe)
* toString

## License

This code is released under Apache-2.0 license.