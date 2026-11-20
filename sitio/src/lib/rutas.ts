export const urlExp = (id: string) => (id === 'consultas' ? '/consultas/' : `/experiencias/${id}/`);
export const urlProd = (id: string) => `/productos/${id}/`;
export const urlEnc = (id: string) => `/agenda/${id}/`;
export const urlArt = (id: string) => `/bitacora/${id}/`;
