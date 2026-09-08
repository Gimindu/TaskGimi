import { Router, Response } from 'express';
import { Task, TaskStatus } from '../models/Task';
import { User } from '../models/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateJWT);

// @route   GET /api/tasks
// @desc    Get tasks based on role and permissions
// @access  Private (User & Admin)
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let query = {};
    if (role !== 'admin') {
      // Normal users can view tasks created by them, assigned to them, or unassigned tasks
      query = {
        $or: [
          { creator: userId },
          { assignedUser: userId },
          { assignedUser: null },
          { assignedUser: { $exists: false } },
        ],
      };
    }

    const tasks = await Task.find(query)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, tags, project, assignedUser } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!title) {
      res.status(400).json({ message: 'Task title is required.' });
      return;
    }

    let targetAssignedUser = null;
    if (assignedUser) {
      if (role === 'admin') {
        // Admin can assign to any user
        targetAssignedUser = assignedUser;
      } else {
        // Normal user can only assign to themselves if specified
        targetAssignedUser = userId;
      }
    }

    const validStatus: TaskStatus = ['To Do', 'Doing', 'Done'].includes(status) ? status : 'To Do';
    const validPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
    const validDueDate = dueDate ? new Date(dueDate) : null;
    const validTags = Array.isArray(tags) ? tags.map((t: any) => String(t).trim()).filter(Boolean) : [];
    const validProject = project ? String(project).trim() : 'General';

    const newTask = await Task.create({
      title,
      description: description || '',
      status: validStatus,
      priority: validPriority,
      dueDate: validDueDate,
      tags: validTags,
      project: validProject,
      creator: userId,
      assignedUser: targetAssignedUser,
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task details (Title, Description, Status, Priority, DueDate, Tags, Project, Assignment)
// @access  Private
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, tags, project, assignedUser } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }

    // Permission check: Only admin or task creator can update task details (title, description, priority, etc.)
    const isCreator = task.creator.toString() === userId;

    if (role !== 'admin' && !isCreator) {
      res.status(403).json({
        message: 'Only administrators or the task creator can edit task details. Assigned members can only update task status.',
      });
      return;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined && ['To Do', 'Doing', 'Done'].includes(status)) {
      task.status = status as TaskStatus;
    }
    if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
      task.priority = priority as any;
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (tags !== undefined) {
      task.tags = Array.isArray(tags) ? tags.map((t: any) => String(t).trim()).filter(Boolean) : [];
    }
    if (project !== undefined) {
      task.project = project ? String(project).trim() : 'General';
    }

    // Handle assignment
    if (assignedUser !== undefined) {
      if (role === 'admin') {
        task.assignedUser = assignedUser ? assignedUser : null;
      } else {
        // Normal user can only assign to themselves if unassigned or already assigned/creator
        if (assignedUser === userId || assignedUser === null) {
          task.assignedUser = assignedUser ? userId : null;
        } else {
          res.status(403).json({ message: 'Normal users can strictly assign tasks to themselves.' });
          return;
        }
      }
    }

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status (Interactive Drag and Drop)
// @access  Private
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!['To Do', 'Doing', 'Done'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value.' });
      return;
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }

    const isCreator = task.creator.toString() === userId;
    const isAssigned = task.assignedUser?.toString() === userId;
    const isUnassigned = !task.assignedUser;

    if (role !== 'admin' && !isCreator && !isAssigned && !isUnassigned) {
      res.status(403).json({ message: 'Permission denied to modify status for this task.' });
      return;
    }

    task.status = status as TaskStatus;
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating task status', error: error.message });
  }
});

// @route   PATCH /api/tasks/:id/assign
// @desc    Assign or reassign task
// @access  Private
router.patch('/:id/assign', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { targetUserId } = req.body; // user ID to assign to (or null)
    const userId = req.user?.id;
    const role = req.user?.role;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }

    if (role === 'admin') {
      // Admin can reassign to any valid user or unassign
      if (targetUserId) {
        const userExists = await User.findById(targetUserId);
        if (!userExists) {
          res.status(404).json({ message: 'Target user not found.' });
          return;
        }
        task.assignedUser = targetUserId;
      } else {
        task.assignedUser = null;
      }
    } else {
      // Normal user can only assign unassigned task strictly to themselves
      if (task.assignedUser && task.assignedUser.toString() !== userId) {
        res.status(403).json({ message: 'Task is already assigned to another user.' });
        return;
      }
      task.assignedUser = userId;
    }

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }

    const isCreator = task.creator.toString() === userId;
    if (role !== 'admin' && !isCreator) {
      res.status(403).json({ message: 'Only administrators or the task creator can delete this task.' });
      return;
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

export default router;
