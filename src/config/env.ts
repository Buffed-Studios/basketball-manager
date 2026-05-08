const apiHost = import.meta.env.VITE_API_HOST as string | undefined;
const jwtSecretKey = import.meta.env.VITE_JWT_SECRET_KEY as string | undefined;

if (!apiHost) {
  throw new Error('VITE_API_HOST is not defined in the environment');
}
if (!jwtSecretKey) {
  throw new Error('VITE_JWT_SECRET_KEY is not defined in the environment');
}

export const env = {
  apiHost,
  jwtSecretKey,
} as const;
