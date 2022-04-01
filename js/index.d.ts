/**
 * convert a relationexpression eg [a,b,c.[d,e,f]] into an object : {a:{},b:{},c:{d:{},e:{},f:{}}}
 * while also merging everything along the way
 * @param expression
 * @param inputArr
 * @param depth
 */
export declare const parseExpression: (expression: string, inputArr?: any[], depth?: number) => any;
/**
 * convert the resulting object from parseExpression back into relationexpression
 * @param expressionObj
 */
export declare const stringifyExpression: (expressionObj: any) => string;
/**
 * perform parse and then back to relationexpression, resulting in a normalized merged expression
 * @param expression
 */
declare const normalizeRelationExpression: (expression: string) => string;
export default normalizeRelationExpression;
