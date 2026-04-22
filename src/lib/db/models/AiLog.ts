// modelo ialog

import { Schema, model, models } from "mongoose";

const AiLogSchema = new Schema(
  {
    type: { type: String, required: true }, // input | output
    input: { type: String },
    output: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true },
);

export const AiLog = models.AiLog || model("AiLog", AiLogSchema);
