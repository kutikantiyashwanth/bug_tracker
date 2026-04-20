// @ts-nocheck
import { Router } from 'express';
import { getBugs, getBugById, createBug, updateBug, deleteBug } from '../controllers/bug.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/project/:projectId', getBugs);
router.post('/project/:projectId', createBug);
router.get('/:id', getBugById);
router.patch('/:id', updateBug);
router.delete('/:id', deleteBug);

export default router;
