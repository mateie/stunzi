import Client from "@classes/Client";
import { ScriptServer } from "@scriptserver/core";
import { useEssentials } from "@scriptserver/essentials";
import { useEvent } from "@scriptserver/event";
import { useUtil } from "@scriptserver/util";
import { useCommand } from '@scriptserver/command';

import { promisify } from "util";
import { glob } from "glob";
import Ascii from 'ascii-table';

const { RCON_PASSWORD } = process.env;

const PG = promisify(glob);

export default class Minecraft extends ScriptServer {
    readonly client: Client;
    private readonly eventFiles: Promise<string[]>;
    private readonly commandFiles: Promise<string[]>;

    online: boolean;

    constructor(client: Client) {
        super({
            flavor: 'paper',
            javaServer: {
                path: `${process.cwd()}/minecraft`,
                jar: 'paper.jar',
                args: ['-Xms2G', '-Xmx2G'],
                pipeStdout: false,
                pipeStdin: false,
            },
            rconConnection: {
                port: 25575,
                password: RCON_PASSWORD
            },
            command: {
                prefix: '!'
            }
        });

        this.client = client;
        this.eventFiles = PG(`${process.cwd()}/build/minecraft/events/**/*.js`);
        this.commandFiles = PG(`${process.cwd()}/build/minecraft/commands/**/*.js`);

        this.online = false;

        useEssentials(this);
        useEvent(this.javaServer);
        useUtil(this.rconConnection);
        useCommand(this.javaServer);
    }

    async loadEvents() {
        const table = new Ascii('Minecraft Events Loaded');
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

    async loadCommands() {
        const table = new Ascii('Minecraft Commands Loaded');
        const files = await this.commandFiles;

        files.forEach(async file => {
            const { default: Command } = require(file);
            if (typeof Command !== 'function') return table.addRow('❌ Command is not a class');
            const command = new Command(this.client);

            if (!command.name) return table.addRow(file.split('/')[6], '❌ Failed', 'Missing name');
            if (!command.run) return table.addRow(command.data.name, '❌ Failed', 'Missing `run` function')
            if (typeof command.run !== 'function') return table.addRow(command.data.name, '❌ Failed', '`run` should be a function');

            this.client.minecraftCommands.set(command.name, command);

            await table.addRow(command.name, '✔ Loaded');
        });

        console.log(table.toString());
    }
}