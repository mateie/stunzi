import { Guild, GuildMember, Message, MessageButton, SelectMenuInteraction, VoiceChannel } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

export default class MusicSelectionsEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: SelectMenuInteraction): Promise<any> {
        if (!interaction.isSelectMenu()) return;

        if (!['select_track', 'select_filter_enable', 'select_filter_disable'].includes(interaction.customId)) return;

        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;
        const message = <Message>interaction.message;

        const queue = this.client.music.getQueue(guild);
        const voiceChannel = <VoiceChannel>member.voice.channel;

        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to be able to use the music selections', ephemeral: true });

        if (!queue) return await interaction.reply({ content: 'Music is not playing', ephemeral: true });

        if (queue.connection.channel.id !== voiceChannel.id) return interaction.reply({ content: `I'm already playing music in ${guild.me?.voice.channel}`, ephemeral: true });

        if (queue.tracks.length < 1 && interaction.customId === 'select_track') return interaction.reply({ content: 'Select menu is expired, please try one that is not', ephemeral: true });

        switch (interaction.customId) {
        case 'select_track': {
            const value = parseInt(interaction.values[0]);
            const track = queue.tracks[value];
            const skipTo = queue.getTrackPosition(track);
            queue.skipTo(skipTo);
            interaction.reply({ content: `Skipped to: **${track.author} - ${track.title}**`, ephemeral: true });

            message.edit({ components: [] });
            setTimeout(() => {
                message.delete();
            }, 5000);
            break;
        }
        case 'select_filter_enable': {
            const rows = [message.components[0], message.components[1], message.components[2]];
            const values = interaction.values;
            const filters = Object.create(values);
            const enabledFilters = <Array<string>>queue.getFiltersEnabled();
            values.forEach(filter => filters[filter] = true);
            enabledFilters.forEach(filter => filters[filter] = true);
            const list = this.client.util.list(values.map(value => this.client.util.capFirstLetter(value)));
            queue.setFilters(filters);
            interaction.reply({ content: `Enabled filters: ${list}`, ephemeral: true });

            const button = <MessageButton>rows[2].components[1];
            const enableFilters = button.setCustomId('enable_filters').setStyle('SUCCESS').setLabel('Enable Filter(s)');

            rows[2].components[1] = enableFilters;
            return message.edit({ components: rows });
        }
        case 'select_filter_disable': {
            const rows = [message.components[0], message.components[1], message.components[2]];
            const values = interaction.values;
            const filters = Object.create({});
            const enabledFilters = <Array<string>>queue.getFiltersEnabled();
            enabledFilters.forEach(filter => {
                if (values.includes(filter)) return filters[filter] = false;
                return filters[filter] = true;
            });

            const list = this.client.util.list(values.map(value => this.client.util.capFirstLetter(value)));
            queue.setFilters(filters);
            interaction.reply({ content: `Disabled filters: ${list}`, ephemeral: true });

            const button = <MessageButton>rows[2].components[2];
            const disabledFilterButton = button.setCustomId('disable_filters').setStyle('SUCCESS').setLabel('Disable Filter(s)');
            rows[2].components[2] = disabledFilterButton;
            return message.edit({ components: rows });
        }
        }
    }
}