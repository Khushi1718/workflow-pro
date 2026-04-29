import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/server/db";
import User from "@/server/models/User";
import WorkLog from "@/server/models/WorkLog";
import ActivityLog from "@/server/models/ActivityLog";
import Message from "@/server/models/Message";
import Notification from "@/server/models/Notification";
import { generateToken, verifyToken, type JWTPayload } from "@/server/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: {
    path?: string[];
  };
};

type Pagination = {
  total: number;
  limit: number;
  skip: number;
};

function ok<T>(message: string, data?: T, status = 200, pagination?: Pagination) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(pagination
        ? {
            pagination: {
              ...pagination,
              pages: Math.ceil(pagination.total / pagination.limit),
            },
          }
        : {}),
    },
    { status }
  );
}

function fail(status: number, message: string, error = message) {
  return NextResponse.json({ success: false, message, error }, { status });
}

function getPath(context: Context) {
  return `/${(context.params.path || []).join("/")}`;
}

async function readBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getQuery(request: NextRequest) {
  return request.nextUrl.searchParams;
}

function getAuth(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

function requireAuth(request: NextRequest) {
  try {
    const user = getAuth(request);
    if (!user) return { response: fail(401, "No token provided", "Authorization header missing") };
    return { user };
  } catch {
    return { response: fail(401, "Authentication failed", "Invalid or expired token") };
  }
}

function requireAdmin(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth;
  if (auth.user.role !== "admin") {
    return { response: fail(403, "Access denied", "Insufficient permissions") };
  }
  return auth;
}

async function logActivity(
  request: NextRequest,
  data: {
    userId: string;
    action: string;
    resourceType: "worklog" | "user" | "system";
    resourceId?: string;
    details?: Record<string, unknown>;
  }
) {
  try {
    await ActivityLog.create({
      ...data,
      details: data.details || {},
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

function boundedNumber(value: string | null, fallback: number, max: number) {
  return Math.min(parseInt(value || "", 10) || fallback, max);
}

function normalizeSeoData(seoData: any) {
  return {
    questionsAnswered: Math.max(0, Number(seoData?.questionsAnswered) || 0),
    backlinksCreated: Math.max(0, Number(seoData?.backlinksCreated) || 0),
    proofs: Array.isArray(seoData?.proofs) ? seoData.proofs : [],
  };
}

export async function POST(request: NextRequest, context: Context) {
  await connectDB();
  const path = getPath(context);
  const body = await readBody(request);

  if (path === "/auth/register") {
    const { name, email, password, team, role } = body;
    if (!name || !email || !password || !team) return fail(400, "All fields are required");

    const existingUser = await User.findOne({ email });
    if (existingUser) return fail(400, "Email already registered");

    const user = await User.create({
      name,
      email,
      password,
      team,
      role: role === "admin" ? "admin" : "employee",
    });
    const token = generateToken(user._id.toString(), user.role);

    await logActivity(request, {
      userId: user._id.toString(),
      action: "login",
      resourceType: "user",
      details: { method: "register" },
    });

    return ok(
      "User registered successfully",
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team,
        },
        token,
      },
      201
    );
  }

  if (path === "/auth/login") {
    const { email, password } = body;
    if (!email || !password) return fail(400, "Email and password are required");

    const user = await User.findOne({ email }).select("+password");
    if (!user) return fail(401, "Invalid credentials");

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) return fail(401, "Invalid credentials");

    const token = generateToken(user._id.toString(), user.role);

    await logActivity(request, {
      userId: user._id.toString(),
      action: "login",
      resourceType: "user",
    });

    return ok("Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        isActive: user.isActive,
        joinedAt: user.joinedAt,
        totalLogs: 0,
      },
      token,
    });
  }

  if (path === "/work-logs") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const {
      title,
      tasks,
      meetingsAttended,
      focusForTomorrow,
      status,
      date,
      meetingNotes,
      attachments,
      seoData,
    } = body;

    if (!title || !date) {
      return fail(400, "Title and date are required");
    }

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return fail(400, "At least one task is required");
    }

    try {
      // Parse the date to get the start and end of the day
      const logDate = new Date(date);
      const dayStart = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate(), 0, 0, 0);
      const dayEnd = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate(), 23, 59, 59);

      // Check if a log already exists for this day
      const existingLog = await WorkLog.findOne({
        userId: auth.user.userId,
        date: { $gte: dayStart, $lte: dayEnd }
      });

      if (existingLog) {
        // If log is submitted or auto-submitted, don't allow updates
        if (existingLog.state !== "draft") {
          return fail(400, `Cannot modify a ${existingLog.state} log`);
        }

        // Update the existing draft log
        existingLog.title = title;
        existingLog.tasks = tasks;
        existingLog.meetingsAttended = meetingsAttended || existingLog.meetingsAttended;
        existingLog.focusForTomorrow = focusForTomorrow || existingLog.focusForTomorrow;
        existingLog.status = status || existingLog.status;
        existingLog.meetingNotes = meetingNotes || existingLog.meetingNotes;
        if (attachments) existingLog.attachments = attachments;
        if (seoData !== undefined) existingLog.seoData = normalizeSeoData(seoData);

        await existingLog.save();

        await logActivity(request, {
          userId: auth.user.userId,
          action: "update_log",
          resourceType: "worklog",
          resourceId: existingLog._id.toString(),
        });

        return ok(
          "Work log updated successfully",
          existingLog,
          200
        );
      }

      // Create new log if it doesn't exist
      const workLog = await WorkLog.create({
        userId: auth.user.userId,
        title,
        tasks,
        meetingsAttended: meetingsAttended || 0,
        focusForTomorrow,
        status: status || "completed",
        date: dayStart,
        meetingNotes,
        attachments: attachments || [],
        seoData: normalizeSeoData(seoData),
        state: "draft", // Always start as draft
      });

      await logActivity(request, {
        userId: auth.user.userId,
        action: "create_log",
        resourceType: "worklog",
        resourceId: workLog._id.toString(),
      });

      return ok(
        "Work log created successfully",
        workLog,
        201
      );
    } catch (error: any) {
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err: any) => err.message).join(", ");
        return fail(400, messages);
      }
      console.error("Create work log error:", error);
      return fail(500, "Failed to create work log");
    }
  }

  if (path === "/messages") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const { message, receiverIds, mentions, contextType, contextId, attachments } = body;
    if (!message && (!attachments || attachments.length === 0)) return fail(400, "Message or attachments are required");
    if (!contextType) return fail(400, "contextType is required");

    try {
      const newMessage = await Message.create({
        senderId: auth.user.userId,
        receiverIds: receiverIds || [],
        message: message || "",
        mentions: mentions || [],
        contextType,
        contextId,
        attachments: attachments || [],
      });

      // Create notifications for mentions
      if (mentions && mentions.length > 0) {
        const notifications = mentions
          .filter((mId: string) => mId !== auth.user.userId)
          .map((mId: string) => ({
            userId: mId,
            type: "mention",
            messageId: newMessage._id,
          }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }

      // Create notifications for direct messages (if not already mentioned)
      if (contextType === "direct" && receiverIds && receiverIds.length > 0) {
        const directRecipients = receiverIds.filter(
          (rId: string) => rId !== auth.user.userId && (!mentions || !mentions.includes(rId))
        );
        if (directRecipients.length > 0) {
          await Notification.insertMany(
            directRecipients.map((rId: string) => ({
              userId: rId,
              type: "message",
              messageId: newMessage._id,
            }))
          );
        }
      }

      return ok("Message sent", newMessage, 201);
    } catch (error) {
      console.error("Send message error:", error);
      return fail(500, "Failed to send message");
    }
  }

  return fail(404, "Route not found");
}

