import { roleMention, SlashCommandBuilder } from "@discordjs/builders";
import Client from "./Client";

export default class Command {
    client: Client;
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    constructor(client: Client) {
        this.client = client;
        this.data = new SlashCommandBuilder();
    }

    mentionRole(roleId: string) {
        return roleMention(roleId);
    }
}