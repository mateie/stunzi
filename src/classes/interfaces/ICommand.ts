import { CommandInteraction, PermissionResolvable } from "discord.js";
import Client from "../Client";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

export default interface Command {
    client: Client,
    permission: PermissionResolvable | undefined;
    data:
    | SlashCommandBuilder,
    run: (interaction: CommandInteraction) => void | Promise<void>
    mentionRole: (roleId: string) => string;
}