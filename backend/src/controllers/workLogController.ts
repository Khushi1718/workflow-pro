import { Request, Response } from 'express';
import WorkLog from '../models/WorkLog.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../utils/activity.js';
import { Types } from 'mongoose';

export const createWorkLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const {
      title,
      accomplishments,
      meetingsAttended,
      focusForTomorrow,
      status,
      date,
      meetingNotes,
      attachments,
    } = req.body;

    if (!title || !accomplishments || !date) {
      sendError(res, 400, 'Title, accomplishments, and date are required');
      return;
    }

    const workLog = new WorkLog({
      userId,
      title,
      accomplishments,
      meetingsAttended: meetingsAttended || 0,
      focusForTomorrow,
      status: status || 'completed',
      date: new Date(date),
      meetingNotes,
      attachments: attachments || [],
    });

    await workLog.save();

    await logActivity(
      {
        userId,
        action: 'create_log',
        resourceType: 'worklog',
        resourceId: workLog._id.toString(),
      },
      req
    );

    sendSuccess(res, 201, 'Work log created successfully', {
      id: workLog._id,
      userId: workLog.userId,
      title: workLog.title,
      status: workLog.status,
      date: workLog.date,
    });
  } catch (error: any) {
    console.error('Create work log error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      sendError(res, 400, messages);
    } else {
      sendError(res, 500, 'Failed to create work log');
    }
  }
};

export const updateWorkLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;
    const { title, accomplishments, status, meetingsAttended, focusForTomorrow, meetingNotes, attachments } = req.body;

    const workLog = await WorkLog.findById(id);
    if (!workLog) {
      sendError(res, 404, 'Work log not found');
      return;
    }

    // Only owner or admin can update
    if (workLog.userId.toString() !== userId && req.user?.role !== 'admin') {
      sendError(res, 403, 'Not authorized to update this log');
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (accomplishments) updateData.accomplishments = accomplishments;
    if (status) updateData.status = status;
    if (meetingsAttended !== undefined) updateData.meetingsAttended = meetingsAttended;
    if (focusForTomorrow) updateData.focusForTomorrow = focusForTomorrow;
    if (meetingNotes) updateData.meetingNotes = meetingNotes;
    if (attachments) updateData.attachments = attachments;

    const updatedLog = await WorkLog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    await logActivity(
      {
        userId,
        action: 'update_log',
        resourceType: 'worklog',
        resourceId: id,
      },
      req
    );

    sendSuccess(res, 200, 'Work log updated successfully', updatedLog);
  } catch (error) {
    console.error('Update work log error:', error);
    sendError(res, 500, 'Failed to update work log');
  }
};

export const deleteWorkLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const workLog = await WorkLog.findById(id);
    if (!workLog) {
      sendError(res, 404, 'Work log not found');
      return;
    }

    // Only owner or admin can delete
    if (workLog.userId.toString() !== userId && req.user?.role !== 'admin') {
      sendError(res, 403, 'Not authorized to delete this log');
      return;
    }

    await WorkLog.findByIdAndDelete(id);

    await logActivity(
      {
        userId,
        action: 'delete_log',
        resourceType: 'worklog',
        resourceId: id,
      },
      req
    );

    sendSuccess(res, 200, 'Work log deleted successfully');
  } catch (error) {
    console.error('Delete work log error:', error);
    sendError(res, 500, 'Failed to delete work log');
  }
};

export const getMyLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { limit = 20, skip = 0, startDate, endDate, status } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skipNum = parseInt(skip as string) || 0;

    // Build filter
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        (filter.date as Record<string, unknown>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.date as Record<string, unknown>).$lte = new Date(endDate as string);
      }
    }

    if (status) {
      filter.status = status;
    }

    const logs = await WorkLog.find(filter)
      .sort({ date: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();

    const total = await WorkLog.countDocuments(filter);

    await logActivity(
      {
        userId,
        action: 'view_logs',
        resourceType: 'worklog',
      },
      req
    );

    sendSuccess(res, 200, 'Logs retrieved successfully', logs, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  } catch (error) {
    console.error('Get my logs error:', error);
    sendError(res, 500, 'Failed to fetch logs');
  }
};

export const getLogDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const workLog = await WorkLog.findById(id).populate('userId', 'name email');
    if (!workLog) {
      sendError(res, 404, 'Work log not found');
      return;
    }

    // Check authorization
    if (workLog.userId._id.toString() !== userId && req.user?.role !== 'admin') {
      sendError(res, 403, 'Not authorized to view this log');
      return;
    }

    sendSuccess(res, 200, 'Log retrieved successfully', workLog);
  } catch (error) {
    console.error('Get log detail error:', error);
    sendError(res, 500, 'Failed to fetch log');
  }
};
