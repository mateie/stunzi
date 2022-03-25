import { CommandInteraction, Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../classes/interfaces/ICommand';
import { IStation } from '../../schemas/Station';

export default class StationCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('station')
            .setDescription('Create your own station to play songs on the go :>')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('create')
                    .setDescription('Create your station')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('share')
                    .setDescription('Share your station with someone')
                    .addUserOption(option =>
                        option
                            .setName('member')
                            .setDescription('Member to share it with')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('unshare')
                    .setDescription('Stop sharing your station with someone')
                    .addUserOption(option =>
                        option
                            .setName('member')
                            .setDescription('Member to unshare it with')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('allow')
                    .setDescription('Allow typing in your station for the members')
                    .addUserOption(option =>
                        option
                            .setName('member')
                            .setDescription('Allow a certain member to type')
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('deny')
                    .setDescription('Deny typing in your station for the members')
                    .addUserOption(option =>
                        option
                            .setName('member')
                            .setDescription('Deny a certain member to type')
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('play')
                    .setDescription('Play your station')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('delete')
                    .setDescription('Delete your station')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>interaction.member;
        const guild = <Guild>interaction.guild;

        switch (options.getSubcommand()) {
            case 'create': {
                const channel = await this.client.stations.create(member);
                return interaction.reply({ content: `Your station was created ${channel}`, ephemeral: true });
            }
            case 'share': {
                const shareWith = <GuildMember>options.getMember('member');
                if (member.user.bot) return interaction.reply({ content: `${shareWith} is a bot`, ephemeral: true });
                if (!await this.client.stations.get(member)) return interaction.reply({ content: "You don't have a station", ephemeral: true });
                await this.client.stations.share(member, shareWith);
                return interaction.reply({ content: `Your station is now shared with ${shareWith}`, ephemeral: true });
            }
            case 'unshare': {
                const unshareWith = <GuildMember>options.getMember('member');
                if (member.user.bot) return interaction.reply({ content: `${unshareWith} is a bot`, ephemeral: true });
                const station = <IStation><unknown>await this.client.stations.get(member);
                if (!station) return interaction.reply({ content: `You don't have a station`, ephemeral: true });
                if (!station.sharedWith.includes(unshareWith.id)) return interaction.reply({ content: `Your station is not shared with ${unshareWith}`, ephemeral: true });
                await this.client.stations.unshare(member, unshareWith);
                return interaction.reply({ content: `You stopped sharing your station with ${unshareWith}`, ephemeral: true });
            }
            case 'play': {
                const voiceChannel = <VoiceChannel>member.voice.channel;

                if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to be able to play your station', ephemeral: true });
                if (guild.me?.voice.channelId && voiceChannel.id !== guild.me.voice.channelId)
                    return interaction.reply({ content: `I'm already playing a station`, ephemeral: true });
                const station = <IStation><unknown>await this.client.stations.get(member);
                if (!station) return interaction.reply({ content: `You don't have a station`, ephemeral: true });
                const channel = <TextChannel>guild.channels.cache.get(station.channelId);

                await interaction.deferReply({ ephemeral: true }).catch(() => { });

                const messages = await channel.messages.fetch();
                if (messages.size < 1) {
                    interaction.followUp({ content: 'You have no tracks in your station', ephemeral: true });
                    return;
                }

                const ifQueue = this.client.music.getQueue(guild);

                if (ifQueue) return interaction.reply({ content: `I'm already playing a station`, ephemeral: true });

                const queue = this.client.music.createQueue(guild, {
                    metadata: channel
                });

                try {
                    if (!queue.connection) await queue.connect(voiceChannel);
                } catch {
                    queue.destroy();
                    return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true }).catch(() => { });
                }
                const promises = messages.filter(m => !m.author.bot).map(async message => {
                    const result = await this.client.music.search(message.content, {
                        requestedBy: message.author
                    });

                    return result.tracks[0];
                });

                const tracks = await Promise.all(promises);
                queue.addTracks(tracks);
                await interaction.followUp({ content: 'Tracks Recieved', ephemeral: true }).catch(() => { });
                queue.play();
                break;
            }
            case 'delete': {
                if (!await this.client.stations.get(member)) return interaction.reply({ content: "You don't have a station", ephemeral: true });
                await this.client.stations.deleteChannel(member, <IStation>await this.client.stations.get(member));
                await this.client.stations.delete(member);
                return interaction.reply({ content: 'Deleted your station', ephemeral: true });
            }
        }
    }
}