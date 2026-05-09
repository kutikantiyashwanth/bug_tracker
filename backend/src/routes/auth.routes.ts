import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { register, login, logout, getMe } from '../controllers/auth.controller';

const router = Router();

router.post('/register',
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  ],
  validate, register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required')
  ],
  validate, login
);

router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
