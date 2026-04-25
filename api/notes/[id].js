export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const id = Number(req.params?.id || req.query.id);

  // PUT — update note
  if (req.method === "PUT") {
    const index = global.notes?.findIndex((n) => n.id === id);
    if (index === -1 || index === undefined)
      return res.status(404).json({ success: false, error: "Note not found" });

    global.notes[index] = {
      ...global.notes[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };
    return res.status(200).json({ success: true, data: global.notes[index] });
  }

  // DELETE
  if (req.method === "DELETE") {
    const index = global.notes?.findIndex((n) => n.id === id);
    if (index === -1 || index === undefined)
      return res.status(404).json({ success: false, error: "Note not found" });

    global.notes.splice(index, 1);
    return res.status(200).json({ success: true, data: { id } });
  }

  res.status(405).json({ success: false, error: "Method not allowed" });
}