import { body } from 'express-validator';

export const teamValidationSchema = [
  body('name')
    .notEmpty()
    .withMessage('Team name is required')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Team name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  
  body('memberIds')
    .optional()
    .isArray()
    .withMessage('Member IDs must be an array'),
  
  body('memberIds.*')
    .optional()
    .isString()
    .withMessage('Each member ID must be a string')
];

export const teamMemberValidationSchema = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  
  body('role')
    .optional()
    .isString()
    .isIn(['MEMBER', 'LEADER', 'ADMIN'])
    .withMessage('Role must be MEMBER, LEADER, or ADMIN')
];

export const scoreValidationSchema = [
  body('challengeId')
    .notEmpty()
    .withMessage('Challenge ID is required')
    .isString()
    .withMessage('Challenge ID must be a string'),
  
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  
  body('points')
    .notEmpty()
    .withMessage('Points are required')
    .isInt({ min: 0 })
    .withMessage('Points must be a positive integer')
];