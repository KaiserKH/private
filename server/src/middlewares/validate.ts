import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

export const validate = (schema: { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }): RequestHandler => {
  return (req, _res, next) => {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.query) req.query = schema.query.parse(req.query);
    if (schema.params) req.params = schema.params.parse(req.params);
    next();
  };
};
