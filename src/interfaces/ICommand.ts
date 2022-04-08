import { CommandInteraction, PermissionResolvable } from "discord.js";
import Client from "@classes/Client";
import { SlashCommandBuilder } from "@discordjs/builders";

export default interface ICommand {
    readonly client: Client,
    permission: PermissionResolvable | undefined;
    data:
    | SlashCommandBuilder,
    run: (interaction: CommandInteraction) => any | Promise<any>
    mentionRole: (roleId: string) => string;
}