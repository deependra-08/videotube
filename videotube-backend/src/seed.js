// Seeds the database with sample data so you can see the app working
// end-to-end without manually registering accounts and uploading videos.
//
// Uses openly-licensed sample videos (Blender Foundation's open movies,
// CC BY 3.0) hosted on Google's public demo bucket, and placeholder
// images from picsum.photos / ui-avatars.com - so no Cloudinary upload
// or copyrighted content is needed. These URLs are stored directly on
// the documents, exactly like a real Cloudinary URL would be.
//
// Usage:
//   node src/seed.js          -> adds sample data
//   node src/seed.js --reset  -> wipes existing data first, then seeds

import "dotenv/config";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { User } from "./models/user.models.js";
import { Video } from "./models/video.models.js";
import { Comment } from "./models/comment.models.js";
import { Like } from "./models/like.models.js";
import { Subscription } from "./models/subscription.models.js";
import { Playlist } from "./models/playlist.models.js";
import { Tweet } from "./models/tweet.models.js";

const SAMPLE_VIDEOS = [
    {
        title: "Big Buck Bunny",
        description: "A giant rabbit deals with three bullying rodents, in this Blender Foundation open movie.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://picsum.photos/seed/bigbuckbunny/640/360",
        duration: 596,
    },
    {
        title: "Elephants Dream",
        description: "The first open movie made entirely with open source tools, by the Orange Open Movie Project.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://picsum.photos/seed/elephantsdream/640/360",
        duration: 653,
    },
    {
        title: "For Bigger Blazes",
        description: "A short demo clip about a chromecast-ready streaming experience.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://picsum.photos/seed/biggerblazes/640/360",
        duration: 15,
    },
    {
        title: "For Bigger Escape",
        description: "Another short demo clip, great for testing playback and thumbnails.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscape.mp4",
        thumbnail: "https://picsum.photos/seed/biggerescape/640/360",
        duration: 15,
    },
    {
        title: "Sintel",
        description: "A lonely young woman, Sintel, helps and befriends a dragon.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://picsum.photos/seed/sintel/640/360",
        duration: 888,
    },
    {
        title: "Tears of Steel",
        description: "In a future Amsterdam, a group of scientists and warriors gather to save the world.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://picsum.photos/seed/tearsofsteel/640/360",
        duration: 734,
    },
];

const SAMPLE_USERS = [
    { fullname: "Ava Ortiz", username: "ava", email: "ava@example.com" },
    { fullname: "Noah Kim", username: "noah", email: "noah@example.com" },
    { fullname: "Maya Chen", username: "maya", email: "maya@example.com" },
    { fullname: "Leo Fischer", username: "leo", email: "leo@example.com" },
];

const SAMPLE_PASSWORD = "password123";

const avatarFor = (username) =>
    `https://ui-avatars.com/api/?name=${username}&background=e8a33d&color=121013&size=256`;

async function seed() {
    const shouldReset = process.argv.includes("--reset");

    await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
    console.log("Connected to MongoDB");

    if (shouldReset) {
        await Promise.all([
            User.deleteMany({}),
            Video.deleteMany({}),
            Comment.deleteMany({}),
            Like.deleteMany({}),
            Subscription.deleteMany({}),
            Playlist.deleteMany({}),
            Tweet.deleteMany({}),
        ]);
        console.log("Cleared existing collections");
    }

    // Users (password hashing happens in the User pre-save hook)
    const users = [];
    for (const u of SAMPLE_USERS) {
        const existing = await User.findOne({ username: u.username });
        if (existing) {
            users.push(existing);
            continue;
        }
        const user = await User.create({
            ...u,
            password: SAMPLE_PASSWORD,
            avatar: avatarFor(u.username),
            coverImage: `https://picsum.photos/seed/${u.username}-cover/1200/300`,
        });
        users.push(user);
    }
    console.log(`Users ready: ${users.map((u) => u.username).join(", ")}`);

    // Videos, spread across users
    const videos = [];
    for (let i = 0; i < SAMPLE_VIDEOS.length; i++) {
        const owner = users[i % users.length];
        const v = SAMPLE_VIDEOS[i];
        const existing = await Video.findOne({ title: v.title, owner: owner._id });
        if (existing) {
            videos.push(existing);
            continue;
        }
        const video = await Video.create({
            ...v,
            owner: owner._id,
            views: Math.floor(Math.random() * 5000),
            isPublished: true,
        });
        videos.push(video);
    }
    console.log(`Videos ready: ${videos.length}`);

    // Subscriptions: everyone subscribes to everyone else
    for (const subscriber of users) {
        for (const channel of users) {
            if (subscriber._id.equals(channel._id)) continue;
            await Subscription.findOneAndUpdate(
                { subscriber: subscriber._id, channel: channel._id },
                { subscriber: subscriber._id, channel: channel._id },
                { upsert: true }
            );
        }
    }
    console.log("Subscriptions ready");

    // Comments + likes on each video, from users other than the owner
    for (const video of videos) {
        const commenters = users.filter((u) => !u._id.equals(video.owner));
        for (const commenter of commenters) {
            await Comment.findOneAndUpdate(
                { video: video._id, owner: commenter._id },
                {
                    video: video._id,
                    owner: commenter._id,
                    content: `Really enjoyed this, ${commenter.fullname.split(" ")[0]} here!`,
                },
                { upsert: true }
            );
            await Like.findOneAndUpdate(
                { video: video._id, likedBy: commenter._id },
                { video: video._id, likedBy: commenter._id },
                { upsert: true }
            );
        }
    }
    console.log("Comments and likes ready");

    // Tweets / community posts
    for (const user of users) {
        await Tweet.findOneAndUpdate(
            { owner: user._id, content: `Hey everyone, ${user.fullname.split(" ")[0]} here — new upload coming soon!` },
            { owner: user._id, content: `Hey everyone, ${user.fullname.split(" ")[0]} here — new upload coming soon!` },
            { upsert: true }
        );
    }
    console.log("Community posts ready");

    // A sample playlist for the first user
    const owner = users[0];
    await Playlist.findOneAndUpdate(
        { name: "Watch later", owner: owner._id },
        {
            name: "Watch later",
            description: "Videos to watch later",
            owner: owner._id,
            videos: videos.slice(0, 3).map((v) => v._id),
        },
        { upsert: true }
    );
    console.log("Playlist ready");

    console.log("\nDone! Sample login credentials:");
    SAMPLE_USERS.forEach((u) => console.log(`  username: ${u.username}  password: ${SAMPLE_PASSWORD}`));

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});