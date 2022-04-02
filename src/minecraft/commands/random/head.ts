import { CommandEvent } from "@scriptserver/command";
import Client from "@classes/Client";
import IMineCommand from "@interfaces/IMineCommand";
import MineCommand from "@classes/games/minecraft/MineCommand";

export default class HeadMineCommand extends MineCommand implements IMineCommand {
    constructor(client: Client) {
        super(client);

        this.name = 'head';
        this.usage = ['<username>'];
    }

    async run(command: CommandEvent, args: string[]) {
        const { player } = command;
        if (args.length < 1 || args.includes('')) return this.missingArgs(command, this.usage);
        this.server.send(`give ${player} minecraft:player_head{SkullOwner:"${args[0]}"}`);
    }
}