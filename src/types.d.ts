export type Song = {
    id: number;
    image: string;
    title: string;
    artist: string;
    duration: string;
    requesterName: string;
    requesterAvatar: string;
    isPlaying?: boolean;
    loop?:boolean,
    identifier?: string,
    raw?:string,
    lavalink?: object;
    good?: boolean;
    currentDuration?: number;
    percentPlayed?: number;
    durationMs?: number;
};

export type Server = {
    id: string;
    name: string;
    image: string;
    premium?:boolean;
    url:string,
    settings?:serverSettings;
};
export type ServerSettings = {
    dj_commands: Array;
        
};


export type Playlist = {
    id: string;
    image: string;
    label: string;
    tracks?:Array;
};
export type User = {
    id: number;
    avatar: string;
    voice:boolean;
    isDj?:boolean;
    voted?:boolean;
    username: string;
};
export type ActualSong = {
    percent: number;

};

