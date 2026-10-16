import { useState, useEffect } from 'react';

const QUALIFICATIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];


export default function EmployeeForm({ initialData = {}, errors = {}, loading, onSubmit, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    employee_id:             initialData.employee_id             || '',
    firstname:               initialData.firstname               || '',
    lastname:                initialData.lastname                || '',
    date_of_birth:           initialData.date_of_birth           || '',
    education_qualification: initialData.education_qualification || '',
    address:                 initialData.address                 || '',
    email:                   initialData.email                   || '',
    phone:                   initialData.phone                   || '',
  });
  const [photoFile,  setPhotoFile]  = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData.photo_url || null);

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photoFile]);

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photoFile)  fd.append('photo',  photoFile);
    if (resumeFile) fd.append('resume', resumeFile);
    onSubmit(fd);
  };

  const field = (name) => ({
    name,
    id: name,
    value: form[name],
    onChange: change,
    className: `form-input${errors[name] ? ' error' : ''}`,
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">

        <div className="form-group">
          <label className="form-label" htmlFor="employee_id">Employee ID <span className="req">*</span></label>
          <input {...field('employee_id')} type="text" placeholder="e.g. EMP-001" autoComplete="off" />
          {errors.employee_id && <span className="field-error">{errors.employee_id[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="firstname">First Name <span className="req">*</span></label>
          <input {...field('firstname')} type="text" placeholder="John" />
          {errors.firstname && <span className="field-error">{errors.firstname[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lastname">Last Name <span className="req">*</span></label>
          <input {...field('lastname')} type="text" placeholder="Doe" />
          {errors.lastname && <span className="field-error">{errors.lastname[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date_of_birth">Date of Birth <span className="req">*</span></label>
          <input {...field('date_of_birth')} type="date" className={`form-input${errors.date_of_birth ? ' error' : ''}`} />
          {errors.date_of_birth && <span className="field-error">{errors.date_of_birth[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email <span className="req">*</span></label>
          <input {...field('email')} type="email" placeholder="john@example.com" />
          {errors.email && <span className="field-error">{errors.email[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone <span className="req">*</span></label>
          <input {...field('phone')} type="tel" placeholder="+94771234567" />
          {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="education_qualification">Education <span className="req">*</span></label>
          <select
            name="education_qualification"
            id="education_qualification"
            value={form.education_qualification}
            onChange={change}
            className={`form-select${errors.education_qualification ? ' error' : ''}`}
          >
            <option value="">Select qualification…</option>
            {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
          {errors.education_qualification && <span className="field-error">{errors.education_qualification[0]}</span>}
        </div>

        <div className="form-group full-width">
          <label className="form-label" htmlFor="address">Address <span className="req">*</span></label>
          <textarea {...field('address')} className={`form-textarea${errors.address ? ' error' : ''}`} placeholder="123 Main Street, Madurai-625009" rows={3} />
          {errors.address && <span className="field-error">{errors.address[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Photo <span style={{color:'var(--text-3)',fontWeight:400}}>(JPG/PNG/WebP, max 2 MB)</span></label>
          <div className="file-input-wrap">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              id="photo"
              onChange={(e) => setPhotoFile(e.target.files[0] || null)}
            />
            <div className="file-input-label">
              <i className="bi bi-camera"></i> {photoFile ? photoFile.name : 'Choose photo…'}
            </div>
          </div>
          {photoPreview && (
            <div className="file-preview">
              <img src={photoPreview} alt="Preview" />
              <span style={{fontSize:'.8rem',color:'var(--text-2)'}}>Preview</span>
            </div>
          )}
          {errors.photo && <span className="field-error">{errors.photo[0]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Resume <span style={{color:'var(--text-3)',fontWeight:400}}>(PDF/DOC/DOCX, max 5 MB)</span></label>
          <div className="file-input-wrap">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="resume"
              onChange={(e) => setResumeFile(e.target.files[0] || null)}
            />
            <div className="file-input-label">
              <i className="bi bi-file-earmark"></i> {resumeFile ? resumeFile.name : (initialData.resume ? <><i className="bi bi-paperclip"></i> Replace existing resume</> : 'Choose resume…')}
            </div>
          </div>
          {initialData.resume_url && !resumeFile && (
            <div className="file-preview">
              <a href={initialData.resume_url} target="_blank" rel="noopener noreferrer" className="resume-link">
                <i className="bi bi-paperclip"></i> View current resume
              </a>
            </div>
          )}
          {errors.resume && <span className="field-error">{errors.resume[0]}</span>}
        </div>

      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
