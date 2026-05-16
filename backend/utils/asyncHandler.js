/**
 * ASYNC HANDLER WRAPPER
 * Eliminates the need for try-catch blocks in every controller function.
 * Automatically passes errors to the next(err) middleare.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
