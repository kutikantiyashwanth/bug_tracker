import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects, getProjectById, createProject, updateProject,
  deleteProject, addMember, removeMember, createLabel,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';

const router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', [body('name').trim().isLength({ min: 2, max: 100 })], validate, createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/labels', createLabel);

export default router;
