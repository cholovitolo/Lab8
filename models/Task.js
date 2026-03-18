import mongoose from "mongoose";
 
const taskSchema = new mongoose.Schema({
  title: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
 
export default mongoose.model("Task", taskSchema);