import Client from "@classes/Client";

import { Entitlements, ValClient, YourItems } from "valclient.js";
import { Collection, CommandInteraction, GuildMember, Message, MessageAttachment, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { Regions } from "valclient.js/dist/cjs/types/resources";
import ValorantAssets from 'valorant-api-js';

import Util from "./valorant/Util";
import { skinsIdMappedByGunName } from "valclient.js/dist/cjs/resources/skins";
import { UploadApiResponse } from "cloudinary";
import { GunsType, Levels, SkinsType } from "valclient.js/dist/cjs/types/loadout";
import { VariantSkin } from "valclient.js/dist/cjs/types/chroma";

export default class Valorant {
    client: Client;
    util: Util;
    assets: any;

    accounts: Collection<string, ValClient>

    constructor(client: Client) {
        this.client = client;
        this.util = new Util(client);

        this.assets = new ValorantAssets();
        this.accounts = new Collection();
    }

    /*async changeSkin(interaction: CommandInteraction, weapon: string, account: ValClient, timeout = 12000) {
        const member = <GuildMember>interaction.member;

        let skinPage = 0;

        const skins = skinsIdMappedByGunName[weapon as keyof typeof skinsIdMappedByGunName];
        const skinIds = Object.values(skins);

        const allSkins = await Promise.all(skinIds.map(async id => {
            const { data } = await this.assets.getSkins(id);
            return data;
        }));

        const playerLevels = <YourItems<Entitlements>>await account.store?.yourItems('skin_level');

        const playerSkins: Collection<string, any> = new Collection();

        playerLevels?.Entitlements.forEach((item: any) => {
            allSkins.forEach(skin => {
                if (skin.levels[0].uuid === item.ItemID) {
                    playerSkins.set(skin.displayName, skin);
                }
            });
        });

        const skinButtons = [
            this.client.util.button()
                .setCustomId('previous_skin')
                .setLabel('Previous Skin')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('select_skin')
                .setLabel('Select')
                .setStyle('SUCCESS'),
            this.client.util.button()
                .setCustomId('cancel_embed')
                .setLabel('Cancel')
                .setStyle('DANGER'),
            this.client.util.button()
                .setCustomId('next_skin')
                .setLabel('Next Skin')
                .setStyle('SECONDARY')
        ];

        const row = this.client.util.row().setComponents(skinButtons);

        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        const skinEmbeds = playerSkins.map((skin: any) => {
            return this.client.util.embed()
                .setAuthor({ name: skin.displayName })
                .setTitle(`You have ${playerSkins.size} skins for ${weapon} *Except Default*`)
                .setImage(skin.displayIcon);
        });

        const skinMessage = <Message>await interaction.editReply({
            embeds: [skinEmbeds[skinPage]],
            components: [row]
        });

        const filter = (i: MessageComponentInteraction) => (i.customId === skinButtons[0].customId ||
            i.customId === skinButtons[1].customId ||
            i.customId === skinButtons[2].customId ||
            i.customId === skinButtons[3].customId) && member.id === i.user.id;

        skinMessage.createMessageComponentCollector({
            filter
        })
            .on('collect', async i => {
                switch (i.customId) {
                    case 'previous_skin': {
                        skinPage = skinPage > 0 ? --skinPage : skinEmbeds.length - 1;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [skinEmbeds[skinPage]],
                            components: [row]
                        });
                        break;
                    }
                    case 'next_skin': {
                        skinPage = skinPage + 1 < skinEmbeds.length ? ++skinPage : 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [skinEmbeds[skinPage]],
                            components: [row]
                        });
                        break;
                    }
                    case 'cancel_embed': {
                        await i.deferUpdate();
                        await i.deleteReply();
                        break;
                    }
                    case 'select_skin': {
                        await i.deferUpdate();

                        const currentEmbed = <MessageEmbed>skinEmbeds[skinPage];
                        const chosenSkin = playerSkins.get(<string>currentEmbed.author?.name);

                        const decidedWeapon = <GunsType>weapon;
                        const decidedSkin = <SkinsType<GunsType>>chosenSkin.displayName;
                        let decidedLevel = <Levels>'Level 1';
                        let decidedColor = <VariantSkin<SkinsType<GunsType>>>'Default';

                        if (chosenSkin.levels.length > 1) {
                            let levelPage = 0;

                            const levelButtons = [
                                this.client.util.button()
                                    .setCustomId('previous_level')
                                    .setLabel('Previous Level')
                                    .setStyle('SECONDARY'),
                                this.client.util.button()
                                    .setCustomId('select_level')
                                    .setLabel('Select')
                                    .setStyle('SUCCESS'),
                                this.client.util.button()
                                    .setCustomId('cancel_embed')
                                    .setLabel('Cancel')
                                    .setStyle('DANGER'),
                                this.client.util.button()
                                    .setCustomId('next_level')
                                    .setLabel('Next Level')
                                    .setStyle('SECONDARY'),
                            ]

                            const levelRow = this.client.util.row().setComponents(levelButtons)

                            const levels = chosenSkin.levels;

                            skinButtons.forEach(button => button.setDisabled(true));
                            row.setComponents(skinButtons);
                            currentEmbed.setDescription('***Fetching Levels, Please Wait...***');

                            skinMessage.edit({ components: [row], embeds: [currentEmbed] });

                            const levelEmbeds = levels.map((level: any) => {
                                return this.client.util.embed()
                                    .setTitle(level.displayName.includes('Level') ? level.displayName : `${level.displayName} Level 1`);
                            });

                            const levelAttachments: MessageAttachment[] = await Promise.all(levels.map(async (level: any) => {
                                const video = <UploadApiResponse>await this.client.cloudinary.getSkinVideos(member, level).catch(console.error);
                                return this.client.util.attachment(video.secure_url, `${member.id}_${level.displayName.replace(' ', '_')}.mp4`);
                            }));

                            const filter = (i: MessageComponentInteraction) => (i.customId === levelButtons[0].customId ||
                                i.customId === levelButtons[1].customId ||
                                i.customId === levelButtons[2].customId ||
                                i.customId === levelButtons[3].customId) && member.id === i.user.id;

                            const levelMessage = <Message>await skinMessage.edit({
                                embeds: [levelEmbeds[levelPage]],
                                files: [levelAttachments[levelPage]],
                                components: [levelRow],
                            });

                            const collector = levelMessage.createMessageComponentCollector({
                                filter,
                            })
                                .on('collect', async i => {
                                    switch (i.customId) {
                                        case 'previous_level': {
                                            levelButtons.forEach(button => button.setDisabled(true));
                                            await skinMessage.edit({
                                                components: [levelRow]
                                            });

                                            levelPage = levelPage > 0 ? --levelPage : levelEmbeds.length - 1;

                                            await i.deferUpdate();
                                            await i.editReply({
                                                embeds: [levelEmbeds[levelPage]],
                                                files: [levelAttachments[levelPage]],
                                                components: [levelRow.setComponents(levelButtons.map(button => button.setDisabled(false)))]
                                            });
                                            break;
                                        }
                                        case 'next_level': {
                                            levelButtons.forEach(button => button.setDisabled(true));
                                            await skinMessage.edit({
                                                components: [levelRow]
                                            });

                                            levelPage = levelPage + 1 < levelEmbeds.length ? ++levelPage : 0;

                                            await i.deferUpdate();
                                            await i.editReply({
                                                embeds: [levelEmbeds[levelPage]],
                                                files: [levelAttachments[levelPage]],
                                                components: [levelRow.setComponents(levelButtons.map(button => button.setDisabled(false)))]
                                            });
                                            break;
                                        }
                                        case 'select_level': {
                                            const chosenLevel = chosenSkin.levels[levelPage];
                                            decidedLevel = !chosenLevel.displayName.includes('Level')
                                                ? 'Level 1'
                                                : chosenLevel.displayName.split(' ').slice(-2).join(' ');

                                            await i.deferUpdate();
                                            collector.stop();
                                            break;
                                        }
                                    }
                                })
                                .on('end', i => {
                                    console.log(i);
                                });
                        }
                        break;
                    }
                }
            });
    }*/
    async changeSkin(interaction: CommandInteraction, weapon: string, account: ValClient, timeout = 12000) {
        const member = <GuildMember>interaction.member;

        let page = 0;

        const skins = Object.values(skinsIdMappedByGunName[weapon as keyof typeof skinsIdMappedByGunName]);

        const allSkins = await Promise.all(skins.map(async (id: string) => {
            const { data } = await this.assets.getSkins(id);
            return data;
        }));

        const playerLevels = <YourItems<Entitlements>>await account.store?.yourItems('skin_level');

        const playerSkins: Collection<string, any> = new Collection();

        playerLevels.Entitlements.forEach((item: any) => {
            allSkins.forEach(skin => {
                skin.levels.forEach((level: any) => {
                    if (level.uuid === item.ItemID) playerSkins.set(skin.displayName, skin);
                });
            });
        });

        if (playerSkins.size < 1) return interaction.reply({ content: `Couldn\'t find skins for ${weapon} in your loadout`, ephemeral: true });

        const buttons = [
            this.client.util.button()
                .setCustomId('nav_previous')
                .setLabel('Previous')
                .setStyle('SECONDARY'),
            this.client.util.button()
                .setCustomId('select_skin')
                .setLabel('Select')
                .setStyle('SUCCESS'),
            this.client.util.button()
                .setCustomId('cancel_selection')
                .setLabel('Cancel')
                .setStyle('DANGER'),
            this.client.util.button()
                .setCustomId('nav_next')
                .setLabel('Next')
                .setStyle('SECONDARY')
        ];

        const row = this.client.util.row().setComponents(buttons);

        if (interaction.deferred === false) {
            await interaction.deferReply();
        }

        let embeds = playerSkins.map((skin: any) => {
            return this.client.util.embed()
                .setAuthor({ name: skin.displayName })
                .setTitle(`You have ${playerSkins.size} skins for ${weapon} *Except Defaults*`)
                .setImage(skin.displayIcon);
        });

        let attachments: MessageAttachment[] = [];

        const message = <Message>await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        });

        const filter = (i: MessageComponentInteraction) =>
            (i.customId === 'nav_previous' ||
                i.customId === 'nav_next' ||
                i.customId === 'select_skin' ||
                i.customId === 'select_level' ||
                i.customId === 'select_color' ||
                i.customId === 'cancel_selection') &&
            member.id === i.user.id;

        const dWeapon = <GunsType>weapon;
        let dSkin: SkinsType<GunsType> | null = null;
        let dLevel = <Levels>'Level 1';
        let dColor = <VariantSkin<SkinsType<GunsType>>>'Default';

        const collector = message.createMessageComponentCollector({
            filter,
        })
            .on('collect', async i => {
                switch (i.customId) {
                    case 'nav_previous': {
                        buttons.forEach(button => button.setDisabled(true));
                        row.setComponents(buttons);
                        await message.edit({
                            components: [row],
                        });

                        page = page > 0 ? --page : embeds.length - 1;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            files: attachments[page] ? [attachments[page]] : [],
                            components: [row.setComponents(buttons.map(button => button.setDisabled(false)))],
                        });
                        break;
                    }
                    case 'nav_next': {
                        buttons.forEach(button => button.setDisabled(true));
                        row.setComponents(buttons);
                        await message.edit({
                            components: [row],
                        });

                        page = page + 1 < embeds.length ? ++page : 0;

                        await i.deferUpdate();
                        await i.editReply({
                            embeds: [embeds[page]],
                            files: attachments[page] ? [attachments[page]] : [],
                            components: [row.setComponents(buttons.map(button => button.setDisabled(false)))],
                        });
                        break;
                    }
                    case 'cancel_selection': {
                        await i.deferUpdate();
                        await i.deleteReply();
                        break;
                    }
                    case 'select_skin': {
                        await i.deferUpdate();

                        const cEmbed = <MessageEmbed>embeds[page];
                        const chosenSkin = playerSkins.get(<string>cEmbed.author?.name);

                        page = 0;

                        dSkin = <SkinsType<GunsType>>chosenSkin.displayName;

                        if (chosenSkin.levels.length > 1) {
                            cEmbed.setDescription('***Fetching Levels, Please Wait...***');
                            row.components.forEach(button => button.setDisabled(true));
                            row.setComponents(buttons);

                            buttons[1].setCustomId('select_level');

                            const levels = chosenSkin.levels;

                            message.edit({ components: [row], embeds: [cEmbed] });

                            embeds = levels.map((level: any, index: number) => {
                                return this.client.util.embed()
                                    .setAuthor({ name: chosenSkin.displayName })
                                    .setTitle(`Level ${index + 1}`);
                            });

                            attachments = await Promise.all(levels.map(async (level: any, index: number) => {
                                try {
                                    const video = <UploadApiResponse>await this.client.cloudinary.getSkinVideos(member, level);
                                    return this.client.util.attachment(video.secure_url, `${member.id}_${level.displayName.replace(' ', '_')}.mp4`);
                                } catch (err) {
                                    console.error(err);
                                    embeds[index].setDescription(this.client.util.embedURL('Video for the level', level.streamedVideo));
                                    return null;
                                }
                            }));

                            await message.edit({
                                embeds: [embeds[page]],
                                files: attachments[page] ? [attachments[page]] : [],
                                components: [row.setComponents(buttons.map(button => button.setDisabled(false)))],
                            });
                        } else {
                            attachments = [];

                            if (chosenSkin.chromas.length > 1) {
                                buttons[1].setCustomId('select_color');

                                const colors = chosenSkin.chromas;

                                message.edit({ components: [row], embeds: [cEmbed] });

                                embeds = colors.map((color: any) => {
                                    const colorName = color.displayName.split('\n')[1] ? color.displayName.split('\n')[1].replace('(', '').replace(')', '') : 'Default';
                                    return this.client.util.embed()
                                        .setAuthor({ name: chosenSkin.displayName })
                                        .setTitle(colorName)
                                        .setImage(color.fullRender);
                                });

                                await message.edit({
                                    embeds: [embeds[page]],
                                    attachments: [],
                                    components: [row]
                                });
                            } else {
                                collector.stop();
                            }
                        }
                        break;
                    }
                    case 'select_level': {
                        await i.deferUpdate();

                        attachments = [];

                        const cEmbed = <MessageEmbed>embeds[page];
                        const chosenSkin = playerSkins.get(<string>cEmbed.author?.name);

                        page = 0;

                        const chosenLevel = chosenSkin.levels.find((level: any) => level.displayName.includes(cEmbed.title));
                        dLevel = chosenLevel.displayName.includes('Level') ? chosenLevel.displayName.split(' ').slice(-2).join(' ') : 'Level 1';

                        if (chosenSkin.chromas.length > 1) {
                            buttons[1].setCustomId('select_color');

                            const colors = chosenSkin.chromas;

                            message.edit({ components: [row], embeds: [cEmbed] });

                            embeds = colors.map((color: any) => {
                                const colorName = color.displayName.split('\n')[1] ? color.displayName.split('\n')[1].replace('(', '').replace(')', '') : 'Default';
                                return this.client.util.embed()
                                    .setAuthor({ name: chosenSkin.displayName })
                                    .setTitle(colorName)
                                    .setImage(color.fullRender);
                            });

                            await message.edit({
                                embeds: [embeds[page]],
                                attachments: [],
                                components: [row]
                            });
                        } else {
                            collector.stop();
                        }
                        break;
                    }
                    case 'select_color': {
                        await i.deferUpdate();

                        const cEmbed = <MessageEmbed>embeds[page];
                        const chosenSkin = playerSkins.get(<string>cEmbed.author?.name);

                        page = 0;

                        const chosenColor = chosenSkin.chromas.find((chroma: any) => chroma.displayName.includes(cEmbed.title));
                        dColor = chosenColor ? chosenColor.displayName.split('\n')[1].replace('(', '').replace(')', '').split(' ')[2] : 'Default';
                        collector.stop('finished');
                    }
                }
            })
            .on('end', async (i, reason) => {
                if (reason === 'finished') {
                    await account.loadout?.changeGunSkin(dWeapon, <SkinsType<GunsType>>dSkin, dLevel, dColor);
                    const int = <MessageComponentInteraction>i.last();
                    await int.editReply({
                        content: `Skin for ***${dWeapon}*** was set to: ***Skin*** - **${dSkin}**, ***Level*** - **${dLevel}**, ***Color*** - **${dColor}**`,
                        embeds: [],
                        attachments: [],
                        components: [],
                    });
                }
            })
    }

    async login(member: GuildMember, username: string, password: string, region: Regions) {
        const auth = new ValClient();

        try {
            await auth.init({
                auth: {
                    username,
                    password: this.client.cypher.decrypt(password),
                },
                region,
            });

            this.accounts.set(member.id, auth);
            return true;
        } catch (err: any) {
            console.error(err);
            return err;
        }
    }
}