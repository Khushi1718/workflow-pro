import mongoose, { Schema, Document } from 'mongoose';

export type LogStatus = 'completed' | 'in_progress' | 'pending';
export type AttachmentType = 'image' | 'link' | 'document' | 'spreadsheet' | 'presentation';

export interface IAttachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
}

export interface IWorkLog extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  accomplishments: string;
  meetingsAttended: number;
  focusForTomorrow?: string;
  status: LogStatus;
  date: Date;
  meetingNotes?: string;
  attachments?: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['image', 'link', 'document', 'spreadsheet', 'presentation'],
      required: true,
    },
  },
  { _id: false }
);

const workLogSchema = new Schema<IWorkLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    accomplishments: {
      type: String,
      required: [true, 'Accomplishments are required'],
    },
    meetingsAttended: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    focusForTomorrow: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'in_progress', 'pending'],
        message: 'Status must be completed, in_progress, or pending',
      },
      default: 'completed',
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    meetingNotes: {
      type: String,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal performance
workLogSchema.index({ userId: 1, date: -1 });
workLogSchema.index({ date: -1, userId: 1 });

export default mongoose.model<IWorkLog>('WorkLog', workLogSchema);
