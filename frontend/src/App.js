import React, { useState } from "react";
import { useNotes } from "./hooks/useNotes";
import { enhanceNote } from "./utils/api";
import NoteCard from "./components/NoteCard";
import NoteEditor from "./components/NoteEditor";
import AIPanel from "./components/AIPanel";
import EnhanceModal from "./components/EnhanceModal";
import "./App.css";

export default function App() {
  const { notes, loading, error, addNote, editNote, removeNote } = useNotes();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [enhanceData, setEnhanceData] = useState(null); // { noteId, original, enhanced }
  const [aiOpen, setAiOpen] = useState(true);

  // ── Note CRUD ──────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    if (editingNote) {
      await editNote(editingNote.id, data);
    } else {
      await addNote(data);
    }
    setEditorOpen(false);
    setEditingNote(null);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleNew = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const selectAll = () => setSelectedIds(filtered.map((n) => n.id));
  const clearSelection = () => setSelectedIds([]);

  // ── Enhance ────────────────────────────────────────────────────────────────
  const handleEnhance = async (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    const data = await enhanceNote(noteId);
    setEnhanceData({ noteId, original: note.content, enhanced: data.enhanced });
  };

  const acceptEnhancement = async () => {
    await editNote(enhanceData.noteId, { content: enhanceData.enhanced });
    setEnhanceData(null);
  };

  // ── Search / Filter ────────────────────────────────────────────────────────
  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q));
  });

  return (
    <div className="app">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">NoteAI</span>
        </div>

        <button className="btn-new-note" onClick={handleNew}>
          <span>+</span> New Note
        </button>

        <nav className="sidebar-nav">
          <button className={`nav-item ${!aiOpen ? "active" : ""}`} onClick={() => setAiOpen(false)}>
            📓 All Notes <span className="nav-count">{notes.length}</span>
          </button>
          <button className={`nav-item ${aiOpen ? "active" : ""}`} onClick={() => setAiOpen(true)}>
            ✦ AI Assistant
          </button>
        </nav>

        <div className="sidebar-footer">
          {selectedIds.length > 0 ? (
            <button className="clear-sel" onClick={clearSelection}>Clear selection ({selectedIds.length})</button>
          ) : (
            <button className="select-all-btn" onClick={selectAll} disabled={filtered.length === 0}>Select all</button>
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="main">
        {!aiOpen ? (
          <>
            <div className="main-header">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
              </div>
              <span className="count-label">{filtered.length} note{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {loading && <div className="state-msg">⏳ Loading notes...</div>}
            {error && <div className="state-msg error">⚠️ {error}</div>}

            {!loading && filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">◈</div>
                <h3>{search ? "No notes match your search" : "No notes yet"}</h3>
                <p>{search ? "Try a different keyword" : "Create your first note to get started"}</p>
                {!search && <button className="btn-primary" onClick={handleNew}>+ Create Note</button>}
              </div>
            )}

            <div className="notes-grid">
              {filtered.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={removeNote}
                  onEnhance={handleEnhance}
                  selected={selectedIds.includes(note.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          </>
        ) : (
          <AIPanel notes={notes} selectedIds={selectedIds} />
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {editorOpen && (
        <NoteEditor
          note={editingNote}
          onSave={handleSave}
          onCancel={() => { setEditorOpen(false); setEditingNote(null); }}
        />
      )}

      {enhanceData && (
        <EnhanceModal
          original={enhanceData.original}
          enhanced={enhanceData.enhanced}
          onAccept={acceptEnhancement}
          onDiscard={() => setEnhanceData(null)}
        />
      )}
    </div>
  );
}