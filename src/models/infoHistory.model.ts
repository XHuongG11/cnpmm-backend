import mongoose, { Schema } from "mongoose";
import EGender from "../enums/EGender";
import basePlugin from "./base.model";

const InfoHistorySchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  fullName: String,
  identityCard: String,
  dob: Date,
  gender: {
    type: String,
    enum: EGender,
  },
  email: String,
  phone: String,
  studentClass: String,
  origin: String,
  major: String,
  facility: String,
  imageUrl: String,
});

InfoHistorySchema.plugin(basePlugin);

const InfoHistory = mongoose.model("InfoHistory", InfoHistorySchema);

export default InfoHistory;
