global.notes = global.notes || [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — fetch all notes
  if (req.method === "GET") {
    return res.status(200).json({ success: true, data: global.notes });
  }

  // POST — create note
  if (req.method === "POST") {
    const { title, content, tags } = req.body;
    const note = {
      id: Date.now(),
      title: title || "Untitled",
      content: content || "",
      tags: tags || [],
      updatedAt: new Date().toISOString(),
    };
    global.notes.unshift(note);
    return res.status(200).json({ success: true, data: note });
  }

  // PUT — update note
  if (req.method === "PUT") {
    const id = Number(req.query.id);
    const index = global.notes.findIndex((n) => n.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: "Note not found" });

    global.notes[index] = {
      ...global.notes[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };
    return res.status(200).json({ success: true, data: global.notes[index] });
  }

  // DELETE — remove note
  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    const index = global.notes.findIndex((n) => n.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: "Note not found" });

    global.notes.splice(index, 1);
    return res.status(200).json({ success: true, data: { id } });
  }

  res.status(405).json({ success: false, error: "Method not allowed" });
}