import { roleMention, SlashCommandBuilder } from "@discordjs/builders";
import { PermissionResolvable } from "discord.js";
import Client from "./Client";

export default class Command {
    client: Client;
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    permission: PermissionResolvable | undefined;
    constructor(client: Client) {
        this.client = client;
        this.permission = undefined;
        this.data = new SlashCommandBuilder();
    }

    mentionRole(roleId: string) {
        return roleMention(roleId);
    }
}