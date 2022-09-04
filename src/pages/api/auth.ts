const fetch = require("node-fetch");
import { NextResponse, NextRequest } from 'next/server'
const OAuthScope = ["identify", "guilds"].join(" ");
import axios from "axios";
import { stringify } from "querystring";

const SocketHandler = async (req, res) => {
    const { serverId, socketId, changes, queueData } = req.body;

    const { data } = await axios.post(
        "https://discordapp.com/api/v9/oauth2/token",
        stringify({
            client_id: "783708073390112830",
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: req.query.code,
            redirect_uri: `https://dash.green-bot.app/api/auth`,
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    if (data.scope !== OAuthScope) {
        return res
            .status(403)
            .send(
                `Expected scope "${OAuthScope}" but received scope "${data.scope}"`
            );
    }

    const { data: user } = await axios.get(
        "https://discordapp.com/api/v9/users/@me",
        {
            headers: {
                Authorization: `Bearer ${data.access_token}`,
            },
        }
    );


    localStorage.setItem("auth_user", data.access_token)
    localStorage.setItem("user_data", user)

}

export default SocketHandler