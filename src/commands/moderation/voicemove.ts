import { CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../classes/interfaces/ICommand';

export default class VoiceMoveCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MOVE_MEMBERS';
        this.data
            .setName('voicemove')
            .setDescription('Move all the members in a current channel to another one')
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Channel to move to')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>interaction.member;

        const currentVC = <VoiceChannel>member.voice.channel;
        const newVC = <VoiceChannel>options.getChannel('channel');

        if (newVC.type !== 'GUILD_VOICE') return interaction.reply({ content: 'Channel you provided is not a voice channel', ephemeral: true });

        if (!currentVC) return interaction.reply({ content: 'You have to be in a voice channel to move members', ephemeral: true });
        if (newVC.id === currentVC.id) return interaction.reply({ content: 'You cannot move members to the same channel', ephemeral: true });

        currentVC.members.forEach((m: GuildMember) => m.voice.setChannel(newVC, `Moved by ${member}`));

        return interaction.reply({ content: `Moved all the members to ${newVC}`, ephemeral: true });
    }
}