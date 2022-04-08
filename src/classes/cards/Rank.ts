import Client from "@classes/Client";
import { IMember } from "@schemas/Member";
import { Rank as CanvaRank } from "canvacord";
import { GuildMember } from "discord.js";

export default class Rank extends CanvaRank {
    readonly client: Client;

    constructor(client: Client) {
        super();
        this.client = client;
    }

    public async getRank(member: IMember): Promise<number | undefined> {
        const members = await this.client.database.get.allMembers();
        const sorted = members.sort((a, b) => b.xp - a.xp);

        const mapped = sorted.map((u, i) => ({
            id: u.id,
            xp: u.xp,
            rank: i + 1
        }));

        const rank = mapped.find(u => u.id == member.id)?.rank;

        return rank;
    }

    public async getRankCard(member: GuildMember) {
        const memberD = await this.client.database.get.member(member);
        const cardData = await this.client.cards.getCardData(memberD);

        const image = this
            .setBackground(Buffer.isBuffer(cardData.background) ? 'IMAGE' : 'COLOR', cardData.background)
            .setLevelColor(cardData.text)
            .setRankColor(cardData.text)
            .setAvatar(member.user.displayAvatarURL({ format: 'png' }))
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator)
            .setCurrentXP(cardData.currentXP)
            .setRequiredXP(cardData.neededXP)
            .setLevel(cardData.level, 'Level')
            .setRank(<number>cardData.rank, 'Rank')
            .renderEmojis(true)
            .setProgressBar(cardData.progressbar, 'COLOR');

        return image.build({});
    }
}