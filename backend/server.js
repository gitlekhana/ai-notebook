require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ─── In-Memory Store (replace with DB in production) ─────────────────────────
let notes = [];

// ─── OpenRouter Helper ────────────────────────────────────────────────────────
async function callOpenRouter(messages, systemPrompt = "") {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

  const body = {
    model: "openai/gpt-4o-mini",
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages,
    ],
    max_tokens: 1024,
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
      "X-Title": "AI Notebook",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

// ─── Notes Routes ─────────────────────────────────────────────────────────────

// GET /api/notes — list all notes
app.get("/api/notes", (req, res) => {
  res.json({ success: true, data: notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

// POST /api/notes — create a note
app.post("/api/notes", (req, res) => {
  const { title, content, tags } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ success: false, error: "Title and content are required." });
  }
  const note = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.push(note);
  res.status(201).json({ success: true, data: note });
});

// PUT /api/notes/:id — update a note
app.put("/api/notes/:id", (req, res) => {
  const idx = notes.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Note not found." });

  const { title, content, tags } = req.body;
  notes[idx] = {
    ...notes[idx],
    ...(title !== undefined && { title: title.trim() }),
    ...(content !== undefined && { content: content.trim() }),
    ...(tags !== undefined && { tags: tags.map((t) => t.trim()).filter(Boolean) }),
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: notes[idx] });
});

// DELETE /api/notes/:id — delete a note
app.delete("/api/notes/:id", (req, res) => {
  const before = notes.length;
  notes = notes.filter((n) => n.id !== req.params.id);
  if (notes.length === before) return res.status(404).json({ success: false, error: "Note not found." });
  res.json({ success: true, message: "Note deleted." });
});

// ─── AI Routes ────────────────────────────────────────────────────────────────

// POST /api/ai/ask — ask a question about notes
app.post("/api/ai/ask", async (req, res) => {
  const { question, noteIds } = req.body;
  if (!question?.trim()) return res.status(400).json({ success: false, error: "Question is required." });

  const selectedNotes = noteIds?.length
    ? notes.filter((n) => noteIds.includes(n.id))
    : notes;

  if (!selectedNotes.length) {
    return res.status(400).json({ success: false, error: "No notes available to answer the question." });
  }

  const notesContext = selectedNotes
    .map((n, i) => `Note ${i + 1} — "${n.title}":\n${n.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are an intelligent assistant helping a user understand their personal notes.
Answer questions accurately and concisely based ONLY on the notes provided.
If the answer is not in the notes, say so clearly.
Be helpful, specific, and cite which note(s) your answer comes from.`;

  try {
    const answer = await callOpenRouter(
      [{ role: "user", content: `Here are my notes:\n\n${notesContext}\n\n---\n\nQuestion: ${question.trim()}` }],
      systemPrompt
    );
    res.json({ success: true, data: { answer, notesUsed: selectedNotes.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/summarize — summarize selected or all notes
app.post("/api/ai/summarize", async (req, res) => {
  const { noteIds } = req.body;

  const selectedNotes = noteIds?.length
    ? notes.filter((n) => noteIds.includes(n.id))
    : notes;

  if (!selectedNotes.length) {
    return res.status(400).json({ success: false, error: "No notes available to summarize." });
  }

  const notesContext = selectedNotes
    .map((n, i) => `Note ${i + 1} — "${n.title}":\n${n.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are an expert at synthesizing and summarizing information.
Create a clear, structured summary of the provided notes.
- Start with a 1-2 sentence overview
- Highlight key themes and important points
- Use bullet points for clarity
- Keep the summary concise but comprehensive`;

  try {
    const summary = await callOpenRouter(
      [{ role: "user", content: `Please summarize these ${selectedNotes.length} note(s):\n\n${notesContext}` }],
      systemPrompt
    );
    res.json({ success: true, data: { summary, notesUsed: selectedNotes.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/enhance — improve a single note
app.post("/api/ai/enhance", async (req, res) => {
  const { noteId } = req.body;
  const note = notes.find((n) => n.id === noteId);
  if (!note) return res.status(404).json({ success: false, error: "Note not found." });

  const systemPrompt = `You are a writing assistant. Improve the given note by:
- Fixing grammar and clarity
- Organizing ideas logically
- Expanding thin points with helpful context
- Keeping the original meaning and tone intact
Return ONLY the improved note content, nothing else.`;

  try {
    const enhanced = await callOpenRouter(
      [{ role: "user", content: `Enhance this note titled "${note.title}":\n\n${note.content}` }],
      systemPrompt
    );
    res.json({ success: true, data: { enhanced, noteId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AI Notebook API is running 🟢", notesCount: notes.length });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));