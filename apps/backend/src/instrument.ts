import * as Sentry from '@sentry/node';
import { env, isDev } from './config/env';

if (env.SENTRY_DSN && !isDev) {
    Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.SENTRY_ENVIRONMENT,
        sendDefaultPii: false, // important RGPD
        tracesSampleRate: 0, // perf OFF pour l’instant
    });

    console.log('✅ Sentry initialized');
} else {
    console.log('ℹ️ Sentry disabled (dev or missing DSN)');
}

export { Sentry };
