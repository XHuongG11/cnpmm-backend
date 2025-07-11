import mongoose, { Schema } from "mongoose";
import basePlugin from "./base.model";

const InvigilatorSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  staffId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
});

InvigilatorSchema.plugin(basePlugin);

const Invigilator = mongoose.model("Invigilator", InvigilatorSchema);

export default Invigilator;