export async function GET(request: NextRequest, context: Context) {
  await connectDB();
  const path = getPath(context);
  const query = getQuery(request);

  if (path === "/auth/profile") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const user = await User.findById(auth.user.userId);
    if (!user) return fail(404, "User not found");

    return ok("Profile retrieved", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
      isActive: user.isActive,
      joinedAt: user.joinedAt,
    });
  }

  if (path === "/work-logs/my-logs") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const limitNum = boundedNumber(query.get("limit"), 20, 100);
    const skipNum = parseInt(query.get("skip") || "", 10) || 0;
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(auth.user.userId) };
    const startDate = query.get("startDate");
    const endDate = query.get("endDate");
    const status = query.get("status");
    const submittedOnly = query.get("submittedOnly") === "true";

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    if (status) filter.status = status;

    // If submittedOnly is true, only return submitted or auto_submitted logs
    if (submittedOnly) {
      filter.state = { $in: ["submitted", "auto_submitted"] };
    }

    const logs = await WorkLog.find(filter).sort({ date: -1 }).limit(limitNum).skip(skipNum).lean();
    const total = await WorkLog.countDocuments(filter);

    await logActivity(request, {
      userId: auth.user.userId,
      action: "view_logs",
      resourceType: "worklog",
    });

    return ok("Logs retrieved successfully", logs, 200, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  }

  if (path === "/work-logs/today") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const today = new Date();
    // Create a 24-hour window centered around the local start of day
    // This handles almost all timezone offsets (UTC-12 to UTC+14)
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    
    const start = new Date(year, month, day, 0, 0, 0);
    start.setHours(start.getHours() - 12); // Buffer back
    const end = new Date(year, month, day, 23, 59, 59);
    end.setHours(end.getHours() + 12); // Buffer forward

    const log = await WorkLog.findOne({
      userId: auth.user.userId,
      date: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    return ok("Today's log retrieved", log);
  }

  const workLogMatch = path.match(/^\/work-logs\/([^/]+)$/);
  if (workLogMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const logId = workLogMatch[1];
    
    let workLog;
    if (Types.ObjectId.isValid(logId)) {
      workLog = await WorkLog.findById(logId).populate("userId", "name email");
    } else {
      workLog = await WorkLog.findOne({ id: logId }).populate("userId", "name email");
    }
    
    if (!workLog) return fail(404, "Work log not found");

    if (workLog.userId._id.toString() !== auth.user.userId && auth.user.role !== "admin") {
      return fail(403, "Not authorized to view this log");
    }

    return ok("Log retrieved successfully", workLog);
  }

  if (path === "/admin/users") {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const limitNum = boundedNumber(query.get("limit"), 20, 100);
    const skipNum = parseInt(query.get("skip") || "", 10) || 0;
    const filter: Record<string, unknown> = {};
    const isActive = query.get("isActive");
    const role = query.get("role");

    if (isActive !== null) filter.isActive = isActive === "true";
    if (role) filter.role = role;

    const users = await User.find(filter).select("-password").sort({ joinedAt: -1 }).limit(limitNum).skip(skipNum).lean();
    const usersWithCounts = await Promise.all(
      users.map(async (u) => ({
        ...u,
        totalLogs: await WorkLog.countDocuments({ userId: u._id }),
      }))
    );
    const total = await User.countDocuments(filter);

    await logActivity(request, {
      userId: auth.user.userId,
      action: "view_users",
      resourceType: "user",
    });

    return ok("Users retrieved successfully", usersWithCounts, 200, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  }

  const adminUserMatch = path.match(/^\/admin\/users\/([^/]+)$/);
  if (adminUserMatch) {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const userId = adminUserMatch[1];
    if (!Types.ObjectId.isValid(userId)) {
      return fail(404, "User not found");
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return fail(404, "User not found");

    const totalLogs = await WorkLog.countDocuments({ userId: new Types.ObjectId(userId) });
    return ok("User retrieved successfully", { ...user.toObject(), totalLogs });
  }

  if (path === "/admin/logs/all") {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const limitNum = boundedNumber(query.get("limit"), 20, 100);
    const skipNum = parseInt(query.get("skip") || "", 10) || 0;
    const filter: Record<string, unknown> = {};
    const userId = query.get("userId");
    const status = query.get("status");
    const startDate = query.get("startDate");
    const endDate = query.get("endDate");
    const sortBy = query.get("sortBy") || "date";
    const sortOrder = query.get("sortOrder") || "desc";
    const sortObj: Record<string, 1 | -1> = {};

    if (userId) filter.userId = new Types.ObjectId(userId);
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }
    if (sortBy === "date") sortObj.date = sortOrder === "asc" ? 1 : -1;
    else if (sortBy === "status") sortObj.status = sortOrder === "asc" ? 1 : -1;
    else if (sortBy === "userId") sortObj.userId = sortOrder === "asc" ? 1 : -1;

    const logs = await WorkLog.find(filter)
      .populate("userId", "name email team")
      .sort(sortObj)
      .limit(limitNum)
      .skip(skipNum)
      .lean();
    const total = await WorkLog.countDocuments(filter);

    await logActivity(request, {
      userId: auth.user.userId,
      action: "view_logs",
      resourceType: "worklog",
      details: { filter },
    });

    return ok("All logs retrieved successfully", logs, 200, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  }

  if (path === "/admin/logs/today") {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const limitNum = boundedNumber(query.get("limit"), 20, 100);
    const skipNum = parseInt(query.get("skip") || "", 10) || 0;
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
    const userId = query.get("userId");
    const status = query.get("status");
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (status) filter.status = status;

    const logs = await WorkLog.find(filter)
      .populate("userId", "name email team")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();
    const total = await WorkLog.countDocuments(filter);

    return ok("Today logs retrieved successfully", logs, 200, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  }

  if (path === "/admin/seo-reports") {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const limitNum = boundedNumber(query.get("limit"), 20, 100);
    const skipNum = parseInt(query.get("skip") || "", 10) || 0;
    const userId = query.get("userId");
    const department = query.get("department") || "SEO";
    const date = query.get("date");

    const userFilter: Record<string, unknown> = {
      role: "employee",
      team: { $regex: `^${department}$`, $options: "i" },
    };
    if (userId) userFilter._id = new Types.ObjectId(userId);

    const seoUsers = await User.find(userFilter).select("_id");
    const filter: Record<string, unknown> = {
      userId: { $in: seoUsers.map((u) => u._id) },
    };

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }

    const logs = await WorkLog.find(filter)
      .populate("userId", "name email team")
      .sort({ date: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();
    const total = await WorkLog.countDocuments(filter);

    return ok("SEO reports retrieved successfully", logs, 200, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  }

  if (path === "/admin/activity-logs") {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const limitNum = boundedNumber(query.get("limit"), 50, 200);
    const skipNum = parseInt(query.get("skip") || "", 10) || 0;
    const filter: Record<string, unknown> = {};
    const userId = query.get("userId");
    const action = query.get("action");
    const startDate = query.get("startDate");
    const endDate = query.get("endDate");

    if (userId) filter.userId = new Types.ObjectId(userId);
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) (filter.timestamp as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.timestamp as Record<string, unknown>).$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .lean();
    const total = await ActivityLog.countDocuments(filter);

    return ok("Activity logs retrieved successfully", logs, 200, {
      total,
      limit: limitNum,
      skip: skipNum,
    });
  }

  if (path === "/messages") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const contextType = query.get("contextType");
    const contextId = query.get("contextId");
    const receiverId = query.get("receiverId");

    const filter: any = {
      deletedBy: { $ne: auth.user.userId }
    };
    if (contextType) filter.contextType = contextType;
    if (contextId) filter.contextId = contextId;
    
    if (contextType === "direct") {
      filter.$or = [
        { senderId: auth.user.userId, receiverIds: receiverId },
        { senderId: receiverId, receiverIds: auth.user.userId }
      ];
    }

    const messages = await Message.find(filter)
      .populate("senderId", "name email role")
      .sort({ createdAt: 1 })
      .limit(100);

    return ok("Messages retrieved", messages);
  }

  if (path === "/notifications") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const notifications = await Notification.find({ userId: auth.user.userId })
      .populate({
        path: "messageId",
        populate: { path: "senderId", select: "name email" }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    return ok("Notifications retrieved", notifications);
  }

  if (path === "/users/search") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const q = query.get("q") || "";
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ],
      isActive: true
    }).select("name email role").limit(10);

    return ok("Users found", users);
  }

  if (path === "/messages/conversations") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    // Find all users the current user has sent/received messages from in 'direct' context
    const currentUserId = new Types.ObjectId(auth.user.userId);
    
    // Aggregation to find latest messages and unread counts
    const conversations = await Message.aggregate([
      {
        $match: {
          contextType: "direct",
          deletedBy: { $ne: currentUserId },
          $or: [
            { senderId: currentUserId },
            { receiverIds: currentUserId }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserId] },
              { $arrayElemAt: ["$receiverIds", 0] },
              "$senderId"
            ]
          },
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$senderId", currentUserId] },
                    { $not: { $in: [currentUserId, { $ifNull: ["$readBy", []] }] } }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCount: 1,
          "user.name": 1,
          "user.email": 1,
          "user.role": 1,
          "user._id": 1
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    return ok("Conversations retrieved", conversations);
  }

  return fail(404, "Route not found");
}

