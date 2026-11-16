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
 * Resolves and optimizes an image URL:
 * - If ImageKit URL, injects optimal parameters (?tr=q-80,f-auto) reducing payload by ~70%
 * - If Supabase CDN, external URL, data/blob URL, returns clean URL.
 * - If a relative /uploads/... path, prepends the backend host URL.
 */
export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim().replace(/\\/g, '/');
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[object Object]') {
    return null;
  }

  // Prepend domain if stored as an ImageKit endpoint path e.g. /npodwfrx7/...
  let resolvedUrl = trimmed;
  if (/^\/?npodwfrx7\//i.test(resolvedUrl)) {
    resolvedUrl = `https://ik.imagekit.io/${resolvedUrl.replace(/^\//, '')}`;
  }

  // Auto-optimize ImageKit CDN assets (auto WebP/AVIF format + 80% lossless compression)
  if (resolvedUrl.includes('ik.imagekit.io') || resolvedUrl.includes('imagekit.io')) {
    if (!resolvedUrl.includes('tr=') && !resolvedUrl.includes('tr:')) {
      const sep = resolvedUrl.includes('?') ? '&' : '?';
      return `${resolvedUrl}${sep}tr=q-80,f-auto`;
    }
    return resolvedUrl;
  }

  // Supabase CDN, full HTTP/HTTPS URL, or data/blob URI
  if (
    resolvedUrl.startsWith('http://') ||
    resolvedUrl.startsWith('https://') ||
    resolvedUrl.startsWith('data:') ||
    resolvedUrl.startsWith('blob:')
  ) {
    return resolvedUrl;
  }

  // Normalize path if missing leading slash
  const cleanPath = resolvedUrl.startsWith('/') ? resolvedUrl : `/${resolvedUrl}`;

  // If stored as local backend uploads
  if (cleanPath.startsWith('/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
      const backendBase = apiUrl.replace(/\/api\/?$/, '');
      return `${backendBase}${cleanPath}`;
    }
    return cleanPath;
  }

  return resolvedUrl;
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

/**
 * Checks whether an image string is valid and not a placeholder/null representation
 */
export const isValidImage = (img) => {
  if (!img || typeof img !== 'string') return false;
  const lower = img.trim().toLowerCase();
  return Boolean(
    lower &&
    lower !== 'null' &&
    lower !== 'undefined' &&
    lower !== '[object object]' &&
    !lower.includes('placeholder')
  );
};

export const defaultServiceImages = {
  varmam: '/images/hero/slide-4.png',
  'varmam-therapy': '/images/hero/slide-4.png',
  thokkanam: '/images/hero/slide-3.png',
  'thokkanam-therapy': '/images/hero/slide-3.png',
  wellness: '/images/hero/slide-1.png',
  'wellness-support': '/images/hero/slide-1.png',
};

/**
 * Resolves a reliable default preview image for any service
 */
export const getDefaultServiceImage = (serviceOrSlug) => {
  if (!serviceOrSlug) return '/images/hero/slide-4.png';
  let str = '';
  if (typeof serviceOrSlug === 'string') {
    str = serviceOrSlug.toLowerCase().trim();
  } else if (typeof serviceOrSlug === 'object') {
    str = `${serviceOrSlug.slug || ''} ${serviceOrSlug.id || ''} ${serviceOrSlug.title || ''}`.toLowerCase();
  }
  if (str.includes('varmam')) return '/images/hero/slide-4.png';
  if (str.includes('thokkanam')) return '/images/hero/slide-3.png';
  if (str.includes('wellness') || str.includes('holistic')) return '/images/hero/slide-1.png';
  if (str.includes('consultation')) return '/images/hero/slide-7.png';
  return '/images/hero/slide-2.png';
};

