import { NextResponse, NextRequest } from 'next/server'
const fetch = require("node-fetch");

export async function middleware(req, res) {
    const { pathname } = req.nextUrl;
   
    if(pathname.includes("/images") || pathname.includes("/api") ||  pathname.includes("/socket.io"))return NextResponse.next()
    if (pathname == '/') {
        return NextResponse.redirect('https://green-bot.app/profile')
    } else if (pathname.startsWith('/app') ) {
        if(pathname.length < 5) return NextResponse.redirect("https://green-bot.app/404");
    }
    return NextResponse.next()
}