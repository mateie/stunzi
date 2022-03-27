import Client from '../Client';
import { promisify } from 'util';
import { glob } from 'glob';
import Ascii from 'ascii-table';
import events from '../../validation/eventNames';

const PG = promisify(glob);

export default class EventHandler {
    readonly client: Client;
    private readonly files: Promise<string[]>;

    constructor(client: Client) {
        this.client = client;

        this.files = PG(`${process.cwd()}/build/events/discord/**/*.js`);
    }

    async load() {
        const table = new Ascii('Events Loaded');
        const files = await this.files;

        files.forEach(async file => {
            const { default: Event } = require(file);
            if (typeof Event !== 'function') return table.addRow('❌ Event is not a class');
            const event = new Event(this.client);

            if (!events.includes(event.name) || !event.name) {
                const l = file.split('/');
                table.addRow(`${event.name || 'Missing'}`, `❌ Event name is either invalid or missing: ${l[4] + `/` + l[5]}`);
                return;
            }

            if (event.once) {
                this.client.once(event.name, (...args) => event.run(...args));
            } else {
                this.client.on(event.name, (...args) => event.run(...args));
            }

            table.addRow(event.name, '✔ Loaded');
        });

        console.log(table.toString());
    }
}