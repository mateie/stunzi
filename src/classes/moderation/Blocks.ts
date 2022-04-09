import { ButtonInteraction, CommandInteraction, Guild, GuildMember, TextChannel } from 'discord.js';
import { ModalSubmitInteraction } from '@mateie/discord-modals';
import Client from '@classes/Client';
import Block, { IBlock } from '@schemas/Block';
import ms from 'ms';

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
        const block = await Block.create({ memberId: member.id, reason, by: by.id });

        interaction.reply({ content: `${member} was blocked${time ? ` for ${time}` : ''} from using commands by ${by}, Reason: **${reason}**` });

        if (time) {
            const expireDate = Date.now() + ms(time);

            block.time = expireDate;

            await block.save();

            setTimeout(async () => {
                const channel = <TextChannel>interaction.channel;
                channel.send({ content: `${member} was unblocked` });

                block.expired = true;
                await block.save();
            }, ms(time));
        }
    }

    async check(guild: Guild) {
        guild.members.cache.forEach(async member => {
            const block = await this.get(member);
            if (!block) return;
            if (block.time) {
                const timeNow = Date.now();

                if (block.time < timeNow) {
                    this.unblock(member);
                }

                const expireDate = block.time - Date.now();

                setTimeout(async () => {
                    this.unblock(member);
                }, expireDate);
            }
        });
    }

    async unblock(member: GuildMember) {
        const block = await this.get(member);
        block.expired = true;
        await block.save();
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