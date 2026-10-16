import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployees, deleteEmployee } from '../api/employeeService';
import ConfirmDialog from '../components/ConfirmDialog';

const QUALIFICATIONS = ['', "High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "Other"];
const PER_PAGE_OPTIONS = [10, 15, 25, 50];

function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <span className="sort-icon"><ArrowUpDown size={14} /></span>;
  return <span className="sort-icon">{sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>;
}

function Avatar({ employee }) {
  const initials = `${employee.firstname?.[0] || ''}${employee.lastname?.[0] || ''}`.toUpperCase();
  const Placeholder = () => <div className="emp-avatar-placeholder">{initials}</div>;

  if (employee.photo_url) {
    return (
      <img
        src={employee.photo_url}
        alt={employee.full_name}
        className="emp-avatar"
        onError={(e) => {
          e.currentTarget.replaceWith(
            Object.assign(document.createElement('div'), {
              className: 'emp-avatar-placeholder',
              textContent: initials,
            })
          );
        }}
      />
    );
  }
  return <Placeholder />;
}

export default function EmployeeList() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [meta,      setMeta]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [search,        setSearch]        = useState('');
  const [qualification, setQualification] = useState('');
  const [sortBy,        setSortBy]        = useState('created_at');
  const [sortDir,       setSortDir]       = useState('desc');
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(15);

  const [toDelete,      setToDelete]      = useState(null);
  const [deleting,      setDeleting]      = useState(false);

  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees({
        search:        debouncedSearch || undefined,
        qualification: qualification   || undefined,
        sort_by:       sortBy,
        sort_dir:      sortDir,
        per_page:      perPage,
        page,
      });
      setEmployees(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError('Failed to load employees. Is the Laravel server running?');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, qualification, sortBy, sortDir, perPage, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => { setPage(1); }, [qualification, perPage]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(toDelete.id);
      toast.success(`${toDelete.full_name} deleted.`);
      setToDelete(null);
      fetchEmployees();
    } catch {
      toast.error('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };


  const cols = [
    { key: 'firstname',   label: 'Name'        },
    { key: 'email',       label: 'Email'       },
    { key: 'phone',       label: 'Phone'       },
    { key: 'education_qualification', label: 'Education' },
    { key: 'date_of_birth',           label: 'D.O.B'    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Employees
          <small>{meta ? `${meta.total} total` : ''}</small>
        </h1>
        <Link to="/employees/create" className="btn btn-primary"><i className="bi bi-plus-lg"></i> Add Employee</Link>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon"><i className="bi bi-search"></i></span>
          
          <input
            className="search-input"
            type="text"
            placeholder="Search name, email, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', height: '38px' }}
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          id="qualification-filter"
        >
          {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q || 'All Qualifications'}</option>)}
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', height: '38px' }}
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          id="per-page-select"
        >
          {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {error ? (
          <div className="state-error">{error}</div>
        ) : loading ? (
          <div className="state-loading"><div className="spinner" /><p>Loading employees…</p></div>
        ) : employees.length === 0 ? (
          <div className="state-empty">
            <div className="state-empty-icon"><i className="bi bi-person-x"></i></div>
            <p>No employees found.</p>
            {(search || qualification) && (
              <button className="btn btn-ghost" style={{ marginTop: '.75rem' }} onClick={() => { setSearch(''); setQualification(''); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 100 }} />
                  {cols.map((c) => (
                    <th key={c.key} className={sortBy === c.key ? 'sorted' : ''} onClick={() => handleSort(c.key)}>
                      {c.label} <SortIcon field={c.key} sortBy={sortBy} sortDir={sortDir} />
                    </th>
                  ))}
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}><Avatar employee={emp} /></td>
                    <td>
                      <div className="emp-name-cell">
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.full_name}</div>
                          <div className="td-id">{emp.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td><span className="badge">{emp.education_qualification}</span></td>
                    <td>{emp.date_of_birth}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => navigate(`/employees/${emp.id}`)}><i className="bi bi-eye"></i></button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => navigate(`/employees/${emp.id}/edit`)}><i className="bi bi-pencil-square"></i></button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Delete" style={{ color: 'var(--danger-h)' }} onClick={() => setToDelete(emp)}><i className="bi bi-trash3"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {meta.from}–{meta.to} of {meta.total}
          </span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(1)} title="First">«</button>
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} title="Previous">‹</button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`ellipsis-${p}`} style={{ color: 'var(--text-3)', padding: '0 .25rem' }}>…</span>}
                  <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                </>
              ))}
            <button className="page-btn" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} title="Next">›</button>
            <button className="page-btn" disabled={page >= meta.last_page} onClick={() => setPage(meta.last_page)} title="Last">»</button>
          </div>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to permanently delete ${toDelete.full_name}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
