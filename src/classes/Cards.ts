import { Guild, GuildMember } from "discord.js";
import Client from "./Client";
import Canvas from 'canvas';

export default class Cards {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async boosterThanks(member: GuildMember) {
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
}