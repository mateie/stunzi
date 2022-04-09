import Client from './Client';
import { BufferResolvable, ButtonInteraction, CommandInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { Modal, TextInputComponent, showModal as modalShow } from '@mateie/discord-modals';
import { Stream } from 'stream';

export default class Util {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    row(): MessageActionRow {
        return new MessageActionRow();
    }

    button(): MessageButton {
        return new MessageButton();
    }

    dropdown(): MessageSelectMenu {
        return new MessageSelectMenu();
    }

    modal(): Modal {
        return new Modal();
    }

    input(): TextInputComponent {
        return new TextInputComponent();
    }

    showModal(
        modal: Modal,
        options: {
            client: Client,
            interaction: Interaction
        }
    ): Promise<Modal> {
        return modalShow(modal, options);
    }

    durationMs(dur: string): number {
        return dur.split(':').map(Number).reduce((acc, curr) => curr + acc * 60) * 1000;
    }

    embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor('PURPLE')
            .setTimestamp(new Date())
            .setFooter({ text: 'Owned by Stealth and Bunzi' });
    }

    attachment(attachment: BufferResolvable | Stream, name?: string): MessageAttachment {
        return new MessageAttachment(attachment, name);
    }

    embedURL(title: string, url: string, display?: string) {
        return `[${title}](${url.replace(/\)/g, '%29')}${display ? ` "${display}"` : ''})`;
    }

    statusEmoji(type: string): string {
        switch (type) {
        case 'dnd':
            return ':red_circle:';
        case 'idle':
            return ':yellow_circle:';
        case 'online':
            return ':green_circle:';
        default:
            return ':white_circle:';
        }
    }

    chunk(arr: any, size: number): string[][] {
        const temp = [];
        for (let i = 0; i < arr.length; i += size) {
            temp.push(arr.slice(i, i + size));
        }

        return temp;
    }

    list(arr: string[], conj = 'and'): string {
        const len = arr.length;
        if (len == 0) return '';
        if (len == 1) return arr[0];
        return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
    }

    capFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    capEachFirstLetter(str: string): string {
        const temp: string[] = [];
        str.split(' ').forEach(str => {
            temp.push(this.capFirstLetter(str));
        });

        return temp.join(' ');
    }

    async memberActionRow(executer: GuildMember): Promise<MessageActionRow[]> {
        const blocked = false;
        const muted = false;

        const topRow = this.row()
            .addComponents(
                this.button()
                    .setCustomId('show_rank')
                    .setLabel('Show Rank')
                    .setStyle('SECONDARY'),
            );

        const midRow = this.row()
            .addComponents(
                this.button()
                    .setCustomId('show_warns')
                    .setLabel('Show Warns')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId('show_blocks')
                    .setLabel('Show Blocks')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId('show_mutes')
                    .setLabel('Show Mutes')
                    .setStyle('PRIMARY'),
            );

        const bottomRow = this.row()
            .addComponents(
                this.button()
                    .setCustomId('warn_member')
                    .setLabel('Warn Member')
                    .setStyle('DANGER'),
                this.button()
                    .setCustomId(blocked ? 'unblock_member' : 'block_member')
                    .setLabel(blocked ? 'Unblock Member' : 'Block Member')
                    .setStyle(blocked ? 'SUCCESS' : 'DANGER'),
                this.button()
                    .setCustomId(muted ? 'unmute_member' : 'mute_member')
                    .setLabel(muted ? 'Unmute Member' : 'Mute Member')
                    .setStyle(muted ? 'SUCCESS' : 'DANGER'),
            );

        return executer.permissions.has('VIEW_AUDIT_LOG') ? [topRow, midRow, bottomRow] : [topRow];
    }

    async pagination(interaction: ButtonInteraction | CommandInteraction, contents: string[] | string[][], title?: string, ephemeral = false, timeout = 12000) {
        let page = 0;

        const buttons = [
            this.button()
                .setCustomId('previous_page')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.button()
                .setCustomId('next_page')
                .setLabel('➡️')
                .setStyle('SECONDARY')
        ];

        const row = this.row().addComponents(buttons);

        const embeds = contents.map((content, index) => {
            const embed = this.embed();
            if (typeof content == 'object') {
                embed
                    .setDescription(content.join('\n'));
            } else {
                embed
                    .setDescription(content);
            }

            embed.setFooter({ text: `Page ${index + 1} of ${contents.length}` });
            if (title) embed.setTitle(title);

            return embed;
        });

        if (interaction.deferred === false) {
            await interaction.deferReply({ ephemeral });
        }

        const currPage = <Message>await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        });

        const filter = (i: { customId: string | null; }) =>
            i.customId === buttons[0].customId ||
            i.customId === buttons[1].customId;

        const collector = currPage.createMessageComponentCollector({
            filter,
            time: timeout
        });

        collector.on('collect', async i => {
            switch (i.customId) {
            case buttons[0].customId:
                page = page > 0 ? --page : embeds.length - 1;
                break;
            case buttons[1].customId:
                page = page + 1 < embeds.length ? ++page : 0;
                break;
            default:
                break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [row],
            });
            collector.resetTimer();
        })
            .on('end', (_, reason) => {
                if (reason !== 'messageDelete' && !ephemeral) {
                    const disabledRow = this.row().addComponents(
                        buttons[0].setDisabled(true),
                        buttons[1].setDisabled(true)
                    );

                    currPage.edit({
                        embeds: [embeds[page]],
                        components: [disabledRow],
                    });
                }
            });

        return currPage;
    }
}