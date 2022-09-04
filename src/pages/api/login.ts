const fetch = require("node-fetch");
import { NextApiResponse } from 'next';
import { NextResponse, NextRequest } from 'next/server'

const SocketHandler = async (req, res: NextApiResponse) => {
  return res.redirect("https://discord.com/oauth2/authorize?response_type=code&redirect_uri=https://dash.green-bot.app/api/auth&scope=identify%20guilds&client_id=783708073390112830")

}

export default SocketHandler