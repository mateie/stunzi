import Client from "../Client";
import { REST } from '@discordjs/rest';
import { Routes } from "discord-api-types/v10";
import { promisify } from "util";
import { glob } from "glob";
import Ascii from 'ascii-table';
import perms from '../../validation/eventNames';
import { Guild } from "discord.js";

import Command from "../interfaces/Command";

const PG = promisify(glob);

export default class CommandHandler {
    client: Client;
    files: Promise<string[]>;

    constructor(client: Client) {
        this.client = client;

        this.files = PG(`${process.cwd()}/build/commands/**/*.js`);
    }

    async load(): Promise<void> {
        const table = new Ascii('Commands Loaded');
        const files = await this.files;

        files.forEach(async file => {
            const { default: Command } = require(file);
            if (typeof Command !== 'function') return table.addRow('❌ Command is not a class');
            const command = new Command(this.client);

            if (!command.data) return table.addRow(file.split('/')[7], '❌ Failed', 'Missing data');
            if (!command.data.name) return table.addRow(file.split('/')[7], '❌ Failed', 'Missing name');
            if (!command.data.description) return table.addRow(command.data.name, '❌ Failed', 'Missing description');
            if (command.permission) {
                if (perms.includes(command.permission)) command.data.defaultPermission = false;
                else return table.addRow(command.data.name, '❌ Failed', 'Permission is invalid');
            }
            if (!command.run) return table.addRow(command.data.name, '❌ Failed', 'Missing `run` function')
            if (typeof command.run !== 'function') return table.addRow(command.data.name, '❌ Failed', '`run` should be a function');

            this.client.commands.set(command.data.name, command);

            await table.addRow(command.data.name, '✔ Loaded');
        });

        console.log(table.toString());
    }

    async deploy() {
        const guildId: string = <string>process.env.GUILD_ID;
        const clientId: string = <string>process.env.CLIENT_ID;
        const guild: Guild = <Guild>this.client.guilds.cache.get(guildId);
        const allCommands = this.client.commands;
        const token: string = <string>this.client.token;

        const body: any[] = [];

        allCommands.forEach((command: any) => {
            body.push(command.data.toJSON());
        });

        const rest: REST = new REST({ version: '10' }).setToken(token);

        try {
            console.info('Pushing Application Commands to REST');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body }
            )
                .then(async (commands: any) => {
                    commands = commands.filter((c: any) => c.type == 1);
                    const Roles = (commandName: string) => {
                        const cmdPerms: any = this.client.commands.find((c: any) => c.data.name === commandName);
                        if (!cmdPerms.permission) return null;

                        return guild.roles.cache.filter(r => r.permissions.has(cmdPerms));
                    }

                    const fullPermissions = commands.reduce((accum: any, r: any) => {
                        const roles = Roles(r.name);
                        if (!roles) return accum;

                        const permissions = roles.reduce((a: any, r: any) => {
                            return [...a, { id: r.id, type: 'ROLE', permission: true }];
                        }, []);

                        return [...accum, { id: r.id, permissions }];
                    }, []);

                    await guild.commands.permissions.set({ fullPermissions });
                })
                .catch(console.error)

            console.info('Pushed Application Commands to REST');
        } catch (err) {
            console.error(err);
        }
    }
}