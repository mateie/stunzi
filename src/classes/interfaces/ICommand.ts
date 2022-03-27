import { CommandInteraction, PermissionResolvable } from "discord.js";
import Client from "../Client";
import { SlashCommandBuilder } from "@discordjs/builders";

export default interface ICommand {
    readonly client: Client,
    permission: PermissionResolvable | undefined;
    data:
    | SlashCommandBuilder,
    run: (interaction: CommandInteraction) => void | Promise<void>
    mentionRole: (roleId: string) => string;
}