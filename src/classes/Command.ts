import { roleMention, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionResolvable } from 'discord.js';
import Client from './Client';

export default class Command {
    readonly client: Client;
    permission: PermissionResolvable | null;
    data!: SlashCommandBuilder;
    constructor(client: Client) {
        this.client = client; 
        this.permission = null;
        this.data = new SlashCommandBuilder();
    }

    mentionRole(roleId: string): string {
        return roleMention(roleId);
    }
}
