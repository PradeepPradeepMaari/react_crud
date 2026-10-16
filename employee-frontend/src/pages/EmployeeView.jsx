import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployee, deleteEmployee } from '../api/employeeService';
import ConfirmDialog from '../components/ConfirmDialog';

function Field({ label, value, children }) {
  return (
    <div className="detail-field">
      <label>{label}</label>
      {children || <p>{value || '—'}</p>}
    </div>
  );
}

export default function EmployeeView() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [employee, setEmployee]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [showDel,  setShowDel]    = useState(false);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    getEmployee(id)
      .then((data) => setEmployee(data.data))
      .catch(() => setError('Employee not found or server error.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted.');
      navigate('/');
    } catch {
      toast.error('Delete failed.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="state-loading"><div className="spinner" /><p>Loading…</p></div>;
  if (error)   return <div className="state-error">{error} <Link to="/">← Back to list</Link></div>;

  const initials = `${employee.firstname?.[0] || ''}${employee.lastname?.[0] || ''}`.toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employee Profile</h1>
        <Link to="/" className="btn btn-ghost"><i className="bi bi-arrow-left"></i> Back to List</Link>
      </div>

      <div className="card">
        <div className="detail-hero">
          {employee.photo_url
            ? <img src={employee.photo_url} alt={employee.full_name} className="detail-photo" />
            : <div className="detail-photo-placeholder">{initials}</div>
          }
          <div>
            <h2 className="detail-name">{employee.full_name}</h2>
            <div className="detail-emp-id">{employee.employee_id}</div>
            <div style={{ marginTop: '.5rem' }}><span className="badge">{employee.education_qualification}</span></div>
            <div className="detail-actions">
              <Link to={`/employees/${employee.id}/edit`} className="btn btn-primary btn-sm"><i className="bi bi-pencil-square"></i> Edit</Link>
              <button className="btn btn-danger btn-sm" onClick={() => setShowDel(true)}><i className="bi bi-trash3"></i> Delete</button>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <Field label="Employee ID"  value={employee.employee_id} />
          <Field label="Email"        value={employee.email} />
          <Field label="Phone"        value={employee.phone} />
          <Field label="Date of Birth" value={employee.date_of_birth} />
          <Field label="Education"    value={employee.education_qualification} />
          <Field label="Address">
            <p style={{ whiteSpace: 'pre-wrap' }}>{employee.address}</p>
          </Field>
          <Field label="Resume">
            {employee.resume_url
              ? <a href={employee.resume_url} target="_blank" rel="noopener noreferrer" className="resume-link"><i className="bi bi-paperclip"></i> Download Resume</a>
              : <p>—</p>
            }
          </Field>
          <Field label="Registered" value={new Date(employee.created_at).toLocaleString()} />
        </div>
      </div>

      {showDel && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Permanently delete ${employee.full_name}? All files will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
