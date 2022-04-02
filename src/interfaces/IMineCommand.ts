import { CommandEvent } from "@scriptserver/command";
import Client from "@classes/Client";

export default interface IMineCommand {
    readonly client: Client;
    name: string;
    usage: string[],
    run: (command: CommandEvent, args: string[]) => any;
    missingArgs: (command: CommandEvent, usage: string[]) => void;
}