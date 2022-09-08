import config from 'config';
import { MqttClient } from './src/mqttClient.js';
import { InfluexClient } from './src/influexClient.js';
import { Parser } from './src/parser.js';
import { Executor } from './src/executor.js';
import { Queue } from './src/queue.js';
import { Logger } from './src/logger.js';

process.on('uncaughtException', (error) => {
    console.error(`Detect uncaughtException: ${error.message}`, { error });
    exit(1);
});

process.on('unhandledRejection', (reason) => {
    let error = reason;

    if (reason instanceof Error) {
        error = reason.message;
    }

    console.error(`Detect unhandledRejection: ${error}`, { reason });
    exit(1);
});

const logger = new Logger();

const queue = new Queue();

const influexClient = new InfluexClient(config.get('influxdb'));
influexClient.connect();

const mqttClient = new MqttClient(config.get('mqtt'), logger);
mqttClient.run(onMqttMessage);

const parser = new Parser(config.get('influxdb.database'));

function onMqttMessage(topic, message, msg) {
    const item = parser.parse(topic, msg);
    if (item) {
        queue.add(item);
    }
}

const executor = new Executor(config.get('executor'), queue, logger, influexClient);
executor.run();


function exit(code = 1) {
    try  {
        if (mqttClient) {
            mqttClient.stop();
        }
        if (executor) {
            executor.stop();
        }
    } catch (e) {
        console.error(e);
    }

    process.exit(code);
}