import { Router } from 'express';
import {
  getProjects, getProjectById, createProject, updateProject,
  deleteProject, addMember, removeMember, joinProject,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.post('/join', joinProject);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
