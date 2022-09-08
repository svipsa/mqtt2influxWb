import influx from 'influx';

export class InfluexClient {

    influxClient;

    influxConfig = {
        host: '127.0.0.1',
        port: '8086',
        database: 'mqtt_data',
    };

    constructor(influxConfig) {
        this.influxConfig = { ...this.influxConfig, ...influxConfig };
    };

    connect() {
        this.influxClient = new influx.InfluxDB({
            host: this.influxConfig.host,
            port: this.influxConfig.port,
            database: this.influxConfig.database
        });
    }

    async save(items) {
        return this.influxClient.writePoints(items);
    }
}