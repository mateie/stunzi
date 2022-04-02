import { CommandEvent } from "@scriptserver/command";
import { RconConnection } from "@scriptserver/core";
import Client from '@classes/Client';

export default class MineCommand {
    readonly client: Client;
    readonly server: RconConnection;

    name!: string;
    usage!: string[] | any;
    subcommands: string[] | undefined;

    constructor(client: Client) {
        this.client = client;
        this.server = client.minecraft.rconConnection;
    }

    missingArgs(command: CommandEvent, usage: string[]): void {
        this.server.send(`tellraw ${command.player} ["",{"text":"Correct Usage:","bold":true},{"text":" !${command.command} ${usage.join(' ')}"}]`);
    }

    missingSub(command: CommandEvent, usage: string): void {
        this.server.send(`tellraw ${command.player} ["",{"text":"Correct Usage:","bold":true},{"text":" !${command.command} ${usage}"}]`);
    }

    missingSubArgs(command: CommandEvent, subcommand: string, usage: string): void {
        this.server.send(`tellraw ${command.player} ["",{"text":"Correct Usage:","bold":true},{"text":" !${command.command} ${subcommand} ${usage}"}]`);
    }

    notLinked(player: string) {
        this.server.util.tellRaw(`Your Minecraft and Discord accounts are not linked, link them to use this command`, player);
    }
}