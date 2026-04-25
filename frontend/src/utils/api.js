const BASE_URL = process.env.REACT_APP_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

export const getNotes = () => request("/api/notes");
export const createNote = (note) => request("/api/notes", { method: "POST", body: JSON.stringify(note) });
export const updateNote = (id, note) => request(`/api/notes/${id}`, { method: "PUT", body: JSON.stringify(note) });
export const deleteNote = (id) => request(`/api/notes/${id}`, { method: "DELETE" });

export const askQuestion = (question, notesText) =>
  request("/api/ask", { method: "POST", body: JSON.stringify({ question, notes: notesText }) });

export const summarizeNotes = (notesText) =>
  request("/api/summarize", { method: "POST", body: JSON.stringify({ notes: notesText }) });

export const enhanceNote = (noteId) =>
  request("/api/enhance", { method: "POST", body: JSON.stringify({ noteId }) });