//
import { Schema, model, models } from "mongoose";

const ConversationSchema = new Schema(
  {
    session_id: { type: String, required: true },
    messages: [
      {
        role: String, // user | assistant
        content: String,
      },
    ],
  },
  { timestamps: true },
);

export const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);
