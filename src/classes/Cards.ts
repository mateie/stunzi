import { Guild, GuildMember } from "discord.js";
import Client from "./Client";
import Canvas from 'canvas';
import { IMember } from "../schemas/Member";
import { Rank } from 'canvacord';

export default class Cards {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async boosterThanks(member: GuildMember) {
        const { guild }: { guild: Guild } = member;
        const canvas = Canvas.createCanvas(800, 250);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(`${process.cwd()}/assets/images/nitroboost.png`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#800080';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = '30px cursive'
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(member.displayName, canvas.width / 2, canvas.height / 1.2);

        const avatar = await Canvas.loadImage(<string>member.avatarURL({ format: 'png' }));

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, 25, 200, 200);

        const attachment = this.client.util.attachment(canvas.toBuffer(), "booster.png");
        const embed = this.client.util.embed()
            .setAuthor({ name: 'Server Boosted', iconURL: <string>guild.iconURL({ dynamic: true }) })
            .setDescription('Thank you for boosting the server ^^')
            .setImage('attachment://booster.png');

        guild.systemChannel?.send({ embeds: [embed], files: [attachment] }).catch(console.error);
        member.send({ embeds: [embed] });
    }

    public async getCardData(member: IMember) {
        const currentXP = member.xp - this.client.xp.calculateXPForLevel(member.level);
        const neededXP = this.client.xp.calculateReqXP(member.xp) + currentXP;

        const rank = await this.getRank(member);

        const info = {
            rank,
            level: member.level,
            neededXP,
            currentXP,
            background: member.card.background,
            progressbar: member.card.progressbar,
            text: member.card.text
        };

        return info;
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
        const cardData = await this.getCardData(memberD);

        const image = new Rank()
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

        return image.build({
            fontX: 'Manrope',
            fontY: 'Manrope'
        });
    }
}