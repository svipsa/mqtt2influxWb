export class Parser {

    // Database topic
    measurement;

    constructor(measurement) {
        this.measurement = measurement;
    }

    parse(topic, msg) {
        if (msg.retain) {
            return;
        }

        let client = null;
        let parts = msg.topic.split('/');

        if (parts.length < 5) {
            return
        }

        if (parts[1] == 'client') {
            client = parts[2];
            parts = parts.splice(2);
        }

        if (parts.length < 5) {
            return
        }

        const device_id = parts[2];
        const control_id = parts[4];
        const value = msg.payload.toString();
        return this.serialize(client, device_id, control_id, value);
    }

    serialize(client, device_id, control_id, value) {
        value = value.replace('\n', ' ');
        if (!value && parseInt(value) !== 0) {
            return;
        }
        const fields = {};
        const value_f = parseFloat(value);
        if (!isNaN(value_f)) {
            fields["value_f"] = value_f;
        } else {
            fields["value_s"] = value;
        }

        return {
            'measurement': this.measurement,
            'tags': {
                'client': client,
                "channel": `${device_id}/${control_id}`,
            },
            "fields": fields
        }
    }
}