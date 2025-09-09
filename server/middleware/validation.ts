import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  next();
};

// Attendant validation
export const validateAttendant = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem deve ser válida'),
  
  body('earnings')
    .optional()
    .isNumeric()
    .withMessage('Ganhos devem ser um número')
    .isFloat({ min: 0 })
    .withMessage('Ganhos não podem ser negativos'),
  
  handleValidationErrors
];

// Sale validation
export const validateSale = [
  body('attendantId')
    .notEmpty()
    .withMessage('ID do atendente é obrigatório')
    .isUUID()
    .withMessage('ID do atendente deve ser um UUID válido'),
  
  body('value')
    .isNumeric()
    .withMessage('Valor deve ser um número')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero'),
  
  body('clientName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome do cliente deve ter no máximo 100 caracteres'),
  
  body('clientPhone')
    .optional()
    .matches(/^[\d\s\(\)\-\+]+$/)
    .withMessage('Telefone deve conter apenas números e caracteres válidos'),
  
  body('clientEmail')
    .optional()
    .isEmail()
    .withMessage('Email deve ser válido'),
  
  body('clientAddress')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Endereço deve ter no máximo 200 caracteres'),
  
  handleValidationErrors
];

// Admin validation
export const validateAdmin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username deve conter apenas letras, números e underscore'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser válido'),
  
  body('role')
    .optional()
    .isIn(['admin', 'super_admin'])
    .withMessage('Role deve ser admin ou super_admin'),
  
  handleValidationErrors
];

// Goal validation
export const validateGoal = [
  body('attendantId')
    .notEmpty()
    .withMessage('ID do atendente é obrigatório')
    .isUUID()
    .withMessage('ID do atendente deve ser um UUID válido'),
  
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  
  body('targetValue')
    .isNumeric()
    .withMessage('Valor alvo deve ser um número')
    .isFloat({ min: 0.01 })
    .withMessage('Valor alvo deve ser maior que zero'),
  
  body('goalType')
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Tipo de meta deve ser: daily, weekly, monthly, quarterly ou yearly'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Data de início deve ser válida'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Data de fim deve ser válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    }),
  
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .isUUID()
    .withMessage('ID deve ser um UUID válido'),
  
  handleValidationErrors
];

// Search query validation
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
  
  query('type')
    .optional()
    .isIn(['all', 'attendants', 'sales', 'goals', 'achievements', 'clients'])
    .withMessage('Tipo deve ser: all, attendants, sales, goals, achievements ou clients'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser válida'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser válida'),
  
  query('minValue')
    .optional()
    .isNumeric()
    .withMessage('Valor mínimo deve ser um número'),
  
  query('maxValue')
    .optional()
    .isNumeric()
    .withMessage('Valor máximo deve ser um número'),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  handleValidationErrors
];
