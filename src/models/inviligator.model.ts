import mongoose from "mongoose";

const Invigilator = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

export default Invigilator;
