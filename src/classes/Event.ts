import Client from "./Client";

export default class Event {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}