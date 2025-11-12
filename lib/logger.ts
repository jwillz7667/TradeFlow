type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = { level, message, meta, timestamp: new Date().toISOString() };
  if (process.env.NODE_ENV === 'production') {
    // placeholder for Axiom ingestion
    console.log(JSON.stringify(payload));
  } else {
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : level](payload);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta)
};
