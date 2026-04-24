import { useState, useEffect, useCallback } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../utils/api";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = useCallback(async (note) => {
    const created = await createNote(note);
    setNotes((prev) => [created, ...prev]);
    return created;
  }, []);

  const editNote = useCallback(async (id, updates) => {
    const updated = await updateNote(id, updates);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const removeNote = useCallback(async (id) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, addNote, editNote, removeNote, refetch: fetchNotes };
}