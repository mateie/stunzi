import Client from "./Client";

export default class Event {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}