import { CommandInteraction, GuildMember } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../classes/interfaces/ICommand";

export default class RankCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('rank')
            .setDescription("Look at your/someone's current rank")
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription("Who's profile do you want to view?")
                    .setRequired(false)
            )
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember('member') ? <GuildMember>options.getMember('member') : <GuildMember>interaction.member;

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        const image = await this.client.cards.getRankCard(member);
        const attachment = this.client.util.attachment(image, `rank-${member.user.username}.png`);
        interaction.reply({ files: [attachment] });
    }
}