// Type Check
var isString = a => typeof a === 'string';
var isNumber = a => typeof a === 'number';
var isFunction = a => typeof a === 'function';

// Check on Undefined
var isDefined = a => !(a === undefined);

// Check on null
var isNull = a => a === null;

var isEmptyString = a => isString(a) && a.length === 0;

// EXPORT
module.exports.isEmptyString = isEmptyString;
module.exports.isDefined = isDefined;
module.exports.isNull = isNull;
