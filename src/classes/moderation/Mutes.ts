import { ButtonInteraction, CommandInteraction, Guild, GuildMember, Message, Role, TextChannel } from 'discord.js';
import { ModalSubmitInteraction } from '@mateie/discord-modals';
import Client from '../Client';
import Mute, { IMute } from '@schemas/Mute';
import roles from '@data/roles';
import ms from 'ms';
import channels from '@data/channels';

export default class Mutes {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
        member: GuildMember,
        time: string | null,
        reason: string
    ) {
        const isMuted = await this.isMuted(member);
        if (isMuted) return interaction.reply({ content: `${member} is already muted`, ephemeral: true });
        const by = <GuildMember>interaction.member;
        const guild = <Guild>interaction.guild;
        const mutedRole = <Role>guild.roles.cache.get(roles.muted);

        interaction.reply({ content: `${member} was muted${time ? ` for ${time}` : ''} by ${by}, Reason: **${reason}**`, ephemeral: true });

        const channel = <TextChannel>guild.channels.cache.get(channels.text.publicLogs);
        const message = await channel.send({ content: `${member} was muted${time ? ` for ${time}` : ''} by ${by}, Reason: **${reason}**` });

        const mute = await Mute.create({ memberId: member.id, reason, by: by.id, messageId: message.id });

        member.roles.add(mutedRole);

        if (time) {
            const expireDate = Date.now() + ms(time);

            mute.time = expireDate;

            await mute.save();

            setTimeout(async () => {
                const channel = <TextChannel>interaction.channel;
                channel.send({ content: `${member} was unmuted` });

                mute.expired = true;
                await mute.save();
            }, ms(time));
        }
    }

    async check(guild: Guild) {
        guild.members.cache.forEach(async member => {
            const mute = await this.get(member);
            if (!mute) return;
            if (mute.time) {
                const timeNow = Date.now();
                const channel = <TextChannel>guild.channels.cache.get(channels.text.publicLogs);

                if (mute.time < timeNow) {
                    this.unmute(member, channel);
                }

                const expireDate = mute.time - Date.now();

                setTimeout(async () => {
                    this.unmute(member, channel);
                }, expireDate);
            }
        });
    }

    async unmute(member: GuildMember, channel: TextChannel) {
        const mutedRole = <Role>member.guild.roles.cache.get(roles.muted);
        member.roles.remove(mutedRole);
        const mute = await this.get(member);
        mute.expired = true;
        await mute.save();
        if (!channel) return;
        const message = <Message>await channel.messages.fetch(mute.messageId);
        if (!message) return;
        message.edit({ content: `${member} was unmuted` });
    }

    async isMuted(member: GuildMember): Promise<boolean> {
        const mute = await this.get(member);
        if (mute) {
            if (mute.expired == true) return false;
            return true;
        }
        return false;
    }

    async get(member: GuildMember): Promise<IMute> {
        const mute = await Mute.findOne({ memberId: member.id }).sort({ _id: -1 });
        return <IMute>mute;
    }

    async getAll(member: GuildMember): Promise<IMute[]> {
        const mutes = Mute.find({ memberId: member.id }).sort({ _id: -1 });
        return mutes;
    }

    async delete(member: GuildMember) {
        await Mute.deleteOne({ memberId: member.id });
    }
}