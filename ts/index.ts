/**
 * Remove enclosing [  ] s
 * @param expression
 */
const removeEnclosures = (expression: string): string => {
    if (expression.startsWith('[') && expression.endsWith(']')) {
        expression = expression.slice(1, expression.length - 1);
    }
    return expression;
};
/**
 * extract groups that are enclosed by startChar and endChar
 * when opening char is met,  group is opened, and a counter of "open" is made.  every time startChar is met, counter increase by 1, every time closing char is met, counter decreated by 1.
 * once open counter reaches 0, the group is considered to be closed (equal opening/closing chars on both sides_
 * @param expression
 * @param startChar
 * @param endChar
 */
const findGroups = (expression: string, startChar = '[', endChar = ']'): string[] => {
    expression = removeEnclosures(expression).replace(/ /g, '');
    let opened = 0;
    let group = 0;
    let groupOpen = false;
    let startOfGroup;
    let endOfGroup;
    const groups = [];
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === startChar) {
            // increase opened counter
            opened++;
            // Open group
            if (groupOpen === false) {
                startOfGroup = i;
                groupOpen = true;
            }
        } else if (groupOpen && char === endChar) {
            // decrease opened counter
            opened--;
            if (groupOpen === true) {
                // if counter is zero, that means we reached equilibrium thus we should close the group.
                if (opened <= 0) {
                    endOfGroup = i;
                    groupOpen = false;
                    groups.push({
                        startOfGroup: startOfGroup,
                        endOfGroup: endOfGroup + 1
                    });
                }
            }
        }
    }
    // Use the extracted group start/end to slice the actual string.
    return groups.map(({startOfGroup, endOfGroup}) => expression.slice(startOfGroup, endOfGroup));
};
/**
 * replace enclosures [ whatever ]  with a KEY_# so that the inner contents don't get damaged unintentionally during a split
 * @param expression
 */
const replaceEnclosureWithKeys = (expression: string): { expression: string, replacedObj: any } => {
    let time = new Date().getTime();
    const enclosedExpressions = findGroups(expression) || [];
    const replacedObj: any = {};

    for (const enclosedExpression of enclosedExpressions) {
        const replacedKey = `KEY_${time++}`;
        replacedObj[replacedKey] = enclosedExpression;
        expression = expression.replace(enclosedExpression, replacedKey);
    }
    return {
        expression,
        replacedObj
    };
};
/**
 * replace KEY_# back with their original content.
 * @param expression
 * @param replacedObj
 */
const replaceKeysWithEnclosures = ({expression, replacedObj}: { expression: string, replacedObj: any }): string => {
    for (const key in replacedObj) {
        expression = expression.replace(key, replacedObj[key]);
    }
    return expression;
};
/**
 * Safe split, making sure inner content of enclosures is not affected.
 * eg a,b,c[f,e,g]   split by , will not affect [f,e,g] for further processing
 * @param expression
 * @param delimeter
 */
const safeSplitChar = (expression: string, delimeter: string): string[] => {
    expression = removeEnclosures(expression).replace(/ /g, '');
    const replacementContainer = replaceEnclosureWithKeys(expression);
    return replacementContainer.expression
        .split(delimeter)
        .map(splittedExpression => replaceKeysWithEnclosures({
            expression: splittedExpression,
            replacedObj: replacementContainer.replacedObj
        }));
};
/**
 * safe split by comma
 * @param expression
 */
const safeSplitComma = (expression: string): string[] => safeSplitChar(expression, ',');
/**
 * safe split by dot
 * @param expression
 */
const safeSplitDot = (expression: string): string[] => safeSplitChar(expression, '.');
/**
 * get recursive obj using keys from an array
 * @param arr
 * @param keysGatherer
 */
const getObjByArray = (arr: string[], keysGatherer: any): any => {
    let prevObj = keysGatherer;
    for (const key of arr) {
        if (prevObj[key]) {
            prevObj = prevObj[key];
        } else {
            return {};
        }
    }
    return prevObj;
};
/**
 * merge objects recursively, similar to lodash object .merge
 * @param destinationObj
 * @param sourceObj
 */
const recursivelyMerge = (destinationObj: any, sourceObj: any): any => {
    for (const key in sourceObj) {
        if (destinationObj[key]) {
            recursivelyMerge(destinationObj[key], sourceObj[key]);
        } else {
            destinationObj[key] = sourceObj[key];
        }
    }
    return destinationObj;
};
/**
 * convert a relationexpression eg [a,b,c.[d,e,f]] into an object : {a:{},b:{},c:{d:{},e:{},f:{}}}
 * while also merging everything along the way
 * @param expression
 * @param inputArr
 * @param depth
 */
export const parseExpression = (expression: string, inputArr: any[] = [], depth = 0): any => {
    const sections = safeSplitComma(expression);
    const subSections = sections.map(section => safeSplitDot(section).map(removeEnclosures));
    const keysGatherer: any = {};
    for (const subSection of subSections) {
        const firstKey = subSection[0];
        const arr: string[] = [...inputArr, firstKey];
        keysGatherer[firstKey] = getObjByArray(arr, keysGatherer) || {};
        let previousObj = keysGatherer[subSection[0]];
        for (const subSubSection of subSection.slice(1)) {
            if (subSubSection.includes(',') || subSubSection.includes('.')) {
                const subSubSectionKeysGatherer = parseExpression(subSubSection, arr, depth + 1);
                recursivelyMerge(previousObj, subSubSectionKeysGatherer);

            } else {
                arr.push(subSubSection);
                previousObj = previousObj[subSubSection] = getObjByArray(arr, keysGatherer);
            }

        }

    }
    return keysGatherer;
};
/**
 * convert the resulting object from parseExpression back into relationexpression
 * @param expressionObj
 */
export const stringifyExpression = (expressionObj: any): string => {
    const keys = Object.keys(expressionObj);
    const keyResult = [];
    for (const key of keys) {
        const value = expressionObj[key];
        const isDeeper = value && Object.keys(value).length > 0;
        if (isDeeper) {
            keyResult.push(`${key}.${stringifyExpression(value)}`);
        } else {
            keyResult.push(key);
        }
    }
    return keyResult.length > 0 ? `[${keyResult.join(',')}]` : keyResult[0];
};

/**
 * perform parse and then back to relationexpression, resulting in a normalized merged expression
 * @param expression
 */
const normalizeRelationExpression = (expression: string) => stringifyExpression(parseExpression(expression));

export default normalizeRelationExpression;