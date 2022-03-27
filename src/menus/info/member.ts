import { ContextMenuInteraction, Guild, GuildMember } from 'discord.js';
import Client from '../../classes/Client';
import Menu from '../../classes/Menu';
import IMenu from '../../classes/interfaces/IMenu';

export default class MemberMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('Member Info')
            .setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        const guild = <Guild>interaction.guild;
        const member = <GuildMember>await guild.members.fetch(interaction.targetId);

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
            .setDescription(`**Status**: ${status.emoji} ${status.text} ${activities.length > 0 ? `\n**Activities**: ${activities.join('')}` : ''}`)
            .addFields([
                { name: 'ID', value: member.id },
                { name: 'Joined Server', value: `<t:${Math.floor(<number>member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Joined Discord', value: `<t:${Math.floor(<number>member.user.createdTimestamp / 1000)}`, inline: true },
                { name: `Roles (${roles.size})`, value: mappedRoles }
            ]);

        const rows = await this.client.util.memberActionRow(<GuildMember>interaction.member, member);
        interaction.reply({ embeds: [embed], components: rows });
    }
}