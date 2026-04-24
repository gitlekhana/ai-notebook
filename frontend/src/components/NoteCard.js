import React, { useState } from "react";

export default function NoteCard({ note, onEdit, onDelete, onEnhance, selected, onToggleSelect }) {
  const [confirming, setConfirming] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const handleDelete = () => {
    if (confirming) { onDelete(note.id); }
    else { setConfirming(true); setTimeout(() => setConfirming(false), 3000); }
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try { await onEnhance(note.id); }
    finally { setEnhancing(false); }
  };

  const date = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className={`note-card ${selected ? "selected" : ""}`}>
      <div className="note-card-header">
        <label className="note-select">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(note.id)} />
          <span className="checkmark" />
        </label>
        <div className="note-meta">
          <h3 className="note-title">{note.title}</h3>
          <span className="note-date">{date}</span>
        </div>
      </div>

      <p className="note-content">{note.content}</p>

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
        </div>
      )}

      <div className="note-actions">
        <button className="btn-icon btn-edit" onClick={() => onEdit(note)} title="Edit">
          ✏️
        </button>
        <button className="btn-icon btn-enhance" onClick={handleEnhance} disabled={enhancing} title="AI Enhance">
          {enhancing ? "⏳" : "✨"}
        </button>
        <button className={`btn-icon btn-delete ${confirming ? "confirming" : ""}`} onClick={handleDelete} title={confirming ? "Click again to confirm" : "Delete"}>
          {confirming ? "⚠️" : "🗑️"}
        </button>
      </div>
    </div>
  );
}