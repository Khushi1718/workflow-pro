import { Request, Response } from 'express';
import WorkLog from '../models/WorkLog.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../utils/activity.js';
import { Types } from 'mongoose';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20, skip = 0, isActive, role } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skipNum = parseInt(skip as string) || 0;

    const filter: Record<string, unknown> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ joinedAt: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();

    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const count = await WorkLog.countDocuments({ userId: u._id });
        return { ...u, totalLogs: count };
      })
    );

    const total = await User.countDocuments(filter);

    await logActivity(
      {
        userId: req.user!.userId,
        action: 'view_users',
        resourceType: 'user',
      },
      req
    );

    sendSuccess(res, 200, 'Users retrieved successfully', usersWithCounts, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    sendError(res, 500, 'Failed to fetch users');
  }
};

export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    // Get total logs for this user
    const totalLogs = await WorkLog.countDocuments({ userId: new Types.ObjectId(id) });

    sendSuccess(res, 200, 'User retrieved successfully', {
      ...user.toObject(),
      totalLogs,
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    sendError(res, 500, 'Failed to fetch user');
  }
};

export const getAllLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      limit = 20,
      skip = 0,
      userId,
      status,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skipNum = parseInt(skip as string) || 0;

    const filter: Record<string, unknown> = {};

    if (userId) {
      filter.userId = new Types.ObjectId(userId as string);
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        (filter.date as Record<string, unknown>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.date as Record<string, unknown>).$lte = new Date(endDate as string);
      }
    }

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    if (sortBy === 'date') {
      sortObj.date = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'status') {
      sortObj.status = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'userId') {
      sortObj.userId = sortOrder === 'asc' ? 1 : -1;
    }

    const logs = await WorkLog.find(filter)
      .populate('userId', 'name email team')
      .sort(sortObj)
      .limit(limitNum)
      .skip(skipNum)
      .lean();

    const total = await WorkLog.countDocuments(filter);

    await logActivity(
      {
        userId: req.user!.userId,
        action: 'view_logs',
        resourceType: 'worklog',
        details: { filter },
      },
      req
    );

    sendSuccess(res, 200, 'All logs retrieved successfully', logs, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  } catch (error) {
    console.error('Get all logs error:', error);
    sendError(res, 500, 'Failed to fetch logs');
  }
};

export const getTodayLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20, skip = 0, userId, status } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skipNum = parseInt(skip as string) || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filter: Record<string, unknown> = {
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    };

    if (userId) {
      filter.userId = new Types.ObjectId(userId as string);
    }

    if (status) {
      filter.status = status;
    }

    const logs = await WorkLog.find(filter)
      .populate('userId', 'name email team')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();

    const total = await WorkLog.countDocuments(filter);

    sendSuccess(res, 200, 'Today logs retrieved successfully', logs, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  } catch (error) {
    console.error('Get today logs error:', error);
    sendError(res, 500, 'Failed to fetch today logs');
  }
};

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50, skip = 0, userId, action, startDate, endDate } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const skipNum = parseInt(skip as string) || 0;

    const filter: Record<string, unknown> = {};

    if (userId) {
      filter.userId = new Types.ObjectId(userId as string);
    }

    if (action) {
      filter.action = action;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        (filter.timestamp as Record<string, unknown>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.timestamp as Record<string, unknown>).$lte = new Date(endDate as string);
      }
    }

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();

    const total = await ActivityLog.countDocuments(filter);

    sendSuccess(res, 200, 'Activity logs retrieved successfully', logs, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    sendError(res, 500, 'Failed to fetch activity logs');
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      sendError(res, 400, 'isActive must be a boolean');
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isActive,
        leftAt: !isActive ? new Date() : null,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    await logActivity(
      {
        userId: req.user!.userId,
        action: 'role_change',
        resourceType: 'user',
        resourceId: id,
        details: { isActive },
      },
      req
    );

    sendSuccess(res, 200, 'User status updated successfully', user);
  } catch (error) {
    console.error('Update user status error:', error);
    sendError(res, 500, 'Failed to update user status');
  }
};
