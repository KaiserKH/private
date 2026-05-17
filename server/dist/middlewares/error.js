export const errorHandler = (error, _req, res, _next) => {
    const status = typeof error?.statusCode === "number" ? error.statusCode : 500;
    const message = error?.message ?? "Internal server error";
    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === "production" ? undefined : error
    });
};
