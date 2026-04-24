import React from "react";

export default function EnhanceModal({ original, enhanced, onAccept, onDiscard }) {
  return (
    <div className="editor-overlay">
      <div className="editor-modal enhance-modal">
        <div className="editor-header">
          <h2>✨ AI Enhancement</h2>
          <button className="btn-close" onClick={onDiscard}>✕</button>
        </div>
        <div className="enhance-body">
          <div className="enhance-col">
            <h4>Original</h4>
            <div className="enhance-text original">{original}</div>
          </div>
          <div className="enhance-divider">→</div>
          <div className="enhance-col">
            <h4>Enhanced</h4>
            <div className="enhance-text enhanced">{enhanced}</div>
          </div>
        </div>
        <div className="editor-footer">
          <button className="btn-secondary" onClick={onDiscard}>Keep Original</button>
          <button className="btn-primary" onClick={onAccept}>Use Enhanced ✨</button>
        </div>
      </div>
    </div>
  );
}