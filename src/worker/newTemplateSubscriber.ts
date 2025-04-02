import redisClient from '../client/redisClient';
import { addTemplateToCache } from '../cache/templateCache';
import { Template } from '../type/template';

export async function listenForTemplateUpdates() {
    const subscriber = redisClient.duplicate();

    if (subscriber.status !== 'ready' && subscriber.status !== 'connecting') {
        await subscriber.connect();
    }

    await subscriber.subscribe('template-updated'); // just subscribe first

    subscriber.on('message', (channel, message) => {
        if (channel === 'template-updated') {
            try {
                const updatedTemplate: Template = JSON.parse(message);
                console.log('[Listener] picked up published new template, updatedTemplate id: ' + updatedTemplate.template_id);
                addTemplateToCache(updatedTemplate);
            } catch (err) {
                console.error('[Cache] Failed to update local cache from pub/sub:', err);
            }
        }
    });
}
