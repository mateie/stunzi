import { v2 } from 'cloudinary';
import { GuildMember } from 'discord.js';
import Client from './Client';

const { CLOUDINARY_API, CLOUDINARY_SECRET } = process.env;

export default class Cloudinary {
    client: Client;
    v2: typeof v2;

    constructor(client: Client) {
        this.client = client;



        this.v2 = v2;

        this.v2.config({
            cloud_name: 'mateie',
            api_key: CLOUDINARY_API,
            api_secret: CLOUDINARY_SECRET,
            secure: true,
        });
    }

    getSkinVideos(member: GuildMember, level: any) {
        return new Promise((resolve, reject) => {
            const filename = `${level.uuid}-${member.id}`;
            console.log(level);
            this.v2.uploader.upload(level.streamedVideo, {
                resource_type: 'video',
                format: 'mp4',
                eager_async: true,
                public_id: `${member.id}/${filename}`
            }, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
    }
}