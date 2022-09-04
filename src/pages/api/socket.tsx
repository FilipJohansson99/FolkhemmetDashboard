import { Server } from 'socket.io'
let _sockets = [];
const ytsr = require('ytsr');
import * as ytMusic from 'node-youtube-music';

let cooldowns = []
import { NextResponse, NextRequest } from 'next/server'
const fetch = require("node-fetch");

const SocketHandler = (req, res) => {
   try {
      if (!res.socket.server.io) {

         const io = new Server(res.socket.server, {
            maxHttpBufferSize: 1e8 * 100,
            pingTimeout: 1000 * 60 * 100

         })
         res.socket.server.io = io
         io.on('connection', async socket => {

            let servId = socket.handshake.headers.referer.includes("bot") ?socket.handshake.headers.referer.split("/")[4]:(socket.handshake.headers.referer.split("/")[4]).split("?")[0]
            let found_socket;
            socket.on("register", async (data, no) => {
              if(_sockets.find(sk=>sk.id === data.socketId)) return
              console.log(data.server.url)
              if(data.server.url.includes("141")){
               data.server.url ="http://185.183.33.10:8000"
              }

               console.log(`Creating a new socket for ${data.user.id}`)
               let return_data = { user: data.user, server: null, queue: null, userdb: null };
               let response = await fetch(`${data.server.url}/fetchserver?server=${servId}&asking=${data.user.id}&socket=${socket.id}`);
               const servData = await response.json()
               if (!servData || servData.error) {
                  
                  socket.emit("redirect", 'https://green-bot.app/server/' + servId + '');
                  return
               }

               if (!servData.exists.server) {
                  socket.emit("redirect", 'https://green-bot.app/profile');
                  return
               }

               // User stuff
               return_data.userdb = servData.exists.db;
               return_data.user.voice = servData.exists.voice;
               return_data.user.hasVoted = servData.exists.hasVoted;
               return_data.user.isDj = servData.exists.dj;
               // Server Stuff
               servData.data.premium = servData.exists.premium;
               return_data.server = servData.data;
               _sockets.push({ id: socket.id, data: socket, serverId: servId, userId: data.user.id, shard: servData.shardId });
               found_socket = { id: socket.id, data: socket, serverId: servId, userId: data.user.id, shard: servData.shardId, url: data.server.url }
               
               // Player Settings
               return_data.queue = servData.queue;
               socket.emit("data_send", return_data)
            })
            socket.on("change_bot", async (ctx) => {
               console.log("want me to change!")
               const { oldBot, newBot, data } = ctx

               if (oldBot) {
                  fetch(`${oldBot.url}/cleanSocket?socket=${socket.id}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {

                  });
               }
                  let return_data = { user: data.user, server: null, queue: null, userdb: null };
               let response = await fetch(`${newBot.url}/fetchserver?server=${servId}&asking=${data.userId}&socket=${socket.id}`);
               const servData = await response.json()
               if (!servData || servData.error) {
                                    console.log("no err")

                  socket.emit("redirect", `https://discord.com/oauth2/authorize?client_id=${newBot.id}&scope=bot+applications.commands&permissions=4331695368&guild_id=${servId}`);
                  return
               }

               if (!servData.exists.server) {
                  console.log("no exi")
                  socket.emit("redirect", 'https://green-bot.app/profile');
                  return
               }
                  if (!servData.exists.premium && newBot.id === "913065900125597706") {
                                       console.log("no pr")

                  return socket.emit("redirect", "https://green-bot.app/premium")
               }
               // User stuff
               return_data.userdb = servData.exists.db;
               return_data.user.voice = servData.exists.voice;
               return_data.user.hasVoted = servData.exists.hasVoted;
               return_data.user.isDj = servData.exists.dj;
               // Server Stuff
               servData.data.premium = servData.exists.premium;
               return_data.server = servData.data;
               _sockets = _sockets.filter(sk=>sk.id !== found_socket.id)
               _sockets.push({ id: socket.id, data: socket, serverId: servId, userId: data.userId, shard: servData.shardId });
               found_socket = { id: socket.id, data: socket, serverId: servId, userId: data.userId, shard: servData.shardId, url: newBot.url }

               // Player Settings
               return_data.queue = servData.queue;
               socket.emit("data_send", return_data)
            })
            socket.on('reconnect', async function (reason) {
               console.log("Socket is back.")
            });
            socket.on('disconnect', async function (reason) {
               console.log("bye")
               console.log(found_socket)
               fetch(`${found_socket ? found_socket.url : "http://185.183.33.10:8000"}/cleanSocket?socket=${socket.id}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {
               });
               console.log(`${found_socket ? found_socket.url : "http://185.183.33.10:8000"}/cleanSocket?socket=${socket.id}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`)
               _sockets = _sockets.filter(s => s.id !== socket.id)

            });
            socket.on("op", async data => {
               if (data.action === "remove") {
                  fetch(`${data.server.url}/removeSong?server=${servId}&songId=${data.songId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {

                  });
                  let target = _sockets.filter(s => s.serverId === servId)
                  target = target.filter(s => s.userId !== data.user.id)
                  if (!target.length) return
                  target.forEach(socket => {
                     socket.data.emit("refresh", { type: ["TRACK_REMOVED"], data: { uri: data.songId } })
                  })
                  return
               }
               if (data.action === "pause") {
                  fetch(`${data.server.url}/pause?server=${servId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {

                  });
                  const targets = _sockets.filter(sk=>sk.serverId === servId && sk.id !== socket.id);
                  if(targets.length == 0) return
                  if(targets)
                  for(const sk of targets){
                     sk.data.emit("refresh", { type: "CURRENT_SONG", data:  {
                        type: ["CURRENT_SONG",],
                        broadcast: true,
                        data: { current: data.current, paused: data.current.paused, loop: data.current.loop }
                     } })
                  }
                  return res.send({ done: true })
                  return
               }
               if (data.action === "jump") {
                  console.log(`${data.server.url}/jump?server=${servId}&songId=${data.songId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`)
                  fetch(`${data.server.url}/jump?server=${servId}&songId=${data.songId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {

                  });
                  let target = _sockets.filter(s => s.serverId === servId)
                  target = target.filter(s => s.userId !== data.user.id)
                  if (!target.length) return
                  target.forEach(socke_t => {
                     const found = _sockets.find(s => s.id === socke_t.id)
                     if (found) return
                     found.emit("refresh", { type: ["CURRENT_SONG", "NEXT_SONGS"], data: { current: data.current, paused: data.current.paused, loop: data.current.loop, incoming: data.next } })
                  })
                  return
               }
               if (data.action === "play_recent") {
                  fetch(`${data.server.url}/recent?server=${servId}&songId=${data.songId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {

                  });
                  let target = _sockets.filter(s => s.serverId === servId)
                  target = target.filter(s => s.userId !== data.user.id)
                  if (!target.length) return
                  target.forEach(socke_t => {
                     const found = _sockets.find(s => s.id === socke_t.id)
                     if (found) return
                     found.emit("refresh", { type: ["CURRENT_SONG", "RECENT_SONGS"], data: { current: data.current, paused: data.current.paused, loop: data.current.loop, recent: data.recent } })
                  })
                  return
               }
               if (data.action === "skip") {
                  fetch(`${data.server.url}/skip?server=${servId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`)
                     .catch(err => {

                     });
                  let target = _sockets.filter(s => s.serverId === servId)
                  target = target.filter(s => s.userId !== data.user.id)
                  if (!target.length) return
                  target.forEach(socke_t => {
                     const found = _sockets.find(s => s.id === socke_t.id)
                     if (found) return
                     found.emit("refresh", { type: ["CURRENT_SONG", "NEXT_SONGS"], data: { current: data.current, paused: data.current.paused, loop: data.current.loop, incoming: data.next } })
                  })
                  return
               }
               if (data.action === "back") {
                  fetch(`${data.server.url}/back?server=${servId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`)
                     .catch(err => {

                     });
                  let target = _sockets.filter(s => s.serverId === servId)
                  target = target.filter(s => s.userId !== data.user.id)
                  if (!target.length) return
                  target.forEach(socke_t => {
                     const found = _sockets.find(s => s.id === socke_t.id)
                     if (found) return
                     found.emit("refresh", { type: ["CURRENT_SONG", "RECENT_SONGS"], data: { current: data.current, paused: data.current.paused, loop: data.current.loop, recent: data.recent } })
                  })
                  return
               }
               if (data.action === "loop") {
                  fetch(`${data.server.url}/loop?server=${servId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`).catch(err => {

                  });
                  return
               }
               if (data.action === "shuffle") {
                  fetch(`${data.server.url}/shuffle?server=${servId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`)
                     .catch(err => {

                     });
                  return
               }
               if (data.action === "add_result") {
                  const song = data.songData;


                  let b = { name: song, userId: data.user.id }
                  if (data.toPlaylist) return
                  fetch(`${data.server.url}/add_result?server=${servId}&top=${data.top ? true : null}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`, {
                     method: "post",
                     body: JSON.stringify(b),
                     headers: { 'Content-Type': 'application/json' }
                  })
                     .catch(err => {

                     });
                     console.log(` ${data.server.url}/add_result?server=${servId}&top=${data.top ? true : null}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`)
                  return
               }
               if (data.action === "add_pl_track") {
                  const song = data.songData;

                  let b = { name: song, userId: data.user.id }
                  fetch(`${data.server.url}/add_pl_track?server=${servId}&user=${data.user.username}&avatar=${data.user.avatar}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`, {
                     method: "post",
                     body: JSON.stringify(b),
                     headers: { 'Content-Type': 'application/json' }
                  })
                     .catch(err => {

                     });
                  return
               }
               if (data.action === "remove_pl_track") {
                  const song = data.songId;
                  let b = { song: song, playlist: data.playlist }
                  fetch(`${data.server.url}/remove_pl_track?user=${data.user.id}`, {
                     method: "post",
                     body: JSON.stringify(b),
                     headers: { 'Content-Type': 'application/json' }
                  })
                     .catch(err => {

                     });
                  return
               }
               if (data.action === "like") {
                  const song = data.song;
                  let b = { song: song }
                  fetch(`${data.server.url}/handle_like?user=${data.user.id}`, {
                     method: "post",
                     body: JSON.stringify(b),
                     headers: { 'Content-Type': 'application/json' }
                  })
                     .catch(err => {

                     });
                  
                  return
               }

               if (data.action === "pl_play") {
                  let b = { name: data.name, user: data.user }
                  fetch(`${data.server.url}/play_pl?serverId=${servId}&shard=${found_socket ? found_socket.shard : `${_sockets.find(s => s.id === socket.id)?.shard}`}`, {
                     method: "post",
                     body: JSON.stringify(b),
                     headers: { 'Content-Type': 'application/json' }
                  })
                     .catch(err => {

                     });
                  
                  return
               }

               if (data.action === "search") {
                  if (!data.query || data.query === "") return
                  let results;
                console.log(data.query)
                  try {
                     results = await ytMusic.searchMusics(data.query);

                  } catch (error) {
                     console.log(error)
                     results = []
                  }
                  console.log(results[0])
                  let redable = results.map(s => {
                     return {
                        id: "https://youtube.com/watch?v="+s.youtubeId+"",
                        image: s.thumbnailUrl,
                        title: s.title,
                        artist: s.artists.map(x=>x.name).join(", "),
                        raw:  "https://youtube.com/watch?v="+s.youtubeId+"",
                        identifier: s.id,
                        duration: s.duration.label,
                        requesterName: data.user.username,
                        requesterAvatar: data.user.avatar
                     }

                  })
                  socket.emit("search_result", redable)
                  return
               }

            })

         })
      }
            if (req.method === "POST") {
         console.log(req.body)
         const { serverId, socketId, changes, queueData, userId } = req.body;
         if(!socketId){
           if(userId){
            const targets = _sockets.filter(sk=>sk.serverId === serverId && sk.userId === userId);
            if(targets.length == 0){
               return res.send({ outdated: true, message: "This socket is outdated" })

            }
            if(targets)
            for(const sk of targets){
               sk.data.emit("refresh", { type: changes, data: queueData })
            }
            return res.send({ done: true })
           }else{
            const targets = _sockets.filter(sk=>sk.serverId === serverId);
            if(targets.length == 0){
               return res.send({ outdated: true, message: "This socket is outdated" })

            }
            if(targets)
            for(const sk of targets){
               sk.data.emit("refresh", { type: changes, data: queueData })
            }
            return res.send({ done: true })
           }

         }else{
         let sockets = res.socket.server.io.of("/").sockets
         let found_socket = sockets.get(socketId)
         if (!found_socket) {
            return res.send({ outdated: true, message: "This socket is outdated" })
         }
         found_socket.emit("refresh", { type: changes, data: queueData })
         return res.send({ done: true })
         }
      }
   } catch (error) {
      console.log(error)
   }
   res.end()
}

export default SocketHandler