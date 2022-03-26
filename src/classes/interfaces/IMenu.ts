import { ContextMenuInteraction, PermissionResolvable } from "discord.js";
import Client from "../Client";
import { ContextMenuCommandBuilder } from "@discordjs/builders";

export default interface IMenu {
    client: Client,
    permission: PermissionResolvable | undefined;
    data:
    | ContextMenuCommandBuilder
    run: (interaction: ContextMenuInteraction) => void | Promise<void>;
    mentionRole: (roleId: string) => string;
}