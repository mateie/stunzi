import Client from '@classes/Client';
import { promisify } from 'util';
import { glob } from 'glob';
import Ascii from 'ascii-table';
import perms from '@validation/permissions';

const PG = promisify(glob);

export default class MenuHandler {
    readonly client: Client;
    private readonly files: Promise<string[]>;

    constructor(client: Client) {
        this.client = client;

        this.files = PG(`${process.cwd()}/build/menus/**/*.js`);
    }

    async load() {
        const table = new Ascii('Menus Loaded');
        const files = await this.files;

        files.forEach(async file => {
            const { default: Menu } = require(file);
            if (typeof Menu !== 'function') return table.addRow('❌ Menu is not a class');
            const menu = new Menu(this.client);

            if (!menu.data) return table.addRow(file.split('/')[6], '❌ Failed', 'Missing data');
            if (!menu.data.name) return table.addRow(file.split('/')[6], '❌ Failed', 'Missing name');
            if (!menu.data.type) return table.addRow(menu.data.name, '❌ Failed', 'Missing Type');
            if (menu.permission) {
                if (perms.includes(menu.permission)) menu.data.defaultPermission = false;
                else return table.addRow(menu.data.name, '❌ Failed', 'Permission is invalid');
            }
            if (!menu.run) return table.addRow(menu.data.name, '❌ Failed', 'Missing `run` function');
            if (typeof menu.run !== 'function') return table.addRow(menu.data.name, '❌ Failed', '`run` should be a function');

            this.client.menus.set(menu.data.name, menu); '';

            await table.addRow(menu.data.name, '✔ Loaded');
        });

        console.log(table.toString());
    }
}