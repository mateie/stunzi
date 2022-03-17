import { GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import Client from "./Client";

import { Modal, TextInputComponent, showModal } from 'discord-modals';

export default class Util {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    actionRow(): MessageActionRow {
        return new MessageActionRow();
    }

    button(): MessageButton {
        return new MessageButton();
    }

    modal(): Object {
        return {
            component: new Modal(),
            show: showModal
        };
    }

    textInput(): TextInputComponent {
        return new TextInputComponent();
    }

    embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor('PURPLE')
            .setTimestamp(new Date())
            .setFooter({ text: 'Owned by Stealth and Bunzi' });
    }

    async memberActionRow(executer: GuildMember, member: GuildMember): Promise<any> {
        const blocked: boolean = false;
        const muted: boolean = false;

        const topRow = this.actionRow()
            .addComponents(
                this.button()
                    .setCustomId(`show_card`)
                    .setLabel('Show Card')
                    .setStyle('SECONDARY'),
            );

        const midRow = this.actionRow()
            .addComponents(
                this.button()
                    .setCustomId(`show_warns`)
                    .setLabel('Show Warns')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId(`show_blocks`)
                    .setLabel('Show Blocks')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId(`show_mutes`)
                    .setLabel('Show Mutes')
                    .setStyle('PRIMARY'),
            );

        const bottomRow = this.actionRow()
            .addComponents(
                this.button()
                    .setCustomId(`warn_member`)
                    .setLabel('Warn Member')
                    .setStyle('DANGER'),
                this.button()
                    .setCustomId(blocked ? `unblock_member` : `block_member`)
                    .setLabel(blocked ? 'Unblock Member' : 'Block Member')
                    .setStyle(blocked ? 'SUCCESS' : 'DANGER'),
                this.button()
                    .setCustomId(muted ? `unmute_member` : `mute_member`)
                    .setLabel(muted ? 'Unmute Member' : 'Mute Member')
                    .setStyle(muted ? 'SUCCESS' : 'DANGER'),
            );

        return executer.permissions.has('VIEW_AUDIT_LOG') ? [topRow, midRow, bottomRow] : [topRow];
    }
}