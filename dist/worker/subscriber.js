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
const templateService_1 = require("../service/templateService");
function listenForTemplateUpdates() {
    return __awaiter(this, void 0, void 0, function* () {
        const subscriber = redisClient_1.default.duplicate();
        console.log('Subscriber Redis status:', subscriber.status);
        if (subscriber.status !== 'ready' && subscriber.status !== 'connecting') {
            yield subscriber.connect();
        }
        yield subscriber.subscribe('template-updated', (message) => __awaiter(this, void 0, void 0, function* () {
            if (typeof message === 'string' && message === 'reload') {
                console.log('[Cache] Reloading templates from Redis due to pub/sub');
                yield (0, templateService_1.initializeTemplateCache)();
            }
        }));
    });
}
