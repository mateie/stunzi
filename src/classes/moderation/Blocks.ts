import { ButtonInteraction, CommandInteraction, Guild, GuildMember, Message, TextChannel } from 'discord.js';
import { ModalSubmitInteraction } from '@mateie/discord-modals';
import Client from '@classes/Client';
import Block, { IBlock } from '@schemas/Block';
import ms from 'ms';
import channels from '@data/channels';

export default class Blocks {
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
        const isBlocked = await this.isBlocked(member);
        if (isBlocked) return interaction.reply({ content: `${member} is already blocked`, ephemeral: true });
        const by = <GuildMember>interaction.member;

        interaction.reply({ content: `${member} was blocked${time ? ` for ${time}` : ''} from using commands by ${by}, Reason: **${reason}**`, ephemeral: true });
        const channel = <TextChannel>member.guild.channels.cache.get(channels.text.publicLogs);
        const message = await channel.send({ content: `${member} was blocked${time ? ` for ${time}` : ''} from using commands by ${by}, Reason: **${reason}**` });

        const block = await Block.create({ memberId: member.id, reason, by: by.id, messageId: message.id });

        if (time) {
            const expireDate = Date.now() + ms(time);

            block.time = expireDate;

            await block.save();

            setTimeout(async () => {
                await this.unblock(member, channel);
            }, ms(time));
        }
    }

    async check(guild: Guild) {
        guild.members.cache.forEach(async member => {
            const block = await this.get(member);
            if (!block) return;
            if (block.time) {
                const timeNow = Date.now();
                const channel = <TextChannel>guild.channels.cache.get(channels.text.publicLogs);

                if (block.time < timeNow) {
                    this.unblock(member, channel);
                }

                const expireDate = block.time - Date.now();

                setTimeout(async () => {
                    this.unblock(member, channel);
                }, expireDate);
            }
        });
    }

    async unblock(member: GuildMember, channel: TextChannel) {
        const block = await this.get(member);
        block.expired = true;
        await block.save();
        if (!channel) return;
        const message = <Message>await channel.messages.fetch(block.messageId);
        if (!message) return;
        message.edit({ content: `${member} was unblocked` });
    }

    async get(member: GuildMember): Promise<IBlock> {
        const block = await Block.findOne({ memberId: member.id }).sort({ _id: -1 });
        return <IBlock>block;
    }

    async getAll(member: GuildMember): Promise<IBlock[]> {
        const blocks = await Block.find({ memberId: member.id }).sort({ _id: -1 });
        return blocks;
    }

    async isBlocked(member: GuildMember): Promise<boolean> {
        const block = await this.get(member);
        if (block) {
            if (block.expired == true) return false;
            return true;
        }
        return false;
    }

    async delete(member: GuildMember): Promise<void> {
        await Block.deleteOne({ memberId: member.id });
    }
}