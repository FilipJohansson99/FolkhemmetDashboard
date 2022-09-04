import type {
    Song as SongType, //
    Server as ServerType,
    Playlist as PlaylistType,
    User as UserType,
    ActualSong,
    ServerSettings,
} from "@/types";
import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
} from "@material-tailwind/react";

import * as ytMusic from 'node-youtube-music';




import * as Menu from "@/components/Menu";
import * as Song from "@/components/Song";
const requestIp = require('request-ip');
import Router from 'next/router'
import SearchInput from "@/components/SearchInput";
import { useState, useEffect } from "react";
import io from 'socket.io-client';
import Canvas from "@/components/playlistIcon";
let socket;
const fetch = require("node-fetch");


const Divider = () => <hr className="border-2 border-green w-full" />;

export async function getServerSideProps({ req }) {
    let bots = [
        {
        image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
        name: "Green-bot",
        nameShort:"gb",
        id: "783708073390112830",
        url: "http://185.183.33.10:8000"
    },  {
            image: "https://cdn.discordapp.com/attachments/904438715974287440/980104864866652240/979380073134161980.webp",
            name: "Green-bot Premium",
            nameShort:"gb4",
            id: "913065900125597706",
            url: "http://185.183.33.10:8090"
        },
    ]
    let redirectPlanned = null
    const clientIp = requestIp.getClientIp(req);
    const f = await fetch(`http://green-bot.app/auth/api?ip=${clientIp}`);
    let session = await f.json()
    console.log(req.url)
    const serverId = req.url.includes("bot")?req.url.split("/")[2].split("?")[0] :req.url.split("/")[2]
    if (!session || session.error) {
        redirectPlanned = {
            permanent: false,
            destination: 'https://green-bot.app/profile?to=' + serverId + '',
        }
    }
    let data;
    if (session && !session.error) {
        if (!session.guilds.find(g => g.id ===serverId)) {
            redirectPlanned = {
                permanent: false,
                destination: 'https://green-bot.app/profile',
            }
        }
    }

    let retunable = redirectPlanned ? { redirect: redirectPlanned } : {
        props: {
            ctx: {
                servId: serverId,
                bot: req.url.includes("bot")?bots.find(b=>b.nameShort === req.url.split("=")[1]) ||bots[0]:bots[0],
                user: session,
                ip: clientIp,
                data: data,
            }
        },
    }
    return retunable
}

