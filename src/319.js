/*
 * Leverton transformation code
 * Retail EMEA
 *
 */

// Declare state in global contextual properties variable
// Persistent through execution of multiple records.
var State = {};

// Require function as dependency
require('./modules/add');

// Require dependency that also has dependency of add() - test duplication
require('./modules/addWrap');

// Use function from dependency
console.log(add([10,40]));
