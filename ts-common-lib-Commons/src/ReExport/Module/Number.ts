const {
    isNaN, isFinite,
} = Number;

// isNaN exists as a global as well
// To my knowledge, you can't hide a global variable in a module
/** 
 * Synonym for {@link Number.isNaN}. 
 * Like that function, it does not coerce its argument. 
 */
export const isErrorNumber = isNaN;

export {
    isFinite, 
};
