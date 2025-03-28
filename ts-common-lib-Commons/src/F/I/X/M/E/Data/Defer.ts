export const defer: (
    <T = void>() => PromiseWithResolvers<T>
) = Promise.withResolvers.bind(Promise);
