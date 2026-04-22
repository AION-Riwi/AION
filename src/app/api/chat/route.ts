import { dishes } from "@/data/dishes";
import { cosineSimilarity, getEmbedding } from "@/vectorUtils";

export async function POST(req: Request) {
  const { message } = await req.json();

  let context = "";

  try {
    // 1. Obtener embedding de la pregunta del usuario
    const userEmbedding = await getEmbedding(message);

    // 2. Obtener embeddings de los platos y calcular similitud
    // (En una app real, los embeddings de los platos estarían pre-calculados en una DB)
    const dishesWithSimilarity = await Promise.all(
      dishes.map(async (dish) => {
        const dishText = `${dish.name}: ${dish.description}`;
        const dishEmbedding = await getEmbedding(dishText);
        return {
          ...dish,
          similarity: cosineSimilarity(userEmbedding, dishEmbedding),
        };
      }),
    );

    // 3. Tomar los 3 platos más relevantes
    const topDishes = dishesWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    // 4. Crear el contexto para la IA
    context = topDishes
      .map(
        (d) =>
          `- ${d.name} (${d.category}): ${d.description}. Precio: $${d.price}`,
      )
      .join("\n");
  } catch (error) {
    console.error("Error en RAG:", error);
  }

  const systemPrompt = `Eres el asistente virtual de un puesto de comida callejera. 
TU OBJETIVO: Recomendar platos de nuestro menú basándote EXCLUSIVAMENTE en la información proporcionada.

REGLAS CRÍTICAS:
1. NO des recetas ni instrucciones de cómo preparar la comida.
2. Si el usuario pregunta por algo que NO está en el menú (como arepas, pizza, etc.), indica que no lo tenemos y recomienda la opción más cercana de nuestra lista.
3. Mantén tus respuestas cortas y directas.
4. Usa siempre un tono amable y servicial.

MENÚ DISPONIBLE PARA RECOMENDAR:
${context ? context : "Lo sentimos, no tenemos información de platos en este momento."}
`;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "phi3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      options: {
        stop: [
          "Usuario:",
          "User:",
          "<|end|>",
          "<|user|>",
          "<|assistant|>",
          "<|system|>",
        ],
      },
    }),
  });

  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            controller.enqueue(new TextEncoder().encode(json.message.content));
          }
        } catch (e) {
          console.error("Error parsing JSON chunk:", e);
        }
      }
    },
  });

  return new Response(response.body?.pipeThrough(transformStream), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
