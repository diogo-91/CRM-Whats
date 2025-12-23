import axios from 'axios';

// Variables will be read at runtime to ensure dotenv is loaded
const getConfig = () => ({
    url: process.env.EVOLUTION_API_URL,
    token: process.env.EVOLUTION_API_TOKEN,
    instance: process.env.EVOLUTION_INSTANCE || 'zapflow_main'
});

export const evolutionService = {
    async sendMessage(number, text) {
        const { url: API_URL, token: API_TOKEN, instance: INSTANCE } = getConfig();

        if (!API_URL || !API_TOKEN) {
            console.warn('Evolution API not configured (URL or Token missing)');
            return;
        }

        try {
            // Format number if needed (Evolution usually expects DDI+DDD+Phone)
            // Removing non-digits
            const cleanNumber = number.replace(/\D/g, '');

            // Evolution API v2 expects number with @s.whatsapp.net suffix
            const formattedNumber = `${cleanNumber}@s.whatsapp.net`;

            const apiUrl = `${API_URL}/message/sendText/${INSTANCE}`;
            const payload = {
                number: formattedNumber,
                text: text
            };

            const headers = {
                'apikey': API_TOKEN,
                'Content-Type': 'application/json'
            };

            const response = await axios.post(apiUrl, payload, { headers });
            return response.data;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            throw error;
        }
    },

    async sendMedia(number, mediaUrl, mediaType, caption) {
        const { url: API_URL, token: API_TOKEN, instance: INSTANCE } = getConfig();

        if (!API_URL || !API_TOKEN) {
            console.warn('Evolution API not configured');
            return;
        }

        try {
            const cleanNumber = number.replace(/\D/g, '');
            const formattedNumber = `${cleanNumber}@s.whatsapp.net`;

            // Determine endpoint based on type (image, video, audio, document)
            // Evolution v2 usually has specific endpoints or a generic sendMedia
            // Using /message/sendMedia/INSTANCE for generic or specific ones

            // Simple mapping for Evolution API v2 (check specific docs if available)
            // Assuming sendMedia works for images/videos/docs
            const apiUrl = `${API_URL}/message/sendMedia/${INSTANCE}`;

            const payload = {
                number: formattedNumber,
                media: mediaUrl, // URL of the media
                mediatype: mediaType, // image, video, document
                caption: caption || '',
                fileName: 'file' // Optional
            };

            // Audio handling might differ (sendWhatsAppAudio)
            if (mediaType === 'audio') {
                // Evolution often has sendWhatsAppAudio
                const audioUrl = `${API_URL}/message/sendWhatsAppAudio/${INSTANCE}`;
                await axios.post(audioUrl, {
                    number: formattedNumber,
                    audio: mediaUrl
                }, {
                    headers: { 'apikey': API_TOKEN }
                });
                return;
            }

            const headers = {
                'apikey': API_TOKEN,
                'Content-Type': 'application/json'
            };

            const response = await axios.post(apiUrl, payload, { headers });
            return response.data;

        } catch (error) {
            console.error('Error sending media:', error.response?.data || error.message);
            throw error;
        }
    }
};
