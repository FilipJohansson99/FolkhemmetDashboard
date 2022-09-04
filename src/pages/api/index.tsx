const fetch = require("node-fetch");
import { NextResponse, NextRequest } from 'next/server'

const SocketHandler = async (req, res) => {
    const { serverId, socketId,changes, queueData } = req.body;
    

}

export default SocketHandler