import { GuildMember, Message } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

export default class MemberXPEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {
        const member = <GuildMember>message.member;

        if (message.author.bot) return;

        const today = new Date();
        const ifWeekend = today.getDay() == 6 || today.getDay() == 0;

        const give = ifWeekend ? Math.floor(Math.random() * 75) * 2 : Math.floor(Math.random() * 75);
        const rand = ifWeekend ? Math.round(Math.random() * 3) : Math.round(Math.random() * 4);
        if (rand == 0) {
            const currentLevel = await this.client.xp.getLevel(member);
            const currentXP = await this.client.xp.getXP(member);
            const requiredXP = currentLevel * currentLevel * 100 + 100;
            await this.client.xp.giveXP(member, give);
            if (currentXP + give >= requiredXP) {
                await this.client.xp.levelUp(member);
                if (ifWeekend) {
                    return message.channel.send(`${message.author}, You have leveled up to **Level ${await this.client.xp.getLevel(member)}** (It's a weekend so you get double xp :>)`).then(msg => setTimeout(() => msg.delete(), 2000));
                }
                return message.channel.send(`${message.author}, You have leveled up to **Level ${await this.client.xp.getLevel(member)}**`).then(msg => setTimeout(() => msg.delete(), 2000));
            }
        }
    }
}