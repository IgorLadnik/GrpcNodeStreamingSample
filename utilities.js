// Type Check
var isString = a => typeof a === 'string';
var isNumber = a => typeof a === 'number';
var isFunction = a => typeof a === 'function';

// Check on Undefined
var isDefined = a => !(a === undefined);

// Check on null
var isNull = a => a === null;

var isEmptyString = a => isString(a) && a.length === 0;

function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// EXPORT
module.exports.isEmptyString = isEmptyString;
module.exports.isDefined = isDefined;
module.exports.isNumber = isNumber;
module.exports.isNull = isNull;
module.exports.generateUuid = generateUuid;
