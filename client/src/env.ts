export const isDev = import.meta.env.DEV
export const hostname = isDev ? 'explorationsystems.local' : window.location.hostname