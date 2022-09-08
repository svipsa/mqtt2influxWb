import mqtt from 'mqtt';

export class MqttClient {

    mqttClient = null;
    mqttConnected = false;
    mqttConfig = {
        url: '127.0.0.1',
        username: '',
        password: '',
        topicConnected: 'topicConnected',
        secure: true
    };
    logger;

    constructor(mqttConfig, logger) {
        this.mqttConfig = { ...this.mqttConfig, ...mqttConfig };
        this.logger = logger;
    };

    run(onMessageCallback) {
        this.mqttClient = mqtt.connect(
            this.mqttConfig.url, {
                username: this.mqttConfig.username,
                password: this.mqttConfig.password,
                will: {
                    topic: this.mqttConfig.topicConnected + '/connected',
                    payload: '0',
                    retain: true
                },
                rejectUnauthorized: this.mqttConfig.secure
            }
        );

        this.mqttClient.on('connect', () => {
            this.mqttClient.publish(this.mqttConfig.topicConnected + '/connected', '2', { retain: true });
            this.mqttConnected = true;
            this.logger.info('mqtt: connected ' + this.mqttConfig.url);
            this.mqttClient.subscribe(this.mqttConfig.topic);
            this.logger.info('mqtt: subscribed ' + this.mqttConfig.topic);
        });

        this.mqttClient.on('close', () => {
            if (this.mqttConnected) {
                this.mqttConnected = false;
                this.logger.info('mqtt: disconnected ' + this.mqttConfig.url);
            }
        });

        this.mqttClient.on('error', err => {
            this.logger.error('mqtt: error ' + err.message);
        });

        this.mqttClient.on('message', (topic, message, msg) => {
            onMessageCallback(topic, message, msg);
        });
    }

    stop() {
        this.mqttClient.end(true);
    }
}