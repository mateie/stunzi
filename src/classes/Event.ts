import Client from './Client';

export default class Event {
    readonly client: Client;
    name!: string;
    once: boolean | null;
    process: boolean | null;

    constructor(client: Client) {
        this.client = client;

        this.once = null;
        this.process = null;
    }
}