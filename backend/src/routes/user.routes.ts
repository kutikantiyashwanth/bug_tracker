// @ts-nocheck
import { Router } from 'express';
import { getUserById, updateProfile, searchUsers } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/search', searchUsers);
router.patch('/profile', updateProfile);
router.get('/:id', getUserById);

export default router;
