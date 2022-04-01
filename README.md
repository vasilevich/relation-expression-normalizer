[![npm version](https://badge.fury.io/js/react-html-tag-attributes.svg)](https://www.npmjs.com/package/relation-expression-normalizer)
# relation-expression-normalizer

Normalize objection relationexpression string, merging same names and their sub-objects recursively. eg [a.[a,b],a.[c]] becomes [a.[a,b,c]]

## Usage

* Install.
```bash
yarn relation-expression-normalizer
```

* Usage   
```js
import normalizeRelationExpression from 'relation-expression-normalizer';
const expression = '[a.[a,b],a.[c]]';
normalizeRelationExpression(expression); // returns '[a.[a,b,c]]'
```
