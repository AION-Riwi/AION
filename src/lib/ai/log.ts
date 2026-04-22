//

import { AiLog } from "../db/models/AiLog";
import { connectMongo } from "../db/mongodb";

export const logAIInteraction = async ({
  type,
  input,
  output,
  metadata = {},
}: {
  type: "input" | "output";
  input?: string;
  output?: string;
  metadata?: unknown;
}) => {
  await connectMongo();

  await AiLog.create({
    type,
    input,
    output,
    metadata,
  });
};
