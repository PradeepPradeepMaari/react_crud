import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployee, updateEmployee } from '../api/employeeService';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeeEdit() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors,   setErrors]   = useState({});
  const [fetchErr, setFetchErr] = useState(null);

  useEffect(() => {
    getEmployee(id)
      .then((data) => setEmployee(data.data))
      .catch(() => setFetchErr('Employee not found.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setErrors({});
    try {
      await updateEmployee(id, formData);
      toast.success('Employee updated successfully!');
      navigate(`/employees/${id}`);
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
        toast.error('Please fix the validation errors.');
      } else {
        toast.error(err.response?.data?.message || 'Update failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="state-loading"><div className="spinner" /><p>Loading…</p></div>;
  if (fetchErr) return <div className="state-error">{fetchErr}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Edit Employee
          <small>{employee.full_name} — {employee.employee_id}</small>
        </h1>
      </div>
      <div className="card">
        <EmployeeForm
          initialData={employee}
          errors={errors}
          loading={loading}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
