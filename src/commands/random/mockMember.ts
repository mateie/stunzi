import { ContextMenuInteraction, Message, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Menu from '@classes/Menu';
import IMenu from '@interfaces/IMenu';

import Canvas, { Canvas as CanvasType } from 'canvas';

export default class MockMemberMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('Mock')
            .setType(3);
    }

    async run(interaction: ContextMenuInteraction) {
        const { targetId } = interaction;

        const channel = <TextChannel>interaction.channel;

        const message = <Message>await channel.messages.fetch(targetId);

        const mockMessage: string = message.content.split('').map((word, index) => {
            if (Number.isInteger(index / 2)) return word.toLowerCase();
            return word.toUpperCase();
        }).join('');

        try {
            const canvas = Canvas.createCanvas(1000, 600);
            const ctx = canvas.getContext('2d');

            const background = await Canvas.loadImage(`${process.cwd()}/images/spongebob.jpg`);

            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.font = this.applyText(canvas, mockMessage);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mockMessage, canvas.width / 3.1, 50);

            const attachment = this.client.util.attachment(canvas.toBuffer(), 'lol-haha.png');
            return interaction.reply({ files: [attachment] });
        } catch (err) {
            console.error(err);
        }
    }

    private applyText(canvas: CanvasType, text: string) {
        const ctx = canvas.getContext('2d');

        let fontSize = 120;

        do {
            ctx.font = `${fontSize -= 10}px sans-serif`;
        } while (ctx.measureText(text).width > canvas.height - 300);

        return ctx.font;
    }
}