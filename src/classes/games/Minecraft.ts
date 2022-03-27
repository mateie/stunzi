import Client from "../Client";
import { ScriptServer } from "@scriptserver/core";
import { useEssentials } from "@scriptserver/essentials";
import { useEvent } from "@scriptserver/event";
import { useUtil } from "@scriptserver/util";

import { promisify } from "util";
import { glob } from "glob";
import Ascii from 'ascii-table';

const { RCON_PASSWORD } = process.env;

const PG = promisify(glob);

export default class Minecraft extends ScriptServer {
    readonly client: Client;
    private readonly eventFiles: Promise<string[]>

    online: boolean;

    constructor(client: Client) {
        super({
            flavor: 'paper',
            javaServer: {
                path: `${process.cwd()}/minecraft`,
                jar: 'paper.jar',
                args: ['-Xms4G', '-Xmx4G'],
                pipeStdout: false,
                pipeStdin: false,
            },
            rconConnection: {
                port: 25575,
                password: RCON_PASSWORD
            },
        });

        this.client = client;
        this.eventFiles = PG(`${process.cwd()}/build/minecraft/events/*.js`);

        this.online = false;

        useEssentials(this);
        useEvent(this.javaServer);
        useUtil(this.rconConnection);
    }

    async loadServerEvents() {
        const table = new Ascii('Minecraft Server Events Loaded');
        const files = await this.eventFiles;

        files.forEach(async file => {
            const { default: Event } = require(file);
            if (typeof Event !== 'function') return table.addRow('❌ Event is not a class');
            const event = new Event(this.client);

            if (!event.name) {
                const l = file.split('/');
                table.addRow('Missing', `❌ Event name is missing: ${l[4] + `/` + l[5]}`);
                return;
            }

            if (event.once) {
                this.client.minecraft.javaServer.once(event.name, (...args) => event.run(...args));
            } else {
                this.client.minecraft.javaServer.on(event.name, (...args: any) => event.run(...args));
            }

            table.addRow(event.name, '✔ Loaded');
        });

        console.log(table.toString());
    }
}