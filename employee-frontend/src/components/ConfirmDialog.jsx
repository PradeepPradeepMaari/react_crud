import { useState } from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-icon"><i className="bi bi-exclamation-triangle"></i></div>
        <h2 className="dialog-title">{title}</h2>
        <p className="dialog-msg">{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
