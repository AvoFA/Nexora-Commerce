export const getAdminToken = () => localStorage.getItem('adminToken') || '';

export const getUserToken = () => localStorage.getItem('token') || '';

export const getAnyAuthToken = () => getAdminToken() || getUserToken();
