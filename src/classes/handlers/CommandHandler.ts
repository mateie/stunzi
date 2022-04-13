import Client from '@classes/Client';
import { promisify } from 'util';
import { glob } from 'glob';
import Ascii from 'ascii-table';

const PG = promisify(glob);

export default class CommandHandler {
    readonly client: Client;
    private readonly files: Promise<string[]>;

    constructor(client: Client) {
        this.client = client;

        this.files = PG(`${process.cwd()}/build/commands/**/*.js`);
    }

    async load() {
        const table = new Ascii('Commands Loaded').setHeading('Command Name', 'Command Type', 'Status');
        const files = await this.files;

        files.forEach(async file => { 
            const { default: Command } = require(file);
            if (typeof Command !== 'function') return table.addRow('❌ Command is not a class');
            const command = new Command(this.client);

            if (!command.data) return table.addRow(file.split('/')[6], 'Missing data', '❌ Failed');
            if (!command.data.name) return table.addRow(file.split('/')[6], 'Missing name', '❌ Failed');
            if(!command.data.type) if (!command.data.description) return table.addRow(command.data.name, 'Missing description', '❌ Failed');
            if (command.permission) {
                command.data.defaultPermission = false;
            }
            if (!command.run) return table.addRow(command.data.name, 'Missing `run` function', '❌ Failed');
            if (typeof command.run !== 'function') return table.addRow(command.data.name, '`run` should be a function', '❌ Failed');

            this.client.commands.set(command.data.name, command);

            await table.addRow(command.data.name, command.data.type ? 'Menu' : 'Slash' ,'✔ Loaded');
        });

        console.log(table.toString());
    }
}