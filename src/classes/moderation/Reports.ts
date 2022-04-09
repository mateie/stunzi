import Client from '@classes/Client';
import channels from '@data/channels';
import { ModalSubmitInteraction } from '@mateie/discord-modals';
import { ButtonInteraction, CommandInteraction, Guild, GuildMember, TextChannel } from 'discord.js';

export default class Reports {
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
        const guild = <Guild>interaction.guild;
        const dbMember = await this.client.database.get.member(member);

        dbMember.reports.unshift({
            by: by.id,
            reason,
        });

        await dbMember.save();

        const embed = this.client.util.embed()
            .setAuthor({ name: by.user.tag, iconURL: <string>by.displayAvatarURL({ dynamic: true }) })
            .setDescription(`
                ***${by.user}*** Reported ***${member}***
                **Reason**: ${reason}
            `);
        
        const reportChannel = <TextChannel>guild.channels.cache.get(channels.text.staff.memberReports);

        reportChannel.send({ embeds: [embed] });

        return interaction.reply({ content: `Reported ${member}`, ephemeral: true });
    }

    async get(member: GuildMember) {
        const dbMember = await this.client.database.get.member(member);

        return dbMember.reports;
    }

    async total(member: GuildMember) {
        const dbMember = await this.client.database.get.member(member);

        return dbMember.reports.length;
    }

    async delete(member: GuildMember) {
        const dbMember = await this.client.database.get.member(member);

        dbMember.reports.shift();

        await dbMember.save();
    }
}