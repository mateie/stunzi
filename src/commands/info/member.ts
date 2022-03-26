import { CommandInteraction, GuildMember } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../classes/interfaces/ICommand";
import moment from "moment";

export default class MemberCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('member')
            .setDescription('Information about a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription("Which user's information do you want to view?")
                    .setRequired(false)
            )
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember('member') ? <GuildMember>options.getMember('member') : <GuildMember>interaction.member;

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        const avatar = member.user.displayAvatarURL({ dynamic: true });
        const activities: string[] = [];
        const status = {
            emoji: ':white_circle:',
            text: 'Offline'
        };

        if (member.presence) {
            member.presence.activities.forEach(act => {
                const type = `***${act.type.charAt(0).toUpperCase() + act.type.split('_').join(' ').slice(1).toLowerCase()}***:`;

                activities.push(`
                    ${type} ${act.state ? this.client.util.list(act.state.split('; ')) : ''} ${act.type === 'PLAYING' ? act.name : ''} ${act.type === 'LISTENING' ? '-' : ''} ${act.details ? act.details : ''}
                `);
            });

            status.emoji = this.client.util.statusEmoji(member.presence.status);
            status.text = member.presence.status !== 'dnd' ? `${member.presence.status.charAt(0).toUpperCase()}${member.presence.status.slice(1)}` : 'Do Not Disturb';
        }

        const roles = member.roles.cache.filter(role => role.name !== '@everyone');
        const mappedRoles = roles.map(role => this.mentionRole(role.id)).join(', ');

        const embed = this.client.util.embed()
            .setAuthor({ name: member.user.tag, iconURL: avatar, url: avatar })
            .setColor(member.displayHexColor)
            .setURL(avatar)
            .setThumbnail(avatar)
            .setDescription(`** Status **: ${status.emoji} ${status.text} ${activities.length > 0 ? `\n**Activities**: ${activities.join('')}` : ''}`)
            .addFields([
                { name: 'ID', value: member.id },
                { name: 'Joined Server', value: `${moment(member.joinedAt).toString().substring(0, 15)} (${moment(member.joinedAt).fromNow()})`, inline: true },
                { name: 'Joined Discord', value: `${moment(member.user.createdAt).toString().substring(0, 15)} (${moment(member.user.createdAt).fromNow()})`, inline: true },
                { name: `Roles (${roles.size})`, value: mappedRoles }
            ]);

        const rows = await this.client.util.memberActionRow(<GuildMember>interaction.member, member);
        interaction.reply({ embeds: [embed], components: rows });
    }
}