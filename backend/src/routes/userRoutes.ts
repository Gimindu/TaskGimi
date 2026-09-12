import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// All user routes require a valid JWT
router.use(authenticateJWT);

// @route   GET /api/users
// @desc    Returns all users — used by the frontend for the assignee dropdown and admin user directory
// @access  Private (any authenticated user)
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, 'name email role isApproved createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users list', error: error.message });
  }
});

// Everything below this line is admin-only
router.use(requireRole('admin'));

// @route   PATCH /api/users/:id/approve
// @desc    Grants login access to a pending user registration
// @access  Admin only
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
// @desc    Declines a pending registration or removes an existing user account
// @access  Admin only
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Protect admin accounts from accidental deletion
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
