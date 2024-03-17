import {WEBSOCKET_URL} from "../config.js";
import {emit} from "../utils/common.ts";

export default class Connector {

    static websocket = null;

    static async connect(token) {
        return new Promise(function (resolve, reject) {
            Connector.websocket = new WebSocket(WEBSOCKET_URL + '?' + token);
            Connector.websocket.onmessage = Connector.onMessage;
            Connector.websocket.onclose = Connector.onClose;
            Connector.websocket.onopen = () => {
                Connector.websocket.onerror = Connector.onError;
                resolve();
            };
            Connector.websocket.onerror = (error) => {
                reject(error);
            };
        });
    }

    static onMessage(e) {
        let message = JSON.parse(e.data);
        emit(message.event, message.params);
    }

    static onClose() {

    }

    static onError(error) {
        console.log(error);
    }

    static emit(event, params) {
        Connector.websocket.send(JSON.stringify({event: event, params: params}));
    }

}
