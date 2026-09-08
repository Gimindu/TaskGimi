'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../lib/api';
import { Task, TaskStatus, TaskPriority, User } from '../types';

interface TaskContextType {
  tasks: Task[];
  allUsers: User[];
  loading: boolean;
  isRefreshing: boolean;
  lastFetched: number | null;
  refreshAll: () => Promise<void>;
  handleStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  handleSaveTask: (
    data: {
      title: string;
      description: string;
      status: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
      tags?: string[];
      project?: string;
      assignedUser?: string | null;
    },
    editingTaskId?: string
  ) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleClaimTask: (taskId: string) => Promise<void>;
  handleReassignTask: (taskId: string, targetUserId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Cache TTL: 5 minutes (300,000 ms)
const CACHE_TTL_MS = 5 * 60 * 1000;

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id || user?._id;

  // Helper ID comparison
  const isTaskMatch = (t: Task, taskId: string) =>
    (t._id && String(t._id) === String(taskId)) ||
    (t.id && String(t.id) === String(taskId));

  // Fetch Tasks from API (Only if cache expired or forced)
  const fetchTasksInternal = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
    }
  }, []);

  // Fetch Users List (Admin Only)
  const fetchUsersInternal = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data);
    } catch (err: any) {
      console.error('Error loading users:', err);
    }
  }, []);

  // Load Initial Data with Cache Check
  const loadData = useCallback(async (force = false) => {
    if (!user) {
      setTasks([]);
      setAllUsers([]);
      setLoading(false);
      return;
    }

    const now = Date.now();
    const isCacheValid = lastFetched && now - lastFetched < CACHE_TTL_MS;

    if (!force && isCacheValid && tasks.length > 0) {
      // Use cached data instantly
      setLoading(false);
      return;
    }

    if (tasks.length === 0) {
      setLoading(true);
    }

    try {
      await Promise.all([fetchTasksInternal(), fetchUsersInternal()]);
      setLastFetched(Date.now());
    } finally {
      setLoading(false);
    }
  }, [user, lastFetched, tasks.length, fetchTasksInternal, fetchUsersInternal]);

  // Initial load effect when user logs in
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setTasks([]);
      setAllUsers([]);
      setLastFetched(null);
      setLoading(false);
    }
  }, [user]);

  // Silent Background Auto-Refresh Function (No spinner flicker)
  const silentRefresh = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
      ]);

      // Check if tasks data changed on server
      if (tasksRes.data && JSON.stringify(tasksRes.data) !== JSON.stringify(tasks)) {
        setTasks(tasksRes.data);
      }

      // Check if users data changed on server (Admin only)
      if (isAdmin && usersRes.data && JSON.stringify(usersRes.data) !== JSON.stringify(allUsers)) {
        setAllUsers(usersRes.data);
      }

      setLastFetched(Date.now());
    } catch (err) {
      // Silent catch for background polling
    }
  }, [user, isAdmin, tasks, allUsers]);

  // Automatic Background Polling (Every 8 Seconds) & Window Focus Listener
  useEffect(() => {
    if (!user) return;

    // Poll every 8 seconds for live changes
    const interval = setInterval(() => {
      silentRefresh();
    }, 8000);

    // Auto refresh when returning to tab / window
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        silentRefresh();
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [user, silentRefresh]);

  // Explicit Manual Refresh
  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTasksInternal(), fetchUsersInternal()]);
      setLastFetched(Date.now());
      showToast('Data Refreshed', 'info', 'Workspace tasks & users synced with server.');
    } catch (err: any) {
      showToast('Refresh Failed', 'error', err.message || 'Could not refresh workspace data.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Optimistic Status Change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Instant local cache update
    setTasks((prev) =>
      prev.map((t) => (isTaskMatch(t, taskId) ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (isTaskMatch(t, taskId) ? res.data : t))
      );
      showToast('Task Status Updated', 'success', `Moved task to '${newStatus}'`);
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      showToast('Status Update Failed', 'error', err.message || 'Could not update status.');
      fetchTasksInternal();
    }
  };

  // Optimistic Save (Create / Edit)
  const handleSaveTask = async (
    data: {
      title: string;
      description: string;
      status: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
      tags?: string[];
      project?: string;
      assignedUser?: string | null;
    },
    editingTaskId?: string
  ) => {
    try {
      if (editingTaskId) {
        // Optimistic edit
        setTasks((prev) =>
          prev.map((t) =>
            isTaskMatch(t, editingTaskId) ? { ...t, ...data } : t
          )
        );
        const res = await api.put(`/tasks/${editingTaskId}`, data);
        setTasks((prev) =>
          prev.map((t) => (isTaskMatch(t, editingTaskId) ? res.data : t))
        );
        showToast('Task Updated', 'success', `Saved changes for "${data.title}"`);
      } else {
        const res = await api.post('/tasks', data);
        setTasks((prev) => [res.data, ...prev]);
        showToast('Task Created', 'success', `Added "${data.title}" to board`);
      }
      setLastFetched(Date.now());
    } catch (err: any) {
      console.error('Failed to save task:', err);
      showToast('Save Failed', 'error', err.message || 'Could not save task.');
      fetchTasksInternal();
    }
  };

  // Optimistic Delete
  const handleDeleteTask = async (taskId: string) => {
    // Instant local removal from cache
    setTasks((prev) => prev.filter((t) => !isTaskMatch(t, taskId)));

    try {
      await api.delete(`/tasks/${taskId}`);
      showToast('Task Deleted', 'warning', 'Task removed from workspace.');
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      showToast('Deletion Failed', 'error', err.message || 'Could not delete task.');
      fetchTasksInternal();
    }
  };

  // Optimistic Claim
  const handleClaimTask = async (taskId: string) => {
    if (!currentUserId) return;

    setTasks((prev) =>
      prev.map((t) =>
        isTaskMatch(t, taskId)
          ? { ...t, assignedUser: user as any }
          : t
      )
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/assign`, { targetUserId: currentUserId });
      setTasks((prev) =>
        prev.map((t) => (isTaskMatch(t, taskId) ? res.data : t))
      );
      showToast('Task Claimed', 'success', 'You assigned this task to yourself.');
    } catch (err: any) {
      console.error('Failed to claim task:', err);
      showToast('Claim Failed', 'error', err.message || 'Could not claim task.');
      fetchTasksInternal();
    }
  };

  // Optimistic Reassign
  const handleReassignTask = async (taskId: string, targetUserId: string) => {
    const targetUser = allUsers.find((u) => (u.id || u._id) === targetUserId) || null;

    setTasks((prev) =>
      prev.map((t) =>
        isTaskMatch(t, taskId)
          ? { ...t, assignedUser: targetUser as any }
          : t
      )
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/assign`, { targetUserId: targetUserId || null });
      setTasks((prev) =>
        prev.map((t) => (isTaskMatch(t, taskId) ? res.data : t))
      );
      showToast('Task Reassigned', 'info', 'Updated task assignment.');
    } catch (err: any) {
      console.error('Failed to reassign task:', err);
      showToast('Reassignment Failed', 'error', err.message || 'Could not reassign task.');
      fetchTasksInternal();
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        allUsers,
        loading,
        isRefreshing,
        lastFetched,
        refreshAll,
        handleStatusChange,
        handleSaveTask,
        handleDeleteTask,
        handleClaimTask,
        handleReassignTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
