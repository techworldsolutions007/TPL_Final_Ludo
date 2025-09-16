import { validationResult } from 'express-validator';

export const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Send first error per field
    const formatted = errors.array().map(e => ({ field: e.param, msg: e.msg }));
    return res.status(422).json({ message: 'Validation failed', errors: formatted });
  }
  next();
};
