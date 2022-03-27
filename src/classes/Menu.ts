import { roleMention, ContextMenuCommandBuilder } from "@discordjs/builders";
import { PermissionResolvable } from "discord.js";
import Client from "./Client";

export default class Menu {
    readonly client: Client;
    data:
        | ContextMenuCommandBuilder;
    permission: PermissionResolvable | undefined;
    constructor(client: Client) {
        this.client = client;
        this.permission = undefined;
        this.data = <ContextMenuCommandBuilder>new ContextMenuCommandBuilder();
    }

    mentionRole(roleId: string): string {
        return roleMention(roleId);
    }
}