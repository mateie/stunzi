import { ModalSubmitInteraction } from '@mateie/discord-modals';
import { Guild, GuildMember, VoiceChannel } from 'discord.js';
import Client from '../../../classes/Client';
import Event from '../../../classes/Event';
import IEvent from '../../../classes/interfaces/IEvent';

export default class MusicModal extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'modalSubmit';
    }

    async run(interaction: ModalSubmitInteraction) {
        if (!['add_tracks_modal'].includes(interaction.customId)) return;

        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;
        const voiceChannel = <VoiceChannel>member.voice.channel;

        const queue = this.client.music.getQueue(guild);
        if (!queue) return await interaction.reply({ content: 'Queue does not exist', ephemeral: true });

        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to be able to use the music buttons', ephemeral: true });

        if (queue.connection.channel.id !== voiceChannel.id) return interaction.reply({ content: `I'm already playing music in ${guild.me?.voice.channel}`, ephemeral: true });

        switch (interaction.customId) {
            case 'add_tracks_modal': {
                const query = interaction.getTextInputValue('track_query');
                const result = await this.client.music.search(query, {
                    requestedBy: interaction.user
                });
                if (result.playlist) queue.addTracks(result.playlist.tracks);
                else queue.addTrack(result.tracks[0]);
                return interaction.reply({ content: `Added to the queue`, ephemeral: true });
                break;
            }
        }
    }
}