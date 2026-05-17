export const validate = (schema) => {
    return (req, _res, next) => {
        if (schema.body)
            req.body = schema.body.parse(req.body);
        if (schema.query)
            req.query = schema.query.parse(req.query);
        if (schema.params)
            req.params = schema.params.parse(req.params);
        next();
    };
};
