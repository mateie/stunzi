import { ContextMenuCommandBuilder, roleMention } from '@discordjs/builders';
import { PermissionResolvable } from 'discord.js';
import Client from './Client';

export default class Command {
    readonly client: Client;
    permission: PermissionResolvable | null;
    data!: ContextMenuCommandBuilder;
    constructor(client: Client) {
        this.client = client;
        this.permission = null;
        this.data = new ContextMenuCommandBuilder();
    }

    mentionRole(roleId: string): string {
        return roleMention(roleId);
    }
}
