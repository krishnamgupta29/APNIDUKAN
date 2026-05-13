import API_URL from './api';

export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
};
