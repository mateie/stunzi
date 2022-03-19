const { DB } = process.env;
import mongoose from "mongoose";
import Client from "./Client";

import Check from "./database/Check";
import Verify from "./database/Verify";
import Create from "./database/Create";
import Get from "./database/Get";

export default class Database {
    client: Client;

    check: Check;
    create: Create;
    get: Get;
    verify: Verify;

    constructor(client: Client) {
        this.client = client;

        this.check = new Check(client, this);
        this.create = new Create(client, this);
        this.get = new Get(client, this);
        this.verify = new Verify(client, this);
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