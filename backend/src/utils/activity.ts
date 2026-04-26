import ActivityLog, { IActivityLog } from '../models/ActivityLog.js';
import { Request } from 'express';

export interface ActivityLogData {
  userId: string;
  action: string;
  resourceType: 'worklog' | 'user' | 'system';
  resourceId?: string;
  details?: Record<string, unknown>;
}

export const logActivity = async (
  data: ActivityLogData,
  req?: Request
): Promise<IActivityLog> => {
  try {
    const activityLog = new ActivityLog({
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.get('user-agent') || 'unknown',
      timestamp: new Date(),
    });

    return await activityLog.save();
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getActivityLogs = async (
  filters: Record<string, unknown> = {},
  limit: number = 50,
  skip: number = 0
): Promise<{ logs: IActivityLog[]; total: number }> => {
  try {
    const logs = await ActivityLog.find(filters)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments(filters);

    return { logs, total };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};