export async function PUT(request: NextRequest, context: Context) {
  await connectDB();
  const path = getPath(context);
  const body = await readBody(request);

  if (path === "/auth/profile") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const { name, team, email } = body;
    const user = await User.findByIdAndUpdate(auth.user.userId, { name, team, email }, { new: true, runValidators: true });
    if (!user) return fail(404, "User not found");

    await logActivity(request, {
      userId: auth.user.userId,
      action: "update_user",
      resourceType: "user",
      resourceId: auth.user.userId,
    });

    return ok("Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      team: user.team,
    });
  }

  if (path === "/auth/password") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) return fail(400, "Current and new passwords are required");

    const user = await User.findById(auth.user.userId).select("+password");
    if (!user) return fail(404, "User not found");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return fail(400, "Incorrect current password");

    user.password = newPassword;
    await user.save();

    await logActivity(request, {
      userId: auth.user.userId,
      action: "password_change",
      resourceType: "user",
      resourceId: auth.user.userId,
    });

    return ok("Password updated successfully");
  }

  const adminStatusMatch = path.match(/^\/admin\/users\/([^/]+)\/status$/);
  if (adminStatusMatch) {
    const auth = requireAdmin(request);
    if (auth.response) return auth.response;

    const userId = adminStatusMatch[1];
    if (!Types.ObjectId.isValid(userId)) {
      return fail(404, "User not found");
    }

    const { isActive } = body;
    if (typeof isActive !== "boolean") return fail(400, "isActive must be a boolean");

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive, leftAt: !isActive ? new Date() : null },
      { new: true }
    ).select("-password");
    if (!user) return fail(404, "User not found");

    await logActivity(request, {
      userId: auth.user.userId,
      action: "role_change",
      resourceType: "user",
      resourceId: adminStatusMatch[1],
      details: { isActive },
    });

    return ok("User status updated successfully", user);
  }

  const workLogTaskMatch = path.match(/^\/work-logs\/([^/]+)\/tasks\/([^/]+)$/);
  if (workLogTaskMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const [, logId, taskId] = workLogTaskMatch;
    if (!Types.ObjectId.isValid(logId)) {
      return fail(404, "Work log not found");
    }
    const workLog = await WorkLog.findById(logId);
    if (!workLog) return fail(404, "Work log not found");

    if (workLog.userId.toString() !== auth.user.userId && auth.user.role !== "admin") {
      return fail(403, "Not authorized to update this log");
    }

    const { status, notes } = body;
    const taskIndex = workLog.tasks.findIndex((t: any) => t.id === taskId);
    if (taskIndex === -1) return fail(404, "Task not found");

    if (status) {
      workLog.tasks[taskIndex].status = status;
      if (status === "completed") {
        workLog.tasks[taskIndex].completedAt = new Date();
      } else {
        workLog.tasks[taskIndex].completedAt = undefined;
      }
    }
    if (notes !== undefined) workLog.tasks[taskIndex].notes = notes;

    await workLog.save();

    await logActivity(request, {
      userId: auth.user.userId,
      action: "update_task",
      resourceType: "worklog",
      resourceId: logId,
      details: { taskId, status },
    });

    return ok("Task updated successfully", workLog.tasks[taskIndex]);
  }

  const workLogMatch = path.match(/^\/work-logs\/([^/]+)$/);
  if (workLogMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const logId = workLogMatch[1];


    let workLog;
    if (Types.ObjectId.isValid(logId)) {
      workLog = await WorkLog.findById(logId);
    } else {
      workLog = await WorkLog.findOne({ id: logId });
    }
    if (!workLog) return fail(404, "Work log not found");

    if (workLog.userId.toString() !== auth.user.userId && auth.user.role !== "admin") {
      return fail(403, "Not authorized to update this log");
    }

    const updateData: Record<string, unknown> = {};
    const fields = ["title", "tasks", "status", "meetingsAttended", "focusForTomorrow", "meetingNotes", "attachments", "seoData"];
    fields.forEach((field) => {
      if (body[field] !== undefined && body[field] !== "") {
        updateData[field] = field === "seoData" ? normalizeSeoData(body[field]) : body[field];
      }
    });

    const updatedLog = await WorkLog.findByIdAndUpdate(logId, updateData, {
      new: true,
      runValidators: true,
    });

    await logActivity(request, {
      userId: auth.user.userId,
      action: "update_log",
      resourceType: "worklog",
      resourceId: logId,
    });

    return ok("Work log updated successfully", updatedLog);
  }

  const workLogSubmitMatch = path.match(/^\/work-logs\/([^/]+)\/submit$/);
  if (workLogSubmitMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const logId = workLogSubmitMatch[1];
    const { isAutoSubmit } = body; // Optional flag to indicate auto-submission

    let workLog;
    if (Types.ObjectId.isValid(logId)) {
      workLog = await WorkLog.findById(logId);
    } else {
      workLog = await WorkLog.findOne({ id: logId });
    }
    
    if (!workLog) return fail(404, "Work log not found");

    if (workLog.userId.toString() !== auth.user.userId && !isAutoSubmit) {
      return fail(403, "Not authorized to submit this log");
    }

    if (isAutoSubmit) {
      workLog.state = "auto_submitted";
      workLog.autoSubmittedAt = new Date();
    } else {
      workLog.state = "submitted";
      workLog.submittedAt = new Date();
    }
    
    await workLog.save();

    await logActivity(request, {
      userId: auth.user.userId,
      action: isAutoSubmit ? "auto_submit_log" : "submit_log",
      resourceType: "worklog",
      resourceId: logId,
    });

    return ok(
      isAutoSubmit ? "Work log auto-submitted successfully" : "Work log submitted successfully",
      workLog
    );
  }

  if (path === "/notifications/read-all") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    await Notification.updateMany({ userId: auth.user.userId, isRead: false }, { isRead: true });
    return ok("All notifications marked as read");
  }

  const notificationReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (notificationReadMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const notificationId = notificationReadMatch[1];
    await Notification.findOneAndUpdate({ _id: notificationId, userId: auth.user.userId }, { isRead: true });
    return ok("Notification marked as read");
  }

  if (path === "/messages/read") {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const { contextType, contextId, senderId } = body;
    const currentUserId = new Types.ObjectId(auth.user.userId);

    const filter: any = {
      contextType,
      readBy: { $ne: currentUserId }
    };

    if (contextId) filter.contextId = contextId;
    if (senderId) filter.senderId = new Types.ObjectId(senderId);

    await Message.updateMany(filter, { $addToSet: { readBy: currentUserId } });
    
    // Also mark related notifications as read
    const messages = await Message.find(filter).select("_id");
    if (messages.length > 0) {
      await Notification.updateMany(
        { userId: currentUserId, messageId: { $in: messages.map(m => m._id) } },
        { isRead: true }
      );
    }

    return ok("Messages marked as read");
  }

  return fail(404, "Route not found");
}

