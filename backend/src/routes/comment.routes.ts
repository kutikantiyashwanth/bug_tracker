import { Router } from 'express';
import { body } from 'express-validator';
import { addComment, updateComment, deleteComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.post('/bug/:bugId', [body('content').trim().isLength({ min: 1, max: 5000 })], validate, addComment);
router.patch('/:id', [body('content').trim().isLength({ min: 1, max: 5000 })], validate, updateComment);
router.delete('/:id', deleteComment);

export default router;
