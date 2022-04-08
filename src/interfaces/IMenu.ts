import { ContextMenuInteraction, PermissionResolvable } from "discord.js";
import Client from "@classes/Client";
import { ContextMenuCommandBuilder } from "@discordjs/builders";

export default interface IMenu {
    readonly client: Client,
    permission: PermissionResolvable | undefined;
    data:
    | ContextMenuCommandBuilder
    run: (interaction: ContextMenuInteraction) => any | Promise<any>;
    mentionRole: (roleId: string) => string;
}