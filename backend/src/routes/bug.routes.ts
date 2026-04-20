import { Router } from 'express';
import { body } from 'express-validator';
import { getBugs, getBugById, createBug, updateBug, deleteBug, getBugStats } from '../controllers/bug.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.get('/project/:projectId', getBugs);
router.get('/project/:projectId/stats', getBugStats);
router.post('/project/:projectId',
  [
    body('title').trim().isLength({ min: 5, max: 200 }),
    body('description').trim().isLength({ min: 10 }),
  ],
  validate, createBug
);

router.get('/:id', getBugById);
router.patch('/:id', updateBug);
router.delete('/:id', deleteBug);

export default router;
