import { Queue } from 'discord-player';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

export default class MusicErrorEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'error';
    }

    run(queue: Queue, error: string) {
        console.error(error);
    }
}