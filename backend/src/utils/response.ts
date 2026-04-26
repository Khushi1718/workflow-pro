import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    skip: number;
    pages: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  pagination?: { total: number; limit: number; skip: number }
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    };
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message,
  });
};