export async function DELETE(request: NextRequest, context: Context) {
  await connectDB();
  const path = getPath(context);

  const conversationMatch = path.match(/^\/messages\/conversation\/([^/]+)$/);
  if (conversationMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const otherUserId = conversationMatch[1];
    if (!Types.ObjectId.isValid(otherUserId)) return fail(404, "User not found");

    const currentUserId = new Types.ObjectId(auth.user.userId);
    const targetUserId = new Types.ObjectId(otherUserId);

    await Message.updateMany(
      {
        contextType: "direct",
        $or: [
          { senderId: currentUserId, receiverIds: targetUserId },
          { senderId: targetUserId, receiverIds: currentUserId }
        ]
      },
      { $addToSet: { deletedBy: currentUserId } }
    );

    return ok("Conversation hidden for you");
  }

  const workLogMatch = path.match(/^\/work-logs\/([^/]+)$/);
  if (workLogMatch) {
    const auth = requireAuth(request);
    if (auth.response) return auth.response;

    const logId = workLogMatch[1];
    if (!Types.ObjectId.isValid(logId)) {
      return fail(404, "Work log not found");
    }

    const workLog = await WorkLog.findById(logId);
    if (!workLog) return fail(404, "Work log not found");

    if (workLog.userId.toString() !== auth.user.userId && auth.user.role !== "admin") {
      return fail(403, "Not authorized to delete this log");
    }

    if (Types.ObjectId.isValid(logId)) {
      await WorkLog.findByIdAndDelete(logId);
    } else {
      await WorkLog.findOneAndDelete({ id: logId });
    }

    await logActivity(request, {
      userId: auth.user.userId,
      action: "delete_log",
      resourceType: "worklog",
      resourceId: logId,
    });

    return ok("Work log deleted successfully");
  }

  return fail(404, "Route not found");
}
