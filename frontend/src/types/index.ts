export type Role = 'user' | 'admin';

export type TaskStatus = 'To Do' | 'Doing' | 'Done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  isApproved?: boolean;
  createdAt?: string;
}

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | Date | null;
  creator: User | string;
  assignedUser?: User | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
