const Todo = require("../models/todoModel");
const { google } = require("googleapis");
const User = require("../models/userModel");

// Set up Google Calendar API
const getGoogleCalendarClient = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.CLIENT_URL}/auth/google-callback`
  );

  // Use the updated schema structure
  oauth2Client.setCredentials({
    refresh_token: user.googleAuth.refresh_token,
    access_token: user.googleAuth.access_token
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
};

// Create a new todo
exports.createTodo = async (req, res) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;
    const userId = req.user._id;

    // Create todo in database
    const todo = await Todo.create({
      title,
      description,
      dueDate,
      status,
      priority,
      user: userId,
    });

    // Check if user has connected Google Calendar using the new schema structure
    if (req.user.googleAuth && req.user.googleAuth.connected && req.user.googleAuth.refresh_token) {
      try {
        const calendar = await getGoogleCalendarClient(req.user);

        // Create event in Google Calendar
        const event = {
          summary: title,
          description: description || "",
          start: {
            dateTime: new Date(dueDate).toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: new Date(
              new Date(dueDate).getTime() + 60 * 60 * 1000
            ).toISOString(), // 1 hour duration
            timeZone: "UTC",
          },
        };

        const calendarEvent = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        // Update todo with Google event ID
        todo.googleEventId = calendarEvent.data.id;
        await todo.save();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Google Calendar sync error:", error);
        // Continue even if Google Calendar sync fails
      }
    }

    res.status(201).json({
      status: "success",
      data: todo,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to create todo",
    });
  }
};

// Get all todos for a user
exports.getTodos = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, priority, date, limit } = req.query;

    // Build filter query
    const query = { user: userId };

    if (status) query.status = { $in: status.split(",") };
    if (priority) query.priority = { $in: priority.split(",") };
    if (date) {
      const today = new Date();
      let startDate, endDate;

      if (date === "today") {
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      } else if (date === "thisWeek") {
        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        endDate.setHours(23, 59, 59, 999);
      } else if (date === "thisMonth") {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(date);
        endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
      }

      query.dueDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Get todos from database
    let todosQuery = Todo.find(query).sort({ dueDate: -1 });

    // Apply limit if provided
    if (limit) {
      todosQuery = todosQuery.limit(parseInt(limit, 10));
    }

    const todos = await todosQuery.exec();

    res.status(200).json({
      status: "success",
      results: todos.length,
      data: todos,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to get todos",
    });
  }
};

// Get a single todo
exports.getTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const userId = req.user._id;

    const todo = await Todo.findOne({
      _id: todoId,
      user: userId,
    });

    if (!todo) {
      return res.status(404).json({
        status: "error",
        message: "Todo not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: todo,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to get todo",
    });
  }
};

// Update a todo
exports.updateTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    // Find and update todo
    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        status: "error",
        message: "Todo not found",
      });
    }

    // Check if user has connected Google Calendar using the new schema structure
    if (
      req.user.googleAuth && 
      req.user.googleAuth.connected && 
      req.user.googleAuth.refresh_token &&
      todo.googleEventId
    ) {
      try {
        const calendar = await getGoogleCalendarClient(req.user);

        // Get current event
        await calendar.events.get({
          calendarId: "primary",
          eventId: todo.googleEventId,
        });

        // Update event in Google Calendar
        const event = {
          summary: todo.title,
          description: todo.description || "",
          start: {
            dateTime: new Date(todo.dueDate).toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: new Date(
              new Date(todo.dueDate).getTime() + 60 * 60 * 1000
            ).toISOString(),
            timeZone: "UTC",
          },
        };

        await calendar.events.update({
          calendarId: "primary",
          eventId: todo.googleEventId,
          resource: event,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Google Calendar update error:", error);
        // Continue even if Google Calendar update fails
      }
    }

    res.status(200).json({
      status: "success",
      data: todo,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update todo",
    });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const userId = req.user._id;

    // Find todo to get Google event ID before deletion
    const todo = await Todo.findOne({ _id: todoId, user: userId });

    if (!todo) {
      return res.status(404).json({
        status: "error",
        message: "Todo not found",
      });
    }

    // Check if user has connected Google Calendar using the new schema structure
    if (
      req.user.googleAuth && 
      req.user.googleAuth.connected && 
      req.user.googleAuth.refresh_token &&
      todo.googleEventId
    ) {
      try {
        const calendar = await getGoogleCalendarClient(req.user);

        // Delete event from Google Calendar
        await calendar.events.delete({
          calendarId: "primary",
          eventId: todo.googleEventId,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Google Calendar delete error:", error);
        // Continue even if Google Calendar delete fails
      }
    }

    // Delete todo from database
    await Todo.findByIdAndDelete(todoId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete todo",
    });
  }
};

// Helper function to handle token refresh if needed
// eslint-disable-next-line no-unused-vars
const refreshTokenIfNeeded = async (user) => {
  // Check if token is expired or about to expire (5-minute buffer)
  if (user.googleAuth.expiry_date && Date.now() >= user.googleAuth.expiry_date - 300000) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.CLIENT_URL}/auth/google-callback`
      );
      
      oauth2Client.setCredentials({
        refresh_token: user.googleAuth.refresh_token
      });
      
      const { tokens } = await oauth2Client.refreshAccessToken();
      
      // Update user's tokens in the database
      await User.findByIdAndUpdate(user._id, {
        'googleAuth.access_token': tokens.access_token,
        'googleAuth.expiry_date': tokens.expiry_date,
        'googleAuth.lastSyncTime': new Date()
      });
      
      return tokens;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to refresh token:', error);
      return null;
    }
  }
  
  return null;
};