// config/socket.config.js
const SOCKET_CONFIG = {
    // Socket Server URL
    SOCKET_URL: 'https://backend-express-voip-production.up.railway.app/',

    // Socket Options
    SOCKET_OPTIONS: {
        forceNew: true,
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    },

    // WebRTC Configuration
    WEBRTC_CONFIG: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:80?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all'
    },

    // Media Constraints
    MEDIA_CONSTRAINTS: {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
        video: false
    },

    // Chat Configuration
    CHAT_CONFIG: {
        maxMessageLength: 500,
        typingTimeout: 1000,
    },

    // Call Configuration  
    CALL_CONFIG: {
        callTimeout: 30000,
        maxCallDuration: 3600000,
    }
};

// Environment Configuration
const config = {
    ...SOCKET_CONFIG,
    DEBUG: true,
    LOGGING_ENABLED: true
};

// Logger utility
const createLogger = (enabled) => ({
    log: enabled ? console.log : () => { },
    error: console.error,
    warn: enabled ? console.warn : () => { },
});

export { createLogger };
export default config;