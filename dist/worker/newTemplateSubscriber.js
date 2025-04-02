"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForTemplateUpdates = listenForTemplateUpdates;
const redisClient_1 = __importDefault(require("../client/redisClient"));
const templateCache_1 = require("../cache/templateCache");
function listenForTemplateUpdates() {
    return __awaiter(this, void 0, void 0, function* () {
        const subscriber = redisClient_1.default.duplicate();
        if (subscriber.status !== 'ready' && subscriber.status !== 'connecting') {
            yield subscriber.connect();
        }
        yield subscriber.subscribe('template-updated'); // just subscribe first
        subscriber.on('message', (channel, message) => {
            if (channel === 'template-updated') {
                try {
                    const updatedTemplate = JSON.parse(message);
                    console.log('[Listener] picked up published new template, updatedTemplate id: ' + updatedTemplate.template_id);
                    (0, templateCache_1.addTemplateToCache)(updatedTemplate);
                }
                catch (err) {
                    console.error('[Cache] Failed to update local cache from pub/sub:', err);
                }
            }
        });
    });
}
