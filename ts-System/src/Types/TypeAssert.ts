// Helper variables for creating type assertions.

// Example assertion:
const ta_JustAnExample: 
    boolean extends boolean
    // boolean extends false // toggle comment to see that this one errors
? true : false = true;

// You'd think that you can use a type alias for this, but that doesn't work sadly...
// Hopefull one day TS will support type assertions directly. 

/** 
 * Symbol used to "poison" type functions with. 
 * Combine it with a type assertion to detect, for instance, that not all cases are handled. 
 * 
 *      const TypeAssertion_AllCasingsMatched: Panic extends ApplyCasing<CasingOption, string>
        ? false : true = true;
 * 
 * */
export type Panic = typeof Panic;
declare const Panic: unique symbol;
