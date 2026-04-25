global.notes = global.notes || [];

export default function handler(req, res) {

  // ✅ ADD THIS (CORS FIX)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ success: true, data: global.notes });
  }

  if (req.method === "POST") {
    const { title, content } = req.body;

    const note = {
      id: Date.now(),
      title,
      content
    };

    global.notes.push(note);

    return res.status(200).json({ success: true, data: note });
  }

  res.status(405).json({ success: false });
}