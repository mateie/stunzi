import { Queue, Track } from 'discord-player';
import { TextChannel } from 'discord.js';
import Client from '../../classes/Client';
import Event from '../../classes/Event';
import IEvent from '../../classes/interfaces/IEvent';

export default class TrackAddEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'trackAdd';
    }

    async run(queue: Queue, track: Track) {
        const embed = this.client.util.embed()
            .setAuthor({ name: track.author })
            .setTitle(track.title)
            .setURL(track.url)
            .setDescription('**Added to the queue**')
            .addFields([
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Source', value: track.source, inline: true }
            ])
            .setThumbnail(track.thumbnail)
            .setFooter({ text: `Requested by ${track.requestedBy.tag}` });

        const channel = <TextChannel>queue.metadata;

        await channel.send({ embeds: [embed] });
    }
}