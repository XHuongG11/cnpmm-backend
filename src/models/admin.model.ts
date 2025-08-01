import mongoose, { Schema } from "mongoose";
import basePlugin from "./base.model.js";

const AdminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

AdminSchema.plugin(basePlugin);

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
