import { CommandEvent } from '@scriptserver/command';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import IMineCommand from '@interfaces/IMineCommand';

export default class MinecraftChatEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'command';
    }

    async run(event: CommandEvent) {
        const command = <IMineCommand>this.client.minecraftCommands.get(event.command);
        if (!command) {
            this.client.minecraftCommands.delete(event.command);
            return;
        }

        command.run(event, event.args);
    }
}