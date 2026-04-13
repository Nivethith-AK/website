const LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const VERCEL_PREVIEW_REGEX = /^https:\/\/.*\.vercel\.app$/i;

const parseConfiguredOrigins = () => {
  const configured = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(configured)];
};

export const getAllowedOrigins = () => {
  const configured = parseConfiguredOrigins();

  if (process.env.NODE_ENV === 'production') {
    return [...configured, VERCEL_PREVIEW_REGEX];
  }

  return [...LOCAL_ORIGINS, ...configured, VERCEL_PREVIEW_REGEX];
};

export const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && LOCAL_ORIGINS.includes(origin)) {
    return true;
  }

  if (VERCEL_PREVIEW_REGEX.test(origin)) {
    return true;
  }

  return parseConfiguredOrigins().includes(origin);
};
