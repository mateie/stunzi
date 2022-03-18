import { roleMention, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { PermissionResolvable } from "discord.js";
import Client from "./Client";

export default class Command {
    client: Client;
    data:
        | SlashCommandBuilder;
    permission: PermissionResolvable | undefined;
    constructor(client: Client) {
        this.client = client;
        this.permission = undefined;
        this.data = <SlashCommandBuilder>new SlashCommandBuilder();
    }

    mentionRole(roleId: string): string {
        return roleMention(roleId);
    }
}