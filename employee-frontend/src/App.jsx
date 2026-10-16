import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EmployeeList   from './pages/EmployeeList';
import EmployeeCreate from './pages/EmployeeCreate';
import EmployeeEdit   from './pages/EmployeeEdit';
import EmployeeView   from './pages/EmployeeView';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="main-nav">
          <div className="nav-brand">
            <i className="bi bi-people-fill"></i> Employee<span>Hub</span>
          </div>
          <div className="nav-links">
            <NavLink to="/" end>Employees</NavLink>
            <NavLink to="/employees/create">Add Employee</NavLink>
          </div>
        </nav>

        <main className="page-content">
          <Routes>
            <Route path="/"                       element={<EmployeeList />} />
            <Route path="/employees/create"       element={<EmployeeCreate />} />
            <Route path="/employees/:id"          element={<EmployeeView />} />
            <Route path="/employees/:id/edit"     element={<EmployeeEdit />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1d2e',
            color: '#f1f5f9',
            border: '1px solid #2e3254',
          },
        }}
      />
    </BrowserRouter>
  );
}
