export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export const formatPhone = (phone) => phone;
export const formatTime = (time) => time;
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
export const slugify = (text) => text.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
