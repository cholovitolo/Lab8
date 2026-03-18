import Task from "../models/Task.js";

// ✅ GET TASKS
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).lean();
    res.render("dashboard", { tasks });
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};

// ✅ CREATE TASK
export const createTask = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.redirect("/dashboard");
    }

    await Task.create({
      title: req.body.title,
      user: req.user.id,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};

// ✅ DELETE TASK (only if it belongs to user)
export const deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};

// ✅ UPDATE TASK (only if it belongs to user)
export const updateTask = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.redirect("/dashboard");
    }

    await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title: req.body.title }
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};