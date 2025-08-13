// utils/socket.utils.js

export const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const validateMessage = (message, maxLength = 500) => {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message is required' };
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
        return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmedMessage.length > maxLength) {
        return { valid: false, error: `Message too long (max ${maxLength} characters)` };
    }

    return { valid: true, message: trimmedMessage };
};

export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const LocalStorageManager = {
    saveChatMessage: (customerId, message) => {
        try {
            const key = `chat_${customerId}`;
            const existingMessages = JSON.parse(localStorage.getItem(key) || '[]');
            const newMessage = {
                ...message,
                id: generateUniqueId(),
                timestamp: message.timestamp || new Date().toISOString()
            };

            existingMessages.push(newMessage);

            if (existingMessages.length > 100) {
                existingMessages.splice(0, existingMessages.length - 100);
            }

            localStorage.setItem(key, JSON.stringify(existingMessages));
            return newMessage;
        } catch (error) {
            console.error('Error saving chat message:', error);
            return message;
        }
    },

    getChatHistory: (customerId) => {
        try {
            const key = `chat_${customerId}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    },

    getCustomerData: (customerId) => {
        // Generate consistent customer data
        const names = ['Joko Santoso', 'Siti Nurhaliza', 'Budi Prasetyo'];
        const phones = ['081234567890', '082345678901', '083456789012'];

        const hash = customerId ? customerId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0) : 0;

        const index = Math.abs(hash) % names.length;

        return {
            id: customerId,
            name: names[index],
            phone: phones[index],
            status: 'online'
        };
    }
};

export const NotificationManager = {
    requestPermission: async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    },

    showNewMessageNotification: (customerName, message) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            return new Notification(`New message from ${customerName}`, {
                body: message.length > 50 ? message.substring(0, 50) + '...' : message,
                icon: '/favicon.ico'
            });
        }
        return null;
    }
};

export const AudioManager = {
    playNotificationSound: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }
};

export const ConnectionManager = {
    getConnectionStatusColor: (state) => {
        switch (state) {
            case 'connected': return '#10b981';
            case 'connecting': return '#f59e0b';
            case 'disconnected': return '#ef4444';
            case 'failed': return '#dc2626';
            default: return '#6b7280';
        }
    },

    getConnectionStatusText: (state) => {
        switch (state) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'disconnected': return 'Disconnected';
            case 'failed': return 'Connection Failed';
            default: return 'Ready';
        }
    }
};