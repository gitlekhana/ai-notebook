export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ success: false, error: "Method not allowed" });

  const { noteId } = req.body;

  const note = global.notes?.find((n) => n.id === Number(noteId));
  if (!note) return res.status(404).json({ success: false, error: "Note not found" });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "Improve the clarity and structure of this note. Keep the same meaning but make it cleaner and better written." },
          { role: "user", content: note.content },
        ],
      }),
    });

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content || note.content;

    res.status(200).json({ success: true, data: { enhanced } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error enhancing note" });
  }
}