export default function Home({ ctx }) {
    const [sidebarOpen, setSidebarOpen] = useState<false | "right" | "left">(false);
    let [lastServer, setLastServer] = useState<ServerType>({
        image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
        name: "Green-bot",
        id: "783708073390112830",
        url: "http://185.183.33.10:8000"
    });
    const [ActualServer, seActualServer] = useState<ServerType>(null);
    const [currentServer, setCurrentServer] = useState<ServerType>({
        image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
        name: "Green-bot",
        id: "783708073390112830",
        url: "http://185.183.33.10:8000"
    });
    let [currentVoice, setCurrentVoice] = useState();
    let [currentBotVoice, setCurrentBotVoice] = useState<any>();

    const [currentSettings, setCurrentSettings] = useState<ServerSettings>(null);
    const [currentUser, setCurrentUser] = useState<UserType>(null);
    const [currentSong, setCurrentSong] = useState<SongType>(null);

    const [lastButtonUsed, setLastButtonUsed] = useState<number>(null);

    const [successMessage, setSuccessMessage] = useState<String>(null);

    const [currentResults, setCurrentResults] = useState<SongType[]>();

    const [currentSearch, setCurrentSearch] = useState<string>("");
    const [SearchState, setSearchState] = useState<boolean>(null);

    const [PlayerState, setPlayerState] = useState<boolean>();
    useEffect(() => {
        fetch('/api/socket').then(res => {
            socket = io();

            socket.on("connect", () => {
                console.log(`${socket.id} is now ready to go to space!!`)
                socket.emit("register", {
                    user: ctx.user, ip: ctx.ip, serverId: ctx.servId, server: ctx.bot, socketId: socket.id
                })
                socket.on("data_send", (data) => {
console.log(data)
                    seActualServer(data.server);
                    let a = data.user.voice;
                    let b = data.queue ? data.queue.channelId : null;
                    setCurrentVoice(a);
                    setCurrentBotVoice(b)
                    currentBotVoice = b;
                    currentVoice = a;

                    setCurrentUser(data.user);
                    setCurrentSettings(data.server.settings);
                    const queue = data.queue;

                    let pls = [{
                        id: "liked-songs",
                        image: "/images/playlist-loved.png",
                        label: "Liked Songs",
                        tracks: data.userdb.songs
                    }]

                    data.userdb.playlists.forEach(pl => {
                        pls.push({
                            id: pl.name,
                            image: pl.tracks ? pl.tracks.find(tr => tr.info && tr.info.image && tr.info.image !== "")  ?  pl.tracks.find(tr => tr.info && tr.info.image && tr.info.image !== "").info.image:"https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg": "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                            label: pl.name,
                            tracks: pl.tracks
                        })
                    })
                    setPlaylists(pls);
                    setRecentSongs(queue ? queue.recent?.map(s => {
                        return s && s.info ? {
                            id: s.info.uri,
                            image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                            title: s.info.title,
                            artist: s.info.author,
                            lavalink: s,

                            duration: s.info.duration,
                            requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                            requesterAvatar: s.info.requester ? s.info.requester.avatar : currentUser.avatar,
                        } : ""
                    }) : [])
                    setCurrentSong(queue && queue.current ? {
                        id: queue.current.info.uri,
                        image: queue.current.info.image ? queue.current.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                        title: queue.current.info.title,
                        artist: queue.current.info.author,
                        duration: queue.current.info.duration,
                        loop: queue.loop,
                        lavalink: queue.current,
                        durationMs: queue.current.info.length,
                        percentPlayed: 0,
                        currentDuration: 0,
                        requesterName: queue.current.info.requester ? queue.current.info.requester.name : currentUser.username,
                        isPlaying: queue.paused ? false : true,
                        requesterAvatar: queue.current.info.requester ? queue.current.info.requester.avatar ? queue.current.info.requester.avatar : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg" : currentUser.avatar,
                    } : null)

                    setSongQueues(
                        queue ? queue.incoming.map(s => {
                            return {
                                id: s.info.uri,
                                image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                                title: s.info.title,
                                artist: s.info.author,
                                lavalink: s,

                                duration: s.info.duration,
                                requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                                requesterAvatar: s.info.requester ? s.info.requester.avatar : currentUser.avatar,
                            }
                        }) : []
                    )
                    let err;
                    let st = true;

                    let botVc = queue?.channelID;
                    if (!botVc && !data.user.voice) {
                        st = null;
                        err = "Please go on discord and join a voice channel to start listening!"
                    } else if (botVc && !data.user.voice) {
                        st = null
                        err = "Please go on discord and join the voice channel Green-bot is in"
                    } else if (botVc && data.user.voice && botVc !== data.user.voice) {
                        st = null;
                        err = "Please go on discord and join the same voice channel as Green-bot!"
                    } else if (queue && !queue.incoming.length) {
                        err = "Nothing queued yet! Add some songs using the search bar to start the party!"
                    }
                    setPlayerState(st)
                    setErrorMessage(err)
                })
            })
            socket.on("reconnect", () => {
                console.log(`${socket.id} is now back to life!!`)
                setErrorMessage(null)

            })
            socket.on("search_result", (results) => {
                setCurrentResults(results)

            })
            socket.on("disconnect", (reason) => {
                setErrorMessage("The connection with the server has been lost due to bad connection... Attempting to reconnect. If it's still not working. refresh the page...")

            })
            socket.on("close", (reason) => {
                console.log("Socket closed.")
                setErrorMessage("The connection with the server has been lost due to bad connection and the page won't reconnect. Try to refresh the page to reconnect.")
                setSongQueues([])
                setCurrentSong(null)
                setRecentSongs([])
                setPlayerState(null)
                setPlaylists([])
                setServers([])


            })
            socket.on("change_bot", async ctx => {
                console.log("change")
                setCurrentSong(ctx.data.queue && ctx.data.queue.current ? {
                    id: ctx.data.queue.current.info.uri,
                    image: ctx.data.queue.current.info.image ? ctx.data.queue.current.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: ctx.data.queue.current.info.title,
                    artist: ctx.data.queue.current.info.author,
                    duration: ctx.data.queue.current.info.duration,
                    loop: ctx.data.queue.loop,
                    lavalink: ctx.data.queue.current,
                    durationMs: ctx.data.queue.current.info.length,
                    percentPlayed: ((ctx.data.queue.current.info.position / 1000) / (ctx.data.queue.current.info.length / 1000) * 100),
                    currentDuration: ctx.data.queue.current.info.position,
                    requesterName: ctx.data.queue.current.info.requester ? ctx.data.queue.current.info.requester.name : currentUser.username,
                    isPlaying: ctx.data.queue.paused ? false : true,
                    requesterAvatar: ctx.data.queue.current.info.requester ? ctx.data.queue.current.info.requester.avatar ? ctx.data.queue.current.info.requester.avatar : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg" : currentUser.avatar,
                } : null)
                let newUser = currentUser;
                newUser.voice = ctx.data.exists.voice
                newUser.voted = true
                newUser.isDj = ctx.data.exists.dj
                setCurrentUser(newUser)

                setRecentSongs(ctx.data.queue ? ctx.data.queue.recent?.map(s => {
                    return s && s.info ? {
                        id: s.info.uri,
                        image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                        title: s.info.title,
                        artist: s.info.author,
                        lavalink: s,

                        duration: s.info.duration,
                        requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                        requesterAvatar: s.info.requester ? s.info.requester.avatar : currentUser.avatar,
                    } : ""
                }) : [])
                let pls = [{
                    id: "liked-songs",
                    image: "/images/playlist-loved.png",
                    label: "Liked Song",
                    tracks: ctx.data.exists.db.songs
                }]
                ctx.data.exists.db.playlists.forEach(pl => {
                    pls.push({
                        id: pl.name,
                        image: "/images/playlist-loved.png",
                        label: pl.name,
                        tracks: pl.tracks
                    })
                })
                setPlaylists(pls)
                setSongQueues(ctx.data.queue ? ctx.data.queue.incoming.map(s => {
                    return {
                        id: s.info.uri,
                        image: s.info?.image,
                        title: s.info.title,
                        artist: s.info.author,
                        lavalink: s,

                        duration: s.info.duration,
                        requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                        requesterAvatar: s.info.requester ? s.info.requester.avatar : currentUser.avatar,
                    }

                }) : [])
                setPlayerState(ctx.data.queue ? true : null)

                setErrorMessage(ctx.data.exists.voice ? `${ctx.data.queue && ctx.data.queue.current ? "" : `${ctx.data.queue.incoming.length ? "" : `${ctx.data.queue ? "Nothing queued yet! Queue some songs using the search bar to start the party!" : "Please make the bot joining a voice channel on discord using the green join command!"}`}`}` : "Please join a voice channel on discord first!")
            })

            socket.on("redirect", async url => {
                Router.push(url)
            })
            socket.on("outdated", () => {
                setCurrentResults([])
                setCurrentSong(null)
                setSongQueues([])
                setRecentSongs([])
                setPlayerState(null)
                setErrorMessage("This page is outdated because you opened another page")
            })
            socket.on("refresh", async (op) => {
                console.log(op)
                const data = op.data
                if (op.type.includes("RECENT_SONGS")) {
                    setRecentSongs(data.recent ? data.recent.map(s => {
                        return {
                            id: s.info.uri,
                            lavalink: s,
                            image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                            title: s.info.title,
                            artist: s.info.author,
                            duration: s.info.duration,
                            requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                            requesterAvatar: s.info.requester ? s.info.requester.avatar : currentUser.avatar,
                        }
                    }) : [])
                }
                if (op.type.includes("NEXT_SONGS")) {

                    setSongQueues(data.incoming ? data.incoming.map(s => {
                        return {
                            id: s.info.uri,
                            image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                            lavalink: s,

                            title: s.info.title,
                            artist: s.info.author,
                            duration: s.info.duration,
                            requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                            requesterAvatar: s.info.requester ? s.info.requester.avatar : currentUser.avatar,
                        }
                    }) : [])
                    if (data.incoming && data.incoming.length > 1 && errorMessage) setErrorMessage(null)
                }
                if (op.type.includes("DESTROY")) {
                    setCurrentSong(null)
                    setCurrentResults([])
                    setRecentSongs([])
                    setSongQueues([])

                }
                if (op.type.includes("CURRENT_SONG")) {

                    setCurrentSong(data.current ? {
                        id: data.current.info.uri,
                        image: currentSong ? data.current.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                        title: data.current.info.title,
                        isPlaying: data.paused ? false : true,
                        loop: data.loop,
                        lavalink: data.current,

                        durationMs: data.current.info.length,
                        artist: data.current.info.author,
                        currentDuration: data.current.info.position / 1000,
                        percentPlayed: ((data.current.info.position / 1000) / (data.current.info.length / 1000) * 100),
                        duration: data.current.info.duration,
                        requesterName: data.current.info.requester ? data.current.info.requester.name : currentUser.username,
                        requesterAvatar: data.current.info.requester ? data.current.info.requester.avatar : currentUser.avatar,
                    } : null)
                    if (data.current && PlayerState) setErrorMessage(null)
                    if (!data.current && PlayerState) setErrorMessage("Nothing in the queue! Add some songs to start the party!!")
                }
                if (op.type.includes("TRACK_REMOVED")) {
                    setSongQueues(songQueues.filter(s => s.id !== data.uri))
                }
                if (op.type.includes("VOICE_UPDATE")) {
                    console.log("Voice state updated")
                    let err;
                    let st = true;

                    let oldState = PlayerState;
                    const chan = data.channelId

                    const it = data.channelId
                    setCurrentVoice(it);
                    currentVoice = it
                    console.log(`${currentBotVoice} = ${currentVoice}`)
                    setTimeout(() => {
                        console.log(`Now current voice is ${currentVoice}`)

                    }, 5000);
                    if (!currentBotVoice && !chan) {
                        st = null;
                        console.log(chan)
                        err = "Please go on discord and join a voice channel to start listening!"
                    } else if (currentBotVoice && !chan) {
                        st = null
                        err = "Please go on discord and join the voice channel Green-bot is in"
                    } else if (currentBotVoice && chan && currentBotVoice !== chan) {
                        st = null;
                        err = "Please go on discord and join the same voice channel as Green-bot!"
                    }
                    setPlayerState(st)
                    setErrorMessage(err)
                }


            })
        })

    }, [])

    //  let progressInterval = setInterval(function(){
    //      if(!currentSong || !currentSong.isPlaying) return;
    //      console.log(ActualSong.percent +"%")
    //        if(ActualSong.percent >= 100)return console.log("Jk")
    //    let parsedTime = currentSong.durationMs/1000
    //    let one_second = (1/parsedTime) *100;
    //     console.log(`One sec: ${one_second} of ${parsedTime}`)
    //     let n = {percent: ActualSong.percent + one_second};
    //      console.log(`should be ${n.percent}`)
    //      setActualSong(n)
    //    },1000);
    // REMOVE ALL THE INITIAL STATE BELOW IN PRODUCTION OR WHEN CONNECTING WITH API
    // CHANGE THE VALUE TO "null" (WITHOUT QUOTE) LATER ON

    // User Servers (on Left Sidebar)

    const [servers, setServers] = useState<ServerType[]>([
        {
            image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
            name: "Green-bot",
            id: "783708073390112830",
            url: "http://185.183.33.10:8000"
        },
        {
            image: "https://cdn.discordapp.com/attachments/904438715974287440/980104864866652240/979380073134161980.webp",
            name: "Green-bot Premium",
            id: "913065900125597706",
            url: "http://185.183.33.10:8090"
        },
        //   {chan
        //       image: "https://cdn.discordapp.com/attachments/914468716505337856/955141444493004850/unknown_31_1.png",
        //       name: "Green-bot 2",
        //       id: "924953350900969532",
        //  },
        //  {
        //      image: "https://cdn.discordapp.com/attachments/914468716505337856/955142074464874506/unknown_32_1.png",
        //      name: "Green-bot 3",
        //      id: "530499159732650004",
        //  },


    ]);
    const [sections] = useState<ServerType[]>([
        {
            image: "https://cdn0.iconfinder.com/data/icons/complete-common-version-2-6/1024/queue_music4-512.png",
            name: "Song Queue",
            id: "queue",
            url: "http://185.183.33.10:8000"
        },
        {
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/OOjs_UI_icon_search-ltr.svg/1200px-OOjs_UI_icon_search-ltr.svg.png",
            name: "Search ",
            id: "search",
            url: "http://185.183.33.10:8090"
        },


    ]);
    const [currentSection, setCurrentSection] = useState('queue')
    // User Playlists (on Left Sidebar)

    const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
    const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistType>(null);

    // User Recently Played Songs (on Right Sidebar)
    const [recentSongs, setRecentSongs] = useState<SongType[]>([]);

    const [songs, setSongs] = useState<SongType[]>()
    // User Songs (on Center)
    const [songQueues, setSongQueues] = useState<SongType[]>([]);
    const [errorMessage, setErrorMessage] = useState<String>();
    const checkEligible = (time?: number) => {
        if (ActualServer.premium) return true
        if (!time) time = 1000;
        let eligible = true;
        if (!lastButtonUsed || lastButtonUsed === null) {

            setLastButtonUsed(Date.now())
        } else {
            if ((lastButtonUsed + time) > Date.now()) {
                eligible = false;
                setLastButtonUsed(Date.now())
            }
            setLastButtonUsed(Date.now())

        }
        return eligible
    }
    // Called after user clicks on a song in the song list under "Recently Played" in right sidebar.
    const onRecentSongClick: Song.RecentProps["onClick"] = (songId) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        if (currentSettings.dj_commands.includes("back")) {
            if (!currentUser.isDj) {
                setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
        }
        let x = recentSongs.filter(x => x.id !== songId)
        setRecentSongs(x)
        let b = recentSongs.find(x => x.id === songId)
        setCurrentSong(b)

        socket.emit("op", {
            action: "play_recent",
            songId: songId,
            user: currentUser,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },
            current: b,
            recent: x
        });

    };

    // Called when use click trash icon in the song item under song queue.
    const onSongItemRemoved: Song.ItemProps["onRemove"] = (songId) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            return
        }
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }

        if (currentSettings.dj_commands.includes("remove")) {
            if (!currentUser.isDj) {
                setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
        }
        setSongQueues(songQueues.filter(x => x.id !== songId))
        socket.emit("op", {
            action: "remove",
            songId: songId,
            user: currentUser,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },

        })
    };
    const onPlaylistItemRemoved: Song.ItemProps["onRemove"] = (songId) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        setSongs(songs.filter(x => x.id !== songId))
        socket.emit("op", {
            action: "remove_pl_track",
            songId: songId,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },
            playlist: currentPlaylist.label,
            user: currentUser
        })
    };


    const onSongItemAdd: Song.ItemProps["onAdd"] = (songId, top) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        if (currentSettings.dj_commands.includes("play")) {
            if (!currentUser.isDj) {
                setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
        }
        let song;
        if (currentResults) {
            song = currentResults.find(x => x.id === songId)
            setCurrentResults(currentResults.filter(x => x.id !== songId))

            if (currentPlaylist) {
                let target = playlists.findIndex(pl => pl.label === currentPlaylist.label)
                let new_list = songs;
                new_list.push(song)
                setSongs(new_list)
                playlists[target].tracks.push(song)
                setPlaylists(playlists)
            } else {
                if (!PlayerState) {
                    let previous = errorMessage
                    setErrorMessage("You need to join a voice channel and make the bot joining yours before being able to queue songs.")
                    setTimeout(() => {
                        setErrorMessage(previous)
                    }, 6000);
                    return
                }

                socket.emit("op", {
                    action: "add_result",
                    songData: song.id,
                    server: currentServer ? currentServer : {
                        image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                        name: "Green-bot",
                        id: "783708073390112830",
                        url: "http://185.183.33.10:8000"
                    },
                    toPlaylist: currentPlaylist,
                    top: top ? true : null,
                    user: currentUser,


                })


            }

        } else {
            song = songs.find(x => x.id === songId)
            if(!currentSong) song.image = ""
            let new_list = songQueues;
            new_list.push(song)
            setSongQueues(new_list)
            socket.emit("op", {
                action: "add_pl_track",
                songData: song.lavalink,
                server: lastServer,
                user: currentUser,

            })
        }
    };
    // Called when user click play/pause button in the song item under song queue.
    const onSongItemStatusChange: Song.ItemProps["onStatusChange"] = (songId, status) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        if (currentSong && currentSong.id === songId) {
            if (currentSettings.dj_commands.includes("pause")) {
                if (!currentUser.isDj) {
                    setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 6000);
                    return
                }
            }
            let current = currentSong;
            if (current.isPlaying) {
                setCurrentSong({
                    id: currentSong.id,
                    image: currentSong.image ? currentSong.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: currentSong.title,
                    isPlaying: null,
                    lavalink: currentSong.lavalink,
                    durationMs: currentSong.durationMs,
                    artist: currentSong.artist,
                    currentDuration: currentSong.currentDuration,
                    percentPlayed: currentSong.percentPlayed,
                    duration: currentSong.duration,
                    requesterName: currentSong.requesterName,
                    requesterAvatar: currentSong.requesterAvatar ? currentSong.requesterAvatar : currentUser.avatar,
                })

            } else {
                setCurrentSong({
                    id: currentSong.id,
                    image: currentSong.image ? currentSong.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: currentSong.title,
                    isPlaying: true,
                    durationMs: currentSong.durationMs,
                    artist: currentSong.artist,
                    lavalink: currentSong.lavalink,

                    currentDuration: currentSong.currentDuration,
                    percentPlayed: currentSong.percentPlayed,
                    duration: currentSong.duration,
                    requesterName: currentSong.requesterName,
                    requesterAvatar: currentSong.requesterAvatar ? currentSong.requesterAvatar : currentUser.avatar,
                })
            }

            socket.emit("op", {
                action: "pause",
                user: currentUser,
                server: currentServer ? currentServer : {
                    image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                    name: "Green-bot",
                    id: "783708073390112830",
                    url: "http://185.183.33.10:8000"
                },
                current: currentSong

            })
            return

        }
        if (currentSettings.dj_commands.includes("jump")) {
            if (!currentUser.isDj) {
                setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
        }
        let rl = currentSong;
        let current = songQueues.find(x => x.id === songId)
        setCurrentSong(current)
        setSongQueues(songQueues.filter(x => x.id !== songId && x.id !== rl.id))
        socket.emit("op", {
            action: "jump",
            songId: songId,
            user: currentUser,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },
            current: current,
            next: songQueues

        })
    };

    // Called when the search input is changed.
    const onSearchInputChange = async(inputValue: string) => {
        console.log("input change")
        setCurrentSearch(inputValue);
        if(inputValue === "") return
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        if (currentSettings.dj_commands.includes("search")) {
            if (!currentUser.isDj) {
                setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
        }

if(currentSection ==="search"){
    socket.emit("op", {
        action: "search",
        query: inputValue,
        server: currentServer ? currentServer : {
            image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
            name: "Green-bot",
            id: "783708073390112830",
            url: "http://185.183.33.10:8000"
        },
        user: currentUser
    })
}








    };
    const onKeypressed = (inputValue: string) => {
        if(inputValue !=="Enter") return
        

        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        if (currentSettings.dj_commands.includes("search")) {
            if (!currentUser.isDj) {
                setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
        }



        socket.emit("op", {
            action: "search",
            query: inputValue,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },
            user: currentUser
        })






    };
    const onSongLiked = async (songId: SongType) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        const playlist = playlists[0];
        songId.good = true;
        if (playlist.tracks.find(s => s.info.uri === songId.id)) {
            playlist.tracks = playlist.tracks.filter(s => s.info.uri !== songId.id)

        } else {
            playlist.tracks.push(songId.lavalink)
        }
        let bab = [
            playlist
        ]
        playlists.filter(pl => pl.id !== "liked-songs").forEach(pl => {
            bab.push(pl)
        })
        await setPlaylists(bab)

        socket.emit("op", {
            action: "like",
            user: currentUser,
            current: currentSong,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },
            song: songId.lavalink

        })
    }

    // Called when user click one of the control icon on the music player on bottom right sidebar.
    const onSongControlClick = (controlName: string) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        if (!currentSong) {
            setErrorMessage("Nothing is currently playing! Please queue some songs to do that")
            setTimeout(() => {
                setErrorMessage(null)
            }, 6000);
            return
        }

        if (controlName === "play" || controlName === "pause") {

            if (currentSettings.dj_commands.includes("pause")) {
                if (!currentUser.isDj) {
                    setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 6000);
                    return
                }
            }
            if (currentSong.isPlaying) {
                setCurrentSong({
                    id: currentSong.id,
                    image: currentSong.image ? currentSong.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: currentSong.title,
                    isPlaying: null,
                    durationMs: currentSong.durationMs,
                    artist: currentSong.artist,
                    lavalink: currentSong.lavalink,

                    loop: currentSong.loop,
                    currentDuration: currentSong.currentDuration,
                    percentPlayed: currentSong.percentPlayed,
                    duration: currentSong.duration,
                    requesterName: currentSong.requesterName ? currentSong.requesterName : currentUser.username,
                    requesterAvatar: currentSong.requesterAvatar ? currentSong.requesterAvatar : currentUser.avatar,
                })
            } else {
                setCurrentSong({
                    id: currentSong.id,
                    image: currentSong.image ? currentSong.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: currentSong.title,
                    isPlaying: true,
                    durationMs: currentSong.durationMs,
                    artist: currentSong.artist,
                    lavalink: currentSong.lavalink,

                    currentDuration: currentSong.currentDuration,
                    percentPlayed: currentSong.percentPlayed,
                    duration: currentSong.duration,
                    loop: currentSong.loop,
                    requesterName: currentSong.requesterName ? currentSong.requesterName : currentUser.username,
                    requesterAvatar: currentSong.requesterAvatar ? currentSong.requesterAvatar : currentUser.avatar,
                })
            }
            socket.emit("op", {
                action: "pause",
                user: currentUser,
                server: currentServer ? currentServer : {
                    image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                    name: "Green-bot",
                    id: "783708073390112830",
                    url: "http://185.183.33.10:8000"
                },
                current: currentSong

            })
        } else if (controlName === "next") {
            if (currentSettings.dj_commands.includes("skip")) {
                if (!currentUser.isDj) {
                    setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 6000);
                    return
                }
            }
            if (!songQueues || !songQueues.length) {
                setErrorMessage("No songs in the queue yet! Add some songs using th search bar!")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
            let nextSong = songQueues[0];
            if (!nextSong) {
                setErrorMessage("No songs in the queue yet! Add some songs using th search bar!")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
            let next = songQueues.filter(s => s.id !== nextSong.id && s.id !== currentSong.id)
            setSongQueues(next)
            setCurrentSong(nextSong)
            socket.emit("op", {
                action: "skip",
                user: currentUser,
                current: nextSong,
                next: next,
                server: currentServer ? currentServer : {
                    image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                    name: "Green-bot",
                    id: "783708073390112830",
                    url: "http://185.183.33.10:8000"
                },

            })
        } else if (controlName === "shuffle") {

            if (currentSettings.dj_commands.includes("shuffle")) {
                if (!currentUser.isDj) {
                    setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 6000);
                    return
                }
            }
            if (!songQueues || songQueues.length < 2) {
                setErrorMessage("There are no enough songs in the queue! Add some songs using th search bar!")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
            setSuccessMessage("🔀 Succesfuly shuffled the queue")
            setTimeout(() => {
                setSuccessMessage(null)
            }, 6000);
            let shuffled = songQueues.sort(() => Math.random() - 0.5)
            setSongQueues(shuffled)
            socket.emit("op", {
                action: "shuffle",
                user: currentUser,
                server: currentServer ? currentServer : {
                    image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                    name: "Green-bot",
                    id: "783708073390112830",
                    url: "http://185.183.33.10:8000"
                },

            })
        } else if (controlName === "repeat") {

            if (currentSettings.dj_commands.includes("loop")) {
                if (!currentUser.isDj) {
                    setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 6000);
                    return
                }
             
            }
            if (currentSong.loop) {
                setSuccessMessage("🔂 Succesfuly disabled the loop mode")
                setCurrentSong({
                    id: currentSong.id,
                    image: currentSong.image ? currentSong.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: currentSong.title,
                    isPlaying: currentSong.isPlaying,
                    durationMs: currentSong.durationMs,
                    artist: currentSong.artist,
                    loop: null,
                    lavalink: currentSong.lavalink,

                    currentDuration: currentSong.currentDuration,
                    percentPlayed: currentSong.percentPlayed,
                    duration: currentSong.duration,
                    requesterName: currentSong.requesterName ? currentSong.requesterName : currentUser.username,
                    requesterAvatar: currentSong.requesterAvatar ? currentSong.requesterAvatar : currentUser.avatar,
                })
            } else {
                setCurrentSong({
                    id: currentSong.id,
                    image: currentSong.image ? currentSong.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                    title: currentSong.title,
                    isPlaying: currentSong.isPlaying,
                    durationMs: currentSong.durationMs,
                    lavalink: currentSong.lavalink,

                    artist: currentSong.artist,
                    loop: true,
                    currentDuration: currentSong.currentDuration,
                    percentPlayed: currentSong.percentPlayed,
                    duration: currentSong.duration,
                    requesterName: currentSong.requesterName ? currentSong.requesterName : currentUser.username,
                    requesterAvatar: currentSong.requesterAvatar ? currentSong.requesterAvatar : currentUser.avatar,
                })
                setSuccessMessage("🔄 Now looping the entiere queue!")
            }
            setTimeout(() => {
                setSuccessMessage(null)
            }, 6000);
            socket.emit("op", {
                action: "loop",
                user: currentUser,
                server: currentServer ? currentServer : {
                    image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                    name: "Green-bot",
                    id: "783708073390112830",
                    url: "http://185.183.33.10:8000"
                },

            })

        } else if (controlName === "previous") {
            if (currentSettings.dj_commands.includes("back")) {
                if (!currentUser.isDj) {
                    setErrorMessage("You don't have the DJ permission to do that! You can ask an admin of your server to give you DJ perms. If you think you should have DJ perms refresh the page.")
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 6000);
                    return
                }
            }
            if (!recentSongs || recentSongs.length == 0) {
                setErrorMessage("There is no previous track in your queue! Add some songs using th search bar!")
                setTimeout(() => {
                    setErrorMessage(null)
                }, 6000);
                return
            }
            let nextSong = recentSongs[recentSongs.length - 1];
            setCurrentSong(nextSong)
            let olds = recentSongs.filter(s => s.id !== nextSong.id)
            setRecentSongs(olds)
            socket.emit("op", {
                action: "back",
                user: currentUser,
                currentSong: recentSongs,
                server: currentServer ? currentServer : {
                    image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                    name: "Green-bot",
                    id: "783708073390112830",
                    url: "http://185.183.33.10:8000"
                },
                recent: olds

            })
        }

    };
    const changeSection = async (section: string) => {
        if(!currentServer){
            setErrorMessage("You need to select a bot before switching session!");
            return
        }
        setCurrentSection(section)
        if(section === "search" && currentSearch !==""){
            onSearchInputChange(currentSearch); 
        }else{
            if(currentSearch !==""){
                setCurrentSearch("")
            }
        }
    

  
    }

    // Called when user click the server on the left sidebar.
    const onServerClick = async (serverId: string) => {
        if (!checkEligible(1000)) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click )")
            return
        }
        const server = servers.find((server) => server.id === serverId) || null;
        if (!currentPlaylist && !currentResults && !currentSearch) {
            if (serverId === "913065900125597706") {

                setSuccessMessage("Fetching data... please wait...")
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000)
                socket.emit("change_bot", {
                    oldBot: currentServer,
                    newBot: server,
                    data: { userId: currentUser.id,user:ctx.user, serverId: ActualServer.id }
                })
            }
            if (serverId === "783708073390112830") {
                setSongQueues([])
                setCurrentSong(null)
                setRecentSongs([])
                setSuccessMessage("Fetching data... please wait...")
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000)
        
                socket.emit("change_bot", {
                    oldBot: currentServer,
                    newBot: server,
                    data: { userId: currentUser.id,user: currentUser, serverId: ActualServer.id }
                })
            }
        }
        if (currentPlaylist) {
            setCurrentPlaylist(null)
            setSongs([])
        }
        if (currentResults || currentSearch) {
            setCurrentResults([])
            setCurrentSearch("")
        }

        if (songs) setSongs([])

        await setCurrentServer(server)


    };

    // Called when user click the create playlist button on the left sidebar.
    const onCreatePlaylistClick = () => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        alert("Create playlist clicked!");
    };
    const onPlaylistPlay = () => {
        if (!PlayerState) {
            setErrorMessage("You need to join a voice channel on discord to be able to do that!")
            return
        }
        socket.emit("op", {
            action: "pl_play",
            user: currentUser,
            server: currentServer ? currentServer : {
                image: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
                name: "Green-bot",
                id: "783708073390112830",
                url: "http://185.183.33.10:8000"
            },
            current: currentSong

        })
    };

    // Called when user click the playlist on the left sidebar.
    const onPlaylistClick = async (playlistId: string) => {
        if (!checkEligible()) {
            setErrorMessage("You are clicking buttons too fast and are being rate limited! Calm down or you will be banned! ( Wait 2s beetween each click ) You can purchase the premium to bypass this")
            setTimeout(() => { setErrorMessage(null) }, 1500)
            return
        }
        const playlist = playlists.find((playlist) => playlist.id === playlistId) || null;
        setCurrentPlaylist(playlist);
        setCurrentServer(null)
        let list = playlist.tracks.map(s => {
            if (s.good) return s
            return {
                id: s.info.uri,
                image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                lavalink: s,
                title: s.info.title,
                artist: s.info.author,
                duration: s.info.duration,
                requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                requesterAvatar: s.info.requester ? s.info.requester.avatar ? s.info.requester.avatar : currentUser.avatar : currentUser.avatar,
            }
        })
        await setSongs(list)
        setSongs(playlist.tracks.map(s => {
            if (s.good) return s

            return {
                id: s.info.uri,
                image: s.info.image ? s.info.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg",
                lavalink: s,
                title: s.info.title,
                artist: s.info.author,
                duration: s.info.duration,
                requesterName: s.info.requester ? s.info.requester.name : currentUser.username,
                requesterAvatar: s.info.requester ? s.info.requester.avatar ? s.info.requester.avatar : currentUser.avatar : currentUser.avatar,
            }
        }))


    };

    return (
        <main className="flex items-stretch bg-[url(/images/background.png)] bg-cover bg-center min-h-screen lg:max-h-screen h-full min-w-full font-montserrat">
            {/* LEFT */}
            <section
                className={
                    `fixed lg:relative top-0 left-0 z-50 h-screen lg:grid gap-8 max-w-xs flex-shrink-0 bg-black lg:bg-white lg:bg-opacity-20 p-10 auto-rows-max overflow-auto ` +
                    (sidebarOpen === "left" ? "grid" : "hidden")
                }
            >
                {/* Logo */}
                <a href="https://green-bot.app/profile">
                    <img src={ActualServer && ActualServer.image ? ActualServer.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg"} className="rounded-full h-14 mx-auto" alt="Avatar" />    <h6 className="sm:text-lg md:text-x0.2 lg:text-1xl font-bold">   {ActualServer?.name}</h6>
                </a> <style jsx>{`
        h6{
            color: #fff;
        }
      `}</style>
                <Divider />

                {/* User Servers */}
                <Menu.Container title="Bots">
                    {servers.map((server, index) => (
                        <Menu.Item
                            key={index} //
                            active={currentServer && currentServer.id === server.id}
                            image={server ? server.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg"}
                            label={server.name}
                            onClick={() => onServerClick(server.id)}
                        />
                    ))}
                </Menu.Container>
                <Menu.Container title="Menus">
                    {sections.map((server, index) => (
                        <Menu.Item
                            key={index} //
                            active={currentSection === server.id}
                            image={server ? server.image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg"}
                            label={server.name}
                            onClick={() => changeSection(server.id)}
                        />
                    ))}
                </Menu.Container>
                {/* User Playlists */}
                <Menu.Container title="Your Playlists">

                    {playlists.map((playlist, index) => (
                        <Menu.Item
                            key={index} //
                            image={playlist?.image}
                            active={currentPlaylist && currentPlaylist.id === playlist.id}
                            label={playlist?.label}
                            onClick={() => onPlaylistClick(playlist?.id)}
                        />
                    ))}
                </Menu.Container>

                <Divider />
            </section>

            {/* CENTER */}
            <section className="flex-1 flex flex-col gap-5 p-10 pb-0 overflow-auto">
                {/* Search Input */}

                <div className="flex items-center justify-between lg:justify-end pb-4 w-full">
                    <img src="/images/logo.png" className="h-12 lg:hidden" alt="Avatar" />

                    <SearchInput text={currentSection === "queue"? "Search in the queue....": "Search for songs..."} onInputChange={onSearchInputChange} onKeypressed={onKeypressed} />
                </div>

                {/* User Greetings */}

                <style jsx>{`
        .red{
            color:#C61616 !important
        }
        .bg-red-100{
            border-color: #C61616 !important;
            background: #D0D3CC !important
        }
      `}</style>
                {errorMessage ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold red">Holy smokes! </strong>
                    {errorMessage === "novoted" ? <span className="block sm:inline red ">The Loop feature uses more CPU power than other command so you need to vote to access this command. Go on <a href='https://green-bot.app/vote' target='_blank' className="link">this page</a> to vote for the bot</span> : <span className="block sm:inline red ">{errorMessage}</span>}
                </div> : ""}
                <style jsx>{`
        .green{
            color:#81F20F !important
        }
        .link{
color:#2379CF!important;
        }
        .bg-green-100{
            border-color: #81F20F !important;
        }
      `}</style>
                {successMessage ? <div className="bg-green-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold green">Yay you did it! </strong>
                    <span className="block sm:inline green "> {successMessage}</span>
                </div> : ""}
                {/* Song Queue */}
                <div className="flex flex-col gap-6 pt-3 overflow-auto">
                    {/* Title */}
                    <div className="relative overflow-auto flex flex-col gap-8 md:gap-4 pb-6">
                    {currentPlaylist?<div className="justify-start gap-6 items-center flex flex-col md:flex-row">
<img src={songs.find(s => s.image && s.image !== "") ? songs.find(s => s.image && s.image !== "").image : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg"} className=" w-14 md:w-32" alt="Avatar" />

                    <div className="grid gap-3 text-white text-center md:text-left">
                        <p className="sm:text-lg md:text-lg lg:text-3xl font-bold">{currentPlaylist.label}</p>
                        <p className="text-lg font-light">{songs.length} tracks in this playlist</p>
                        <div className="flex items-center gap-5">
                        <svg className="h-12 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16"  onClick={() => onPlaylistPlay()}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" fill="white"/>
                </svg>
                <svg className="h-6 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16"  onClick={() => onPlaylistPlay()}>
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>                </svg>
                    </div>
                </div>
                            </div>
                :   <div className="flex flex-col md:flex-row md:gap-6 text-white items-center">
                <span className="font-semibold text-2xl"> {currentSection ==="search" ? "Search Results":currentPlaylist ? currentPlaylist.label : "Song Queue"}</span>
               {currentSection ==="queue"? <span className="text-lg">{currentPlaylist ? currentPlaylist.tracks.length : PlayerState && songQueues.length > 0 ? songQueues.length + 1 : songQueues.length} Songs</span> :""}
            </div>}
                 

                    {/* Queues */}
                        {songs ? songs
                            .filter((song) => {
                                let found = false;

                                for (const key of Object.keys(song)) {
                                    if (String(song[key]).toLowerCase().includes(currentSearch?.toLowerCase())) {
                                        found = true;
                                    }
                                }

                                return found;
                            })

                            .map((song, index) => (
                                <Song.Item
                                    key={index} //
                                    song={song}
                                    NoPlay={currentSong && currentSong.id === song.id ? false : true}
                                    DisplayAdd={PlayerState ? true : false}
                                    onAdd={onSongItemAdd}
                                    DisplayReq={true}

                                    isPlaying={currentSong && currentSong.id === song.id && currentSong.isPlaying}
                                    onRemove={onPlaylistItemRemoved}
                                    onStatusChange={onSongItemStatusChange}
                                />
                            )) : ""}

{
    console.log( songQueues  .filter((song) => {
        let found = false;

        for (const key of Object.keys(song)) {
            if (String(song[key]).toLowerCase().includes(currentSearch?.toLowerCase())) {
                found = true;
            }
        }

        return found;
    })) }
     {currentSearch !=="" && currentSection === "search" && currentResults &&currentResults.length == 0 ?   <p className="font-semibold text-2xl self-center text-white">No Results found for your query, try with a more accurate query!</p> :""
                                 }
                                    {currentSearch !=="" && currentSection === "queue" && songQueues  .filter((song) => {
                                        let found = false;
        
                                        for (const key of Object.keys(song)) {
                                            if (String(song[key]).toLowerCase().includes(currentSearch?.toLowerCase())) {
                                                found = true;
                                            }
                                        }
        
                                        return found;
                                    }).length == 0 ?   <p className="font-semibold text-2xl self-center text-white"> No Results found in the queue, try going on the search section instead</p> :""
                                 }

                        {
                            currentServer && PlayerState &&
                                currentSong && currentSection ==="queue"  && currentSearch === "" ? <Song.Item
                                key={currentSong.id} //
                                song={currentSong}
                                DisplayLike={true}
                                onLike={onSongLiked}
                                isLiked={playlists[0].tracks.find(s => s.info.uri === currentSong.id)}
                                isPlaying={currentSong.isPlaying}
                                onStatusChange={onSongItemStatusChange}
                                NoRemove={true}

                            /> : ""}

                        {currentServer && PlayerState && currentSection === "search"&& currentSearch && currentSearch !== "" && currentResults?.map((song, index) => (
                            <Song.Item
                                key={index} //
                                song={song}
                                isPlaying={currentSong && currentSong.id === song.id}
                                onAdd={onSongItemAdd}
                                NoRemove={true}
                                DisplayAddTop={true}
                                DisplayReq={true}
                                NoPlay={true}
                                DisplayAdd={true}
                                onStatusChange={onSongItemStatusChange}
                            />
                        ))}

                        {currentServer && PlayerState && songQueues&& currentSection ==="queue" && songQueues
                            .filter((song) => {
                                let found = false;

                                for (const key of Object.keys(song)) {
                                    if (String(song[key]).toLowerCase().includes(currentSearch?.toLowerCase())) {
                                        found = true;
                                    }
                                }

                                return found;
                            })
                            .filter(song => currentSong && currentSong.id !== song.id)
                            .map((song, index) => (
                                <Song.Item
                                    key={index} //
                                    song={song}
                                    DisplayLike={true}
                                    isLiked={playlists[0].tracks.find(s => s.info.uri === song.id)}
                                    onLike={onSongLiked}
                                    isPlaying={currentSong && currentSong.id === song.id && currentSong.isPlaying}
                                    onRemove={onSongItemRemoved}
                                    onStatusChange={onSongItemStatusChange}
                                />
                            ))
                            }
                    </div>
                </div>
            </section>

            {/* RIGHT */}
            <section
                className={
                    `xl:!flex fixed top-0 right-0 z-50 h-screen xl:relative max-w-xs flex-shrink-0 flex-col gap-8 items-center justify-between p-10 bg-black xl:bg-white xl:bg-opacity-20 overflow-auto ` +
                    (sidebarOpen === "right" ? "flex" : "hidden")
                }
            >
                {/* Menu */}
                <div className="flex flex-col gap-8 items-center overflow-auto w-full">
                    {/* User Info */}
                    <div className="grid gap-4 auto-cols-max place-items-center place-content-center w-full">
                        {/* User */}
                        <a href="#!" className="flex gap-4 items-center">
                            <img src={currentUser && currentUser.avatar ? currentUser.avatar : "https://i.pinimg.com/originals/cf/a6/bb/cfa6bb1e13fcbcf23aead5028fc4d0e3.jpg"} className="rounded-full w-12" alt="Avatar" />
                            <p className="text-lg text-left font-semibold text-white">{currentUser && currentUser.username}</p>
                        </a>

                        {/* Upgrade Button */}
                        <a href="https://green-bot.app/premium" className="hover:bg-white hover:text-green duration-500 font-bold text-white text-lg px-6 py-1 border-2 border-white rounded-full">
                            {ActualServer ? `${ActualServer.premium ? "💚 Premium Server" : "Go Premium 🚀"}` : "Go Premium 🚀"}
                        </a>
                    </div>

                    <Divider />

                    {/* Recent Songs */}
                    <div className="relative flex flex-col gap-5 overflow-auto w-full">
                        {/* Title */}
                        <p className="text-lg text-white text-left flex-shrink-0">Recently Played</p>

                        {/* Songs */}
                        <section className="relative overflow-auto w-full flex flex-col gap-6">
                            {currentServer && PlayerState && recentSongs.map((item, index) => (
                                item ?
                                    <Song.Recent key={index} song={item} onClick={onRecentSongClick} /> : ""
                            ))}
                        </section>
                    </div>
                </div>

                {/* Music Player */}
                <div className="w-full grid gap-6 bg-white xl:bg-black !bg-opacity-25 rounded-3xl p-6 flex-shrink-0 mt-4">
                    {/* Song Duration */}
                    <div className="flex items-center text-sm text-white w-full">
                        {/* Current Duration */}

                        <p>{currentSong?.currentDuration || "0:00"}</p>

                        {/* Total Duration Percent Line */}
                        <div id="bar" className="h-1 bg-white bg-opacity-50 rounded-full flex-1 mx-3">
                            {/* Duration Percent Line */}
                            <div className="h-full bg-white" style={{ width: 0 }} />
                        </div>

                        {/* Total Duration */}
                        <p>{currentSong?.duration || "0:00"}</p>
                    </div>


                    <Song.Control isPlaying={currentSong?.isPlaying} onControlClick={onSongControlClick} />
                </div>
            </section>

            {/* Blocker (Shown When Absolute Menu is Open (on Mobile)) */}
            {/* Used to close menu when clicked outside */}
            <div className={`w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-75 z-40 ` + (!sidebarOpen && "hidden")} onClick={() => setSidebarOpen(false)} />

            {/* Left Sidebar Button */}
            <button className="fixed top-28 left-0 z-40 p-4 bg-green bg-opacity-75 rounded-r-lg lg:hidden" onClick={() => setSidebarOpen("left")}>
                <svg className="h-5 fill-white" viewBox="0 0 800 704">
                    <path d="M792 0H8C3.6 0 0 3.6 0 8V72C0 76.4 3.6 80 8 80H792C796.4 80 800 76.4 800 72V8C800 3.6 796.4 0 792 0ZM792 624H8C3.6 624 0 627.6 0 632V696C0 700.4 3.6 704 8 704H792C796.4 704 800 700.4 800 696V632C800 627.6 796.4 624 792 624ZM792 312H8C3.6 312 0 315.6 0 320V384C0 388.4 3.6 392 8 392H792C796.4 392 800 388.4 800 384V320C800 315.6 796.4 312 792 312Z" />
                </svg>
            </button>

            {/* Right Sidebar Button */}
            <button className="fixed top-28 right-0 z-40 p-4 bg-green bg-opacity-75 rounded-l-lg xl:hidden" onClick={() => setSidebarOpen("right")}>
                <svg className="h-5 fill-white" viewBox="0 0 40 40">
                    <path d="M7 20C7 21.1046 7.89543 22 9 22C10.1046 22 11 21.1046 11 20H7ZM20 11C21.1046 11 22 10.1046 22 9C22 7.89543 21.1046 7 20 7V11ZM36 20C36 28.8366 28.8366 36 20 36V40C31.0457 40 40 31.0457 40 20H36ZM20 36C11.1634 36 4 28.8366 4 20H0C0 31.0457 8.9543 40 20 40V36ZM4 20C4 11.1634 11.1634 4 20 4V0C8.9543 0 0 8.9543 0 20H4ZM20 4C28.8366 4 36 11.1634 36 20H40C40 8.9543 31.0457 0 20 0V4ZM11 20C11 15.0296 15.0296 11 20 11V7C12.8204 7 7 12.8204 7 20H11ZM23 20C23 21.6569 21.6569 23 20 23V27C23.866 27 27 23.866 27 20H23ZM20 23C18.3431 23 17 21.6569 17 20H13C13 23.866 16.134 27 20 27V23ZM17 20C17 18.3431 18.3431 17 20 17V13C16.134 13 13 16.134 13 20H17ZM20 17C21.6569 17 23 18.3431 23 20H27C27 16.134 23.866 13 20 13V17Z" />
                </svg>
            </button>
        </main>
    );
}
