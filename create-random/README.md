#  create-random

Simple script to generate random data

Install globally to run anywhere:
```
npm i -g @spongex/create-random
```

Uses the [NodeJS crypto](https://nodejs.org/api/crypto.html) library to generate random data

## Usage

Generate random numbers:
```
npx create-random numbers 12
```

Generate random letters:
```
npx create-random letters 10
```

Generate random numbers and letters:
```
npx create-random alphanum 42
```

Generate random hex values:
```
npx create-random hex 16
```

# Changelog

## 1.0.0
- Initial release
