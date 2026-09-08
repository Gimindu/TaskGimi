import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'To Do' | 'Doing' | 'Done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  tags?: string[];
  project?: string;
  creator: Types.ObjectId | string;
  assignedUser?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'Doing', 'Done'],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    project: {
      type: String,
      default: 'General',
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>('Task', TaskSchema);
