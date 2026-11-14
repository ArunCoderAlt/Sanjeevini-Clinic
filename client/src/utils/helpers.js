export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

/**
 * Resolves an image URL:
 * - If already a full URL (Supabase CDN, external URL, data/blob URL), returns as-is.
 * - If a relative /uploads/... path, prepends the backend host URL.
 */
export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  // Supabase CDN, full HTTP/HTTPS URL, or data/blob URI
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Normalize path if missing leading slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  // If stored as local backend uploads
  if (cleanPath.startsWith('/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
      const backendBase = apiUrl.replace(/\/api\/?$/, '');
      return `${backendBase}${cleanPath}`;
    }
    return cleanPath;
  }

  return url;
};

export const DEFAULT_WHATSAPP_MESSAGE = 'Hello Sanjeevini Siddha & Ayurveda Medical Centre, I would like to inquire about consultation and treatments.';

export const generateWhatsAppLink = (phone = '919486838368', message = DEFAULT_WHATSAPP_MESSAGE) => {
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const encodedText = message ? encodeURIComponent(message) : '';
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
};

export const getWhatsAppUrl = generateWhatsAppLink;

export const handleWhatsAppClick = (e, phone = '919486838368', message = DEFAULT_WHATSAPP_MESSAGE) => {
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const encodedText = message ? encodeURIComponent(message) : '';
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  
  if (isMobile) {
    if (e && e.preventDefault) e.preventDefault();
    // Directly invoke native WhatsApp application scheme
    window.location.href = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
    // Fallback if app is not installed
    setTimeout(() => {
      window.location.href = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
    }, 700);
  }
};
