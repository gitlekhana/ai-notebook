import React, { useState } from "react";
import { askQuestion, summarizeNotes } from "../utils/api";

export default function AIPanel({ notes, selectedIds }) {
  const [tab, setTab] = useState("ask");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useSelected, setUseSelected] = useState(false);

  const targetNotes =
    useSelected && selectedIds.length > 0
      ? notes.filter((n) => selectedIds.includes(n.id))
      : notes;
  const targetCount = targetNotes.length;
  const notesText = targetNotes.map((n) => `${n.title}\n${n.content}`).join("\n---\n");

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || notes.length === 0) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await askQuestion(question.trim(), notesText);
      setResult({ type: "answer", content: data.answer, used: data.notesUsed });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (notes.length === 0) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await summarizeNotes(notesText);
      setResult({ type: "summary", content: data.summary, used: data.notesUsed });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-orb" />
          <h2>AI Assistant</h2>
        </div>
        {notes.length > 0 && (
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useSelected && selectedIds.length > 0}
              disabled={selectedIds.length === 0}
              onChange={(e) => setUseSelected(e.target.checked)}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span className="toggle-text">Selected only ({selectedIds.length})</span>
          </label>
        )}
      </div>

      <div className="ai-tabs">
        <button className={`ai-tab ${tab === "ask" ? "active" : ""}`}
          onClick={() => { setTab("ask"); setResult(null); setError(""); }}>
          💬 Ask
        </button>
        <button className={`ai-tab ${tab === "summarize" ? "active" : ""}`}
          onClick={() => { setTab("summarize"); setResult(null); setError(""); }}>
          📝 Summarize
        </button>
      </div>

      <div className="ai-body">
        {tab === "ask" && (
          <form onSubmit={handleAsk} className="ask-form">
            <p className="ai-hint">Ask anything about your <strong>{targetCount}</strong> note{targetCount !== 1 ? "s" : ""}.</p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are the key points from my notes?"
              rows={4}
              disabled={loading}
            />
            <button type="submit" className="btn-ai" disabled={loading || !question.trim() || notes.length === 0}>
              {loading ? <><span className="dot" /><span className="dot" /><span className="dot" /></> : "Ask AI →"}
            </button>
          </form>
        )}

        {tab === "summarize" && (
          <div className="summarize-form">
            <p className="ai-hint">Generate a summary of <strong>{targetCount}</strong> note{targetCount !== 1 ? "s" : ""}.</p>
            <button className="btn-ai" onClick={handleSummarize} disabled={loading || notes.length === 0}>
              {loading ? <><span className="dot" /><span className="dot" /><span className="dot" /></> : "Generate Summary →"}
            </button>
          </div>
        )}

        {error && <div className="ai-error">⚠️ {error}</div>}

        {result && (
          <div className={`ai-result ${result.type}`}>
            <div className="ai-result-header">
              <span>{result.type === "answer" ? "💬 Answer" : "📝 Summary"}</span>
              <span className="notes-used">{result.used} note{result.used !== 1 ? "s" : ""} used</span>
            </div>
            <div className="ai-result-content">
              {result.content.split("\n").filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <button className="btn-copy" onClick={() => navigator.clipboard.writeText(result.content)}>Copy</button>
          </div>
        )}

        {notes.length === 0 && (
          <div className="ai-empty">
            <div className="ai-empty-icon">◈</div>
            <p>Create some notes first to use AI features.</p>
          </div>
        )}
      </div>
    </div>
  );
}