import { ButtonInteraction, CommandInteraction, GuildMember } from 'discord.js';
import { ModalSubmitInteraction } from '@mateie/discord-modals';
import Client from '@classes/Client';
import Warn, { IWarn } from '@schemas/Warn';

export default class Warns {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
        member: GuildMember,
        reason: string
    ) {
        const by = <GuildMember>interaction.member;
        await Warn.create({ memberId: member.id, reason, by: by.id });

        interaction.reply({ content: `${member} was warned by ${by}, Reason: ${reason}` });
    }

    async get(member: GuildMember): Promise<IWarn> {
        const warn = await Warn.findOne({ memberId: member.id }).sort({ _id: -1 });
        return <IWarn>warn;
    }

    async getAll(member: GuildMember) {
        const warns = await Warn.find({ memberId: member.id }).sort({ _id: -1 });
        return warns;
    }

    async total(member: GuildMember) {
        const warns = await this.getAll(member);
        return warns.length;
    }

    async delete(member: GuildMember) {
        await Warn.deleteOne({ memberId: member.id });
    }
}