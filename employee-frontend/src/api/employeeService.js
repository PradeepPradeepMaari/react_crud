import api from './axios';

const BASE = '/employees';


export const getEmployees = (params = {}) =>
  api.get(BASE, { params }).then((r) => r.data);


export const getEmployee = (id) =>
  api.get(`${BASE}/${id}`).then((r) => r.data);


export const createEmployee = (formData) =>
  api.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);


export const updateEmployee = (id, formData) => {
  formData.append('_method', 'PUT');
  return api.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};


export const deleteEmployee = (id) =>
  api.delete(`${BASE}/${id}`).then((r) => r.data);


export const exportEmployees = (params = {}) =>
  api.get(`${BASE}/export`, {
    params,
    responseType: 'blob',
  });


export const importEmployees = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`${BASE}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  }).then((r) => r.data);
};


export const downloadImportTemplate = () =>
  api.get(`${BASE}/import-template`, { responseType: 'blob' });
