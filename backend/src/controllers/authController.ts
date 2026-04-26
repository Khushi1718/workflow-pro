import { Request, Response } from 'express';
import User, { IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../utils/activity.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, team, role } = req.body;

    // Validation
    if (!name || !email || !password || !team) {
      sendError(res, 400, 'All fields are required');
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 400, 'Email already registered');
      return;
    }

    // Create user – allow role to be specified (admin can create other admins)
    const user = new User({
      name,
      email,
      password,
      team,
      role: role === 'admin' ? 'admin' : 'employee',
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    // Log activity
    await logActivity(
      {
        userId: user._id.toString(),
        action: 'login',
        resourceType: 'user',
        details: { method: 'register' },
      },
      req
    );

    sendSuccess(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 500, 'Registration failed');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 400, 'Email and password are required');
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 401, 'Invalid credentials');
      return;
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      sendError(res, 401, 'Invalid credentials');
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    // Log activity
    await logActivity(
      {
        userId: user._id.toString(),
        action: 'login',
        resourceType: 'user',
      },
      req
    );

    sendSuccess(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        isActive: user.isActive,
        joinedAt: user.joinedAt,
        totalLogs: 0, // Will be fetched separately if needed
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Login failed');
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, 'Profile retrieved', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
      isActive: user.isActive,
      joinedAt: user.joinedAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 500, 'Failed to fetch profile');
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { name, team, email } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, team, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    await logActivity(
      {
        userId,
        action: 'update_user',
        resourceType: 'user',
        resourceId: userId,
      },
      req
    );

    sendSuccess(res, 200, 'Profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      team: user.team,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 500, 'Failed to update profile');
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      sendError(res, 400, 'Current and new passwords are required');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      sendError(res, 400, 'Incorrect current password');
      return;
    }

    user.password = newPassword;
    await user.save();

    await logActivity(
      {
        userId,
        action: 'password_change',
        resourceType: 'user',
        resourceId: userId,
      },
      req
    );

    sendSuccess(res, 200, 'Password updated successfully');
  } catch (error) {
    console.error('Update password error:', error);
    sendError(res, 500, 'Failed to update password');
  }
};
