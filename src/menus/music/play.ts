import { ContextMenuInteraction, Guild, GuildMember, Message, TextChannel, VoiceChannel } from 'discord.js';
import Client from '../../classes/Client';
import Menu from '../../classes/Menu';
import IMenu from '../../interfaces/IMenu';
import channels from '../../data/channels';

export default class MenuNameMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('Queue Track')
            .setType(3);
    }

    async run(interaction: ContextMenuInteraction) {
        const { targetId } = interaction;

        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;
        const textChannel = <TextChannel>interaction.channel;
        const message = <Message>await textChannel.messages.fetch(targetId);

        const channel = <TextChannel>guild.channels.cache.get(channels.text.music);

        const voiceChannel = <VoiceChannel>member.voice.channel;

        if (message.content.length < 1) return interaction.reply({ content: `Track not provided`, ephemeral: true });

        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to queue a track', ephemeral: true });

        if (guild?.me?.voice.channelId && voiceChannel.id !== guild?.me.voice.channelId)
            return interaction.reply({ content: `You have to be in ${guild?.me.voice.channel} to queue a track`, ephemeral: true });

        if (member.voice.deaf) return interaction.reply({ content: 'You cannot queue a track when deafened', ephemeral: true });

        let queue = this.client.music.getQueue(guild);

        if (!queue) {
            queue = this.client.music.createQueue(guild, {
                metadata: channel,
            });

            try {
                if (!queue.connection) await queue.connect(voiceChannel);
            } catch {
                queue.destroy();
                return await interaction.reply({ content: 'Could not join your voice channel', ephemeral: true });
            }
        }

        await interaction.deferReply({ ephemeral: true }).catch(() => { });

        const result = await this.client.music.search(message.content, {
            requestedBy: interaction.user
        });

        if (result.tracks.length < 1 || !result.tracks[0]) {
            await interaction.followUp({ content: `Track **${message.content} was not found` });
            return;
        }

        if (result.playlist) queue.addTracks(result.playlist.tracks);
        else queue.addTrack(result.tracks[0]);

        if (!queue.playing) queue.play();

        await interaction.followUp({ content: 'Track/Playlist Recieved', ephemeral: true }).catch(() => { });
    }
}