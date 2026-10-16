import { useState, useRef, useCallback } from 'react';
import { importEmployees } from '../api/employeeService';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];
const ACCEPTED_EXT = ['.xlsx', '.xls', '.csv'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ImportModal({ onClose, onSuccess }) {
  const [file,        setFile]        = useState(null);
  const [fileError,   setFileError]   = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [confirmed,   setConfirmed]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [serverError, setServerError] = useState('');

  const fileInputRef = useRef(null);

  const validateFile = (f) => {
    if (!f) return 'Please select a file.';
    const extOk  = ACCEPTED_EXT.some((e) => f.name.toLowerCase().endsWith(e));
    const typeOk = ACCEPTED_TYPES.includes(f.type) || f.type === '';
    if (!extOk || !typeOk) return 'Only .xlsx, .xls, and .csv files are accepted.';
    if (f.size > MAX_SIZE_BYTES) return `File is too large. Maximum size is 5 MB (selected: ${(f.size / 1024 / 1024).toFixed(1)} MB).`;
    return '';
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileError(f ? validateFile(f) : '');
    setConfirmed(false);
    setResult(null);
    setServerError('');
    setUploadPct(0);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    if (!f) return;
    setFile(f);
    setFileError(validateFile(f));
    setConfirmed(false);
    setResult(null);
    setServerError('');
    setUploadPct(0);
  }, []);

  const handleImport = async () => {
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    if (!confirmed) { setFileError('Please confirm before importing.'); return; }

    setUploading(true);
    setServerError('');
    setResult(null);
    setUploadPct(0);

    try {
      const data = await importEmployees(file, (e) => {
        if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100));
      });
      setResult(data.data);
      if (data.success) onSuccess?.();
    } catch (err) {
      const body = err?.response?.data;
      if (body?.data) {
        setResult(body.data);
        setServerError(body.message || 'Import failed.');
      } else if (err?.validationErrors?.file) {
        setFileError(err.validationErrors.file[0]);
      } else {
        setServerError(body?.message || err.message || 'An unexpected error occurred.');
      }
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  };

  const isDone    = result !== null;
  const canSubmit = file && !fileError && confirmed && !uploading && !isDone;

  return (
    <div className="dialog-overlay" onClick={!uploading ? onClose : undefined}>
      <div className="dialog-box import-modal" onClick={(e) => e.stopPropagation()}>

        <div className="import-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: '1.4rem', color: 'var(--accent-h)' }} />
            <h2 className="dialog-title" style={{ margin: 0 }}>Import Employees</h2>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} disabled={uploading} title="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {!isDone ? (
          <>
            <div
              className={`import-dropzone${file && !fileError ? ' has-file' : ''}${fileError ? ' has-error' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                id="import-file-input"
              />
              {file ? (
                <div className="import-file-info">
                  <i className="bi bi-file-earmark-excel" style={{ fontSize: '2rem', color: 'var(--success)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              ) : (
                <div className="import-file-info">
                  <i className="bi bi-cloud-upload" style={{ fontSize: '2rem', color: 'var(--text-3)' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Click or drag & drop to select file</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>.xlsx, .xls, .csv — max 5 MB</div>
                  </div>
                </div>
              )}
            </div>

            {fileError && <p className="field-error" style={{ marginTop: '.5rem' }}>{fileError}</p>}

            {uploading && (
              <div className="import-progress-wrap">
                <div className="import-progress-bar" style={{ width: `${uploadPct}%` }} />
                <span className="import-progress-label">{uploadPct}%</span>
              </div>
            )}

            {file && !fileError && (
              <label className="import-confirm-check" htmlFor="import-confirm-checkbox">
                <input
                  id="import-confirm-checkbox"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={uploading}
                />
                <span>I confirm I want to import this file. Valid rows will be added to the database.</span>
              </label>
            )}

            {serverError && (
              <div className="alert alert-error" style={{ marginTop: '.75rem' }}>{serverError}</div>
            )}

            <div className="dialog-actions" style={{ marginTop: '1.25rem' }}>
              <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={!canSubmit}
                id="import-submit-btn"
              >
                {uploading
                  ? <><span className="spinner-sm" /> Importing…</>
                  : <><i className="bi bi-upload" /> Import</>}
              </button>
            </div>
          </>
        ) : (
          <ImportResult result={result} serverError={serverError} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function ImportResult({ result, serverError, onClose }) {
  return (
    <div className="import-result">
      <div className="import-summary-cards">
        <div className="summary-card summary-total">
          <div className="summary-num">{result.total_rows}</div>
          <div className="summary-label">Total Rows</div>
        </div>
        <div className="summary-card summary-imported">
          <div className="summary-num">{result.imported}</div>
          <div className="summary-label">Imported</div>
        </div>
        <div className="summary-card summary-skipped">
          <div className="summary-num">{result.skipped}</div>
          <div className="summary-label">Skipped</div>
        </div>
      </div>

      {serverError && (
        <div className="alert alert-error" style={{ marginTop: '.75rem' }}>{serverError}</div>
      )}

      {result.imported > 0 && (
        <p className="import-ok-msg">
          <i className="bi bi-check-circle-fill" style={{ color: 'var(--success)' }} />
          {' '}{result.imported} employee{result.imported !== 1 ? 's' : ''} imported successfully.
        </p>
      )}

      {result.errors && result.errors.length > 0 && (
        <div className="import-errors-wrap">
          <p style={{ fontWeight: 600, marginBottom: '.5rem', color: 'var(--danger-h)' }}>
            <i className="bi bi-exclamation-triangle-fill" /> Row errors ({result.errors.length})
          </p>
          <div className="import-errors-list">
            {result.errors.map((e, i) => (
              <div key={i} className="import-error-row">
                <span className="import-error-row-num">Row {e.row}</span>
                <ul>
                  {(Array.isArray(e.errors) ? e.errors : [e.errors]).map((msg, j) => (
                    <li key={j}>{msg}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dialog-actions" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-primary" onClick={onClose}>
          <i className="bi bi-check2" /> Done
        </button>
      </div>
    </div>
  );
}
