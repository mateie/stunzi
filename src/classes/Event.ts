import Client from "./Client";

export default class Event {
    readonly client: Client;
    name!: string;

    constructor(client: Client) {
        this.client = client;
    }
}