import Client from "../Client";
import { Region, RiotApiClient } from "@survfate/valorant.js";
import ValorantAssets from 'valorant-api-js';

import ValorantDB, { IValorant } from '../../schemas/ValorantDB';
import { CommandInteraction, Message, MessageActionRow, MessageEmbed } from "discord.js";

export default class Valorant {
    client: Client;
    assets: any;

    constructor(client: Client) {
        this.client = client;
        this.assets = new ValorantAssets();
    }

    async skinsEmbed(interaction: CommandInteraction, items: any, timeout = 12000) {
        let page = 0;

        const buttons = [
            this.client.util.button()
                .setCustomId('store_prev_item')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('store_next_item')
                .setLabel('➡️')
                .setStyle('SECONDARY'),
        ];

        const row = this.client.util.actionRow().addComponents(buttons);

        const promises = items.map(async (item: { id: any; name: any; cost: { amount: any; }; }) => {
            const { data: { displayIcon: image } } = await this.assets.getSkinLevels(item.id);
            const embed = this.client.util.embed()
                .setTitle('Your Valorant Store')
                .setDescription(`Item: ${item.name}\nCost: ${item.cost.amount} VP`)
                .setImage(image);

            return embed;
        });

        const embeds = await Promise.all(promises);

        if (interaction.deferred === false) {
            await interaction.deferReply();
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
            time: timeout,
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
        }).on('end', (_, reason) => {
            if (reason !== 'messageDelete') {
                const disabledRow = this.client.util.actionRow().addComponents(
                    buttons[0].setDisabled(true),
                    buttons[1].setDisabled(true)
                );

                currPage.edit({
                    embeds: [embeds[page]],
                    components: [disabledRow],
                });
            }
        });
    }

    async inventoryEmbed(interaction: CommandInteraction, items: any, timeout = 12000) {
        let page = 0;

        const topButtons = [
            this.client.util.button()
                .setCustomId('inventory_prev_item')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('inventory_next_item')
                .setLabel('➡️')
                .setStyle('SECONDARY'),
        ];

        const bottomButtons = [
            this.client.util.button()
                .setCustomId('inventory_identity')
                .setLabel('Identity')
                .setStyle('PRIMARY'),
            this.client.util.button()
                .setCustomId('inventory_gun_skins')
                .setLabel('Gun Skins')
                .setStyle('DANGER'),
            this.client.util.button()
                .setCustomId('inventory_sprays')
                .setLabel('Sprays')
                .setStyle('SUCCESS'),
            this.client.util.button()
                .setCustomId('inventory_cancel_embed')
                .setLabel('⛔')
                .setStyle('SECONDARY')
        ];

        const topRow = this.client.util.actionRow().addComponents(topButtons);
        const bottomRow = this.client.util.actionRow().addComponents(bottomButtons);

        const { Identity, GunSkins, Sprays } = items;

        const pageFilters = (i: { customId: string | null; }) =>
            i.customId === topButtons[0].customId ||
            i.customId === topButtons[1].customId;

        const menuFilters = (i: { customId: string | null; }) =>
            i.customId === bottomButtons[0].customId ||
            i.customId === bottomButtons[1].customId ||
            i.customId === bottomButtons[2].customId ||
            i.customId === bottomButtons[3].customId;


        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        const currPage = <Message>await interaction.editReply({
            components: [bottomRow]
        });

        const pageCollector = currPage.createMessageComponentCollector({
            filter: pageFilters,
            time: timeout
        });

        const menuCollector = currPage.createMessageComponentCollector({
            filter: menuFilters,
            time: timeout
        });

        let embeds: string | any[];

        pageCollector
            .on('collect', async (i: { customId: any; deferUpdate: () => any; editReply: (arg0: { embeds: any[]; components: MessageActionRow[]; }) => any; }) => {
                switch (i.customId) {
                    case topButtons[0].customId:
                        page = page > 0 ? --page : embeds.length - 1;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });
                        break;
                    case topButtons[1].customId:
                        page = page + 1 < embeds.length ? ++page : 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });
                        break;
                }
            });

        menuCollector
            .on('collect', async (i: { customId: any; deferUpdate: () => any; editReply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; }) => any; }) => {
                switch (i.customId) {
                    case bottomButtons[0].customId:
                        const { data: { largeArt: playerCard } } = await this.assets.getPlayerCards(Identity.PlayerCardID).catch(console.error);
                        const { data: { titleText: playerTitle } } = await this.assets.getPlayerTitles(Identity.PlayerTitleID).catch(console.error);
                        const accountLevel = Identity.HideAccountLevel ? 'Hidden' : Identity.AccountLevel;
                        const embed =
                            this.client.util.embed()
                                .setTitle(playerTitle)
                                .setImage(playerCard)
                                .setDescription(`Account Level: ${accountLevel}`);

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embed],
                            components: [bottomRow]
                        });

                        break;
                    case bottomButtons[1].customId:
                        const promisesSkins = Object.values(GunSkins).map(async id => {
                            const { data: skin } = await this.assets.getSkins(id);
                            const embed = this.client.util.embed()
                                .setTitle(skin.displayName)
                                .setImage(skin.chromas[0].fullRender);

                            return embed;
                        });

                        embeds = await Promise.all(promisesSkins);

                        page = 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });

                        break;
                    case bottomButtons[2].customId:
                        const promisesSprays = Object.values(Sprays).map(async id => {
                            const { data: spray } = await this.assets.getSprays(id);
                            const embed = this.client.util.embed()
                                .setTitle(spray.displayName)
                                .setImage(spray.animationGif ? spray.animationGif : spray.animationPng);

                            return embed;
                        });

                        embeds = await Promise.all(promisesSprays);

                        page = 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            components: [topRow, bottomRow]
                        });

                        break;
                    case bottomButtons[3].customId:
                        interaction.deleteReply();
                        pageCollector.stop();
                        return menuCollector.stop();
                }

                menuCollector.resetTimer();
            });
    }

    async isAuthenticated(member: any) {
        const valorant = <IValorant>await ValorantDB.findOne({ memberId: member.id });
        if (!member.valorant && !valorant) return false;
        return true;
    }

    async login(member: any) {
        const valorant = <IValorant>await ValorantDB.findOne({ memberId: member.id });
        if (!valorant) return;
        if (!valorant) return member.valorant = null;
        member.valorant = await new RiotApiClient({
            username: valorant.username,
            password: this.client.cypher.decrypt(valorant.password),
            region: Region[valorant.region as keyof typeof Region]
        }).login();
    }
}