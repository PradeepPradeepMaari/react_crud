import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createEmployee } from '../api/employeeService';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleSubmit = async (formData) => {
    setLoading(true);
    setErrors({});
    try {
      await createEmployee(formData);
      toast.success('Employee created successfully!');
      navigate('/');
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
        toast.error('Please fix the validation errors.');
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Add Employee
          <small>Fill in the details below to register a new employee</small>
        </h1>
      </div>
      <div className="card">
        <EmployeeForm
          errors={errors}
          loading={loading}
          onSubmit={handleSubmit}
          submitLabel="Create Employee"
        />
      </div>
    </div>
  );
}
