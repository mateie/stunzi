const { DB } = process.env;
import mongoose from "mongoose";
import Client from "./Client";

export default class Database {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    connect() {
        if (!DB) return console.error('Database URL not provided');

        mongoose.connect(DB)
            .then(() => {
                console.log('Connected to the database');
            })
            .catch(console.error);
    }
}