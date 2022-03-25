import { Player, Track } from "discord-player";
import Client from "../Client";
import { promisify } from 'util';
import { glob } from 'glob';
import Ascii from 'ascii-table';
import { Message } from "discord.js";
import songLyrics from 'songlyrics';


const PG = promisify(glob);

export default class Music extends Player {
    client: Client;
    files: Promise<string[]>;

    constructor(client: Client) {
        super(client);

        this.client = client;
        this.files = PG(`${process.cwd()}/build/events/music/*.js`);
    }

    async searchLyrics(title: string) {
        try {
            const search = await songLyrics(title);
            return search;
        } catch {
            return false;
        }
    }

    async loadEvents(): Promise<void> {
        const table = new Ascii('Music Events Loaded');
        const files = await this.files;

        files.forEach(async file => {
            const { default: Event } = require(file);
            if (typeof Event !== 'function') return table.addRow('❌ Event is not a class');
            const event = new Event(this.client);

            if (!event.name) {
                const l = file.split('/');
                table.addRow(`${event.name || 'Missing'}`, `❌ Event name is either invalid or missing: ${l[4] + `/` + l[5]}`);
                return;
            }

            if (event.once) {
                this.once(event.name, (...args: any) => event.run(...args));
            } else {
                this.on(event.name, (...args: any) => event.run(...args));
            }

            table.addRow(event.name, '✔ Loaded');
        });

        console.log(table.toString());
    }


    async buttons(message: Message, track: Track): Promise<void> {
        const topRow = this.client.util.actionRow()
            .addComponents(
                this.client.util.button()
                    .setCustomId('show_queue')
                    .setLabel('Show Queue')
                    .setStyle('PRIMARY'),
                this.client.util.button()
                    .setCustomId('show_track_progress')
                    .setLabel('Show Track Progress')
                    .setStyle('PRIMARY'),
                this.client.util.button()
                    .setCustomId('show_track_lyrics')
                    .setLabel('Show Lyrics')
                    .setStyle('PRIMARY')
            );

        const midRow = this.client.util.actionRow()
            .addComponents(
                this.client.util.button()
                    .setCustomId('pause_track')
                    .setLabel('Pause Track')
                    .setStyle('DANGER'),
                this.client.util.button()
                    .setCustomId('skip_current_track')
                    .setLabel('Skip Current Track')
                    .setStyle('DANGER'),
                this.client.util.button()
                    .setCustomId('skip_to_track')
                    .setLabel('Skip to Track')
                    .setStyle('SUCCESS')
            );

        const bottomRow = this.client.util.actionRow()
            .addComponents(
                this.client.util.button()
                    .setCustomId('add_tracks')
                    .setLabel('Add Track(s)')
                    .setStyle('SUCCESS'),
                this.client.util.button()
                    .setCustomId('enable_filters')
                    .setLabel('Enable Filter(s)')
                    .setStyle('SUCCESS'),
                this.client.util.button()
                    .setCustomId('disable_filters')
                    .setLabel('Disable Filter(s)')
                    .setStyle('DANGER')
            );

        await message.edit({ components: [topRow, midRow, bottomRow] });
    }
}