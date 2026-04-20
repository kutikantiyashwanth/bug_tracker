// @ts-nocheck
import { Router } from 'express';
import { addComment, updateComment, deleteComment, getComments } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/bug/:bugId', getComments);
router.post('/bug/:bugId', addComment);
router.get('/task/:taskId', getComments);
router.post('/task/:taskId', addComment);
router.patch('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;
