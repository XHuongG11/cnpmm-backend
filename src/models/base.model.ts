import { Schema } from "mongoose";

export default function basePlugin(schema: Schema): void {
  schema.add({ isDeleted: { type: Boolean, default: false } });
  schema.set("timestamps", true);
}
