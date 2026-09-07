import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'task_gimi_super_secret_jwt_key_2026_!@#';

// Generate JWT Helper
const generateToken = (id: string, email: string, role: 'user' | 'admin', name: string) => {
  return jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new normal user (Admin registration strictly blocked)
// @access  Public
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (role === 'admin') {
      res.status(403).json({
        message: 'Administrator accounts cannot be created via registration. Please contact system administrator.',
      });
      return;
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: 'user',
      isApproved: false,
    });

    console.log(`[Auth Register] New user "${cleanEmail}" registered (pending admin approval).`);

    res.status(201).json({
      message: 'Registration successful. Your account is pending administrator approval before you can log in.',
      isApproved: false,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: false,
      },
    });
  } catch (error: any) {
    console.error('[Auth Register Error]', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token
// @access  Public
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    console.log(`[Auth] Login attempt for email: "${cleanEmail}"`);

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      console.warn(`[Auth Failed] No user found with email: "${cleanEmail}"`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(cleanPassword);
    if (!isMatch) {
      console.warn(`[Auth Failed] Password mismatch for email: "${cleanEmail}"`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Check Admin Approval Status
    if (!user.isApproved) {
      console.warn(`[Auth Blocked] User "${cleanEmail}" is pending administrator approval.`);
      res.status(403).json({
        message: 'Your account is pending administrator approval. Please contact a system administrator to approve your account.',
      });
      return;
    }

    console.log(`[Auth Success] User "${cleanEmail}" (${user.role}) logged in successfully.`);

    const token = generateToken(user._id.toString(), user.email, user.role, user.name);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Auth Error]', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
});

export default router;
