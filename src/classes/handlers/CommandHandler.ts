import Client from '@classes/Client';
import { promisify } from 'util';
import { glob } from 'glob';
import Ascii from 'ascii-table';
import perms from '@validation/permissions';

const PG = promisify(glob);

export default class CommandHandler {
    readonly client: Client;
    private readonly files: Promise<string[]>;

    constructor(client: Client) {
        this.client = client;

        this.files = PG(`${process.cwd()}/build/commands/**/*.js`);
    }

    async load() {
        const table = new Ascii('Commands Loaded');
        const files = await this.files;

        files.forEach(async file => { 
            const { default: Command } = require(file);
            if (typeof Command !== 'function') return table.addRow('❌ Command is not a class');
            const command = new Command(this.client);

            if (!command.data) return table.addRow(file.split('/')[6], '❌ Failed', 'Missing data');
            if (!command.data.name) return table.addRow(file.split('/')[6], '❌ Failed', 'Missing name');
            if (!command.data.description) return table.addRow(command.data.name, '❌ Failed', 'Missing description');
            if (command.permission) {
                if (perms.includes(command.permission)) command.data.defaultPermission = false;
                else return table.addRow(command.data.name, '❌ Failed', 'Permission is invalid');
            }
            if (!command.run) return table.addRow(command.data.name, '❌ Failed', 'Missing `run` function');
            if (typeof command.run !== 'function') return table.addRow(command.data.name, '❌ Failed', '`run` should be a function');

            this.client.commands.set(command.data.name, command);

            await table.addRow(command.data.name, '✔ Loaded');
        });

        console.log(table.toString());
    }
}