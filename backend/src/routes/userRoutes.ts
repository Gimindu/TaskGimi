import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Require JWT authentication
router.use(authenticateJWT);

// @route   GET /api/users
// @desc    Get all users list (For user assignment & sorting/filtering)
// @access  Private (Authenticated users)
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, 'name email role isApproved createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users list', error: error.message });
  }
});

// Require Admin role for approval and deletion management
router.use(requireRole('admin'));

// @route   PATCH /api/users/:id/approve
// @desc    Approve a pending user registration (Admin only)
// @access  Private (Admin)
router.patch('/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    user.isApproved = true;
    await user.save();

    res.json({
      message: `User ${user.email} approved successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Decline / Remove user account (Admin only)
// @access  Private (Admin)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ message: 'Cannot delete an administrator account.' });
      return;
    }

    await user.deleteOne();
    res.json({ message: `User ${user.email} declined and removed successfully.`, id });
  } catch (error: any) {
    res.status(500).json({ message: 'Error removing user', error: error.message });
  }
});

export default router;
