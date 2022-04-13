/* eslint-disable semi */
import Client from '@classes/Client';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ContextMenuInteraction, PermissionResolvable } from 'discord.js';

export default interface IMenu {
    readonly client: Client;
    permission: PermissionResolvable | null;
    data: ContextMenuCommandBuilder;
    run: (interaction: ContextMenuInteraction) => any | Promise<any>;
}