import type { Song as SongType } from "@/types";
import type {SyntheticEvent} from 'react';


export type RecentProps = {
    song: SongType;
    // eslint-disable-next-line no-unused-vars
    onClick: (songId: number) => void;
};

function addDefaultSrc(ev: SyntheticEvent<HTMLImageElement, Event>) {
    ev.currentTarget.src = "/images/default.jpg";
  }
  

export const Recent = ({ song, ...props }: RecentProps) => (
    <a
        className="flex items-center gap-5 text-lg text-white whitespace-nowrap transition duration-300 w-full overflow-auto cursor-pointer hover:opacity-75 flex-shrink-0"
        onClick={() => props.onClick(song.id)}
    >
        <img src={song.image ? song.image :"/images/default.jpg"} onError={addDefaultSrc} alt="" className="h-14 w-14 object-cover object-center flex-shrink-0 rounded-full" />

        <div className="grid gap-1 overflow-auto max-w-full">
            <h4 className="font-bold truncate">{song.title}</h4>
            <p className="text-xs truncate">{song.artist}</p>
        </div>
    </a>
);

export type ItemProps = {
    song: SongType;
    isPlaying: boolean;
    // eslint-disable-next-line no-unused-vars
    onStatusChange: (songId: number, status: "play" | "pause") => any;
    // eslint-disable-next-line no-unused-vars
    NoRemove?:boolean,
    DisplayAdd?: boolean,
    DisplayReq?: boolean,
    NoPlay?:boolean,
    DisplayAddTop?:boolean,
    DisplayLike?:boolean,
   isLiked?:boolean,
    onLike?: (songId: SongType) => any;
    onRemove?: (songId: number) => any;
    onAdd?: (songId: number,top?:boolean) => any;
};

export const Item = ({ song, ...props }: ItemProps) => (
    
    <article className={song.isPlaying?"gap-3 flex flex-col md:flex-row items-center justify-between bg-white text-white bg-opacity-25 pb-5 md:pb-0 md:pr-4 flex-shrink-0 lg:max-h-25 md:max-h-20 overflow-hidden ":"gap-3 flex flex-col md:flex-row items-center justify-between hover:bg-white text-white hover:bg-opacity-25 pb-5 md:pb-0 md:pr-4 flex-shrink-0 lg:max-h-25 md:max-h-20 overflow-hidden "}>
        {/* Info */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 over overflow-hidden max-h-full w-full">
            {/* Image */}
            <img src={song.image?song.image:"/images/default.jpg"}onError={addDefaultSrc} alt={`${song.artist} - ${song.title}`} className="overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14  lg:h-15 lg:w-15   h-15 w-50  object-cover object-center flex-shrink-0" />

            {/* Description */}
            <section className="grid gap-1.5 place-items-center md:place-items-start">
                {/* Song Metadata */}
                <div className="grid gap-1">
                    {/* Song Title */}
                    <h6 className="font-bold lg:text-base md:text-sm text-sm">{song.title ? song.title.length>30?song.title.slice(0,30) + "..." :song.title :""}</h6>

                    {/* Song Artist */}
                    <p className="text-xs lg:text-sm">{song?.artist}</p>
                </div>

                {/* Requester */}
         
            </section>
        </div>

        {/* Control */}
        <div className="flex items-center gap-5">
            {/* Play/Pause */}
            {props.DisplayReq?"":  <div className="flex gap-2 items-center bg-white bg-opacity-10 rounded-full pr-3 w-max">
                    <img src={song.requesterAvatar?song.requesterAvatar:"/images/default.jpg"} onError={addDefaultSrc} className="w-4 h-4 rounded-full" alt="Avatar" />
                    <span className="lg:text-sm text-xs">{song.requesterName}</span>
                </div>}
            {props.NoPlay? ""  :props.isPlaying ? (
                // Pause
                <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 30 39" onClick={() => props.onStatusChange(song.id, "pause")}>
                    <path
                        d="M7.5 0.75H3.75C2.75544 0.75 1.80161 1.14509 1.09835 1.84835C0.395089 2.55161 0 3.50544 0 4.5V34.5C0 35.4946 0.395089 36.4484 1.09835 37.1516C1.80161 37.8549 2.75544 38.25 3.75 38.25H7.5C8.49456 38.25 9.44839 37.8549 10.1516 37.1516C10.8549 36.4484 11.25 35.4946 11.25 34.5V4.5C11.25 3.50544 10.8549 2.55161 10.1516 1.84835C9.44839 1.14509 8.49456 0.75 7.5 0.75V0.75ZM26.25 0.75H22.5C21.5054 0.75 20.5516 1.14509 19.8484 1.84835C19.1451 2.55161 18.75 3.50544 18.75 4.5V34.5C18.75 35.4946 19.1451 36.4484 19.8484 37.1516C20.5516 37.8549 21.5054 38.25 22.5 38.25H26.25C27.2446 38.25 28.1984 37.8549 28.9016 37.1516C29.6049 36.4484 30 35.4946 30 34.5V4.5C30 3.50544 29.6049 2.55161 28.9016 1.84835C28.1984 1.14509 27.2446 0.75 26.25 0.75V0.75Z"
                        fill="white"
                    />
                </svg>
            ) : (
                // Play
                <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 30 35" onClick={() => props.onStatusChange(song.id, "play")}>
                    <path
                        d="M0 4.76633C0 1.5345 3.24882 -0.519714 5.91584 1.02331L27.9103 13.7575C30.6966 15.3725 30.6966 19.6286 27.9103 21.2417L5.91584 33.9759C3.24882 35.5208 0 33.4647 0 30.2348V4.76633Z"
                        fill="white"
                    />
                </svg>
            )}
                      {props.DisplayLike? props.isLiked ? (
                // Pause
                <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16" onClick={() => props.onLike(song)}>
               <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                </svg>
            ) : (
                // Play
                <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16" onClick={() => props.onLike(song)}>
                             <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>

                </svg>
            ) :""}
{props.NoRemove?"":  <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16" onClick={() => props.onRemove(song.id)}>
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg>}
            {props.DisplayAdd?   
            <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16" onClick={() => props.onAdd(song.id)}>
           <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
</svg>

:""}
 {props.DisplayAddTop?   
             <svg className="h-5 fill-current hover:opacity-50 duration-200 cursor-pointer" viewBox="0 0 16 16" onClick={() => props.onAdd(song.id,true)}>
             <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
          </svg>

:""}
            {/* Remove */}
    
            {/* Duration */}
            <p className="font-light text-white text-sm ">{song.duration}</p>
        </div>
    </article>
);

export type ControlProps = {
    // eslint-disable-next-line no-unused-vars
    onControlClick: (status: "play" | "pause" | "shuffle" | "next" | "previous" | "repeat") => any;
    isPlaying: boolean;
};

export const Control = (props: ControlProps) => {
    const controlList = [
        {
            name: "shuffle",
            Icon: (props: any) => (
                <svg viewBox="0 0 20 20" {...props}>
                    <path d="M6.59 12.83L4.4 15c-.58.58-1.59 1-2.4 1H0v-2h2c.29 0 .8-.2 1-.41l2.17-2.18 1.42 1.42zM16 4V1l4 4-4 4V6h-2c-.29 0-.8.2-1 .41l-2.17 2.18L9.4 7.17 11.6 5c.58-.58 1.59-1 2.41-1h2zm0 10v-3l4 4-4 4v-3h-2c-.82 0-1.83-.42-2.41-1l-8.6-8.59C2.8 6.21 2.3 6 2 6H0V4h2c.82 0 1.83.42 2.41 1l8.6 8.59c.2.2.7.41.99.41h2z" />
                </svg>
            ),
        },
        {
            name: "previous",
            Icon: (props: any) => (
                <svg viewBox="0 0 20 20" {...props}>
                    <path d="M4 5h3v10H4V5zm12 0v10l-9-5 9-5z" />
                </svg>
            ),
        },
        {
            name: "pause",
            Icon: (props: any) => (
                <svg viewBox="0 0 30 35" {...props}>
                    <path d="M7.5 0.5H3.75C2.75544 0.5 1.80161 0.858213 1.09835 1.49584C0.395089 2.13346 0 2.99826 0 3.9V31.1C0 32.0017 0.395089 32.8665 1.09835 33.5042C1.80161 34.1418 2.75544 34.5 3.75 34.5H7.5C8.49456 34.5 9.44839 34.1418 10.1516 33.5042C10.8549 32.8665 11.25 32.0017 11.25 31.1V3.9C11.25 2.99826 10.8549 2.13346 10.1516 1.49584C9.44839 0.858213 8.49456 0.5 7.5 0.5V0.5ZM26.25 0.5H22.5C21.5054 0.5 20.5516 0.858213 19.8484 1.49584C19.1451 2.13346 18.75 2.99826 18.75 3.9V31.1C18.75 32.0017 19.1451 32.8665 19.8484 33.5042C20.5516 34.1418 21.5054 34.5 22.5 34.5H26.25C27.2446 34.5 28.1984 34.1418 28.9016 33.5042C29.6049 32.8665 30 32.0017 30 31.1V3.9C30 2.99826 29.6049 2.13346 28.9016 1.49584C28.1984 0.858213 27.2446 0.5 26.25 0.5V0.5Z" />
                </svg>
            ),
        },
        {
            name: "play",
            Icon: (props: any) => (
                <svg viewBox="0 0 30 35" {...props}>
                    <path d="M0 4.76633C0 1.5345 3.24882 -0.519714 5.91584 1.02331L27.9103 13.7575C30.6966 15.3725 30.6966 19.6286 27.9103 21.2417L5.91584 33.9759C3.24882 35.5208 0 33.4647 0 30.2348V4.76633Z" />
                </svg>
            ),
        },
        {
            name: "next",
            Icon: (props: any) => (
                <svg viewBox="0 0 20 20" {...props}>
                    <path d="M13 5h3v10h-3V5zM4 5l9 5-9 5V5z" />
                </svg>
            ),
        },
        {
            name: "repeat",
            Icon: (props: any) => (
                <svg viewBox="0 0 20 20" {...props}>
                    <path d="M5 4a2 2 0 0 0-2 2v6H0l4 4 4-4H5V6h7l2-2H5zm10 4h-3l4-4 4 4h-3v6a2 2 0 0 1-2 2H6l2-2h7V8z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex justify-between items-center w-full fill-white gap-3">
            {controlList.map(({ Icon, name }, index) => {
                if (
                    (!props.isPlaying && name === "pause") || // If not playing, only show play button
                    (props.isPlaying && name === "play") // If playing, only show pause button
                ) {
                    return null;
                }

                const isPlayButton = name.match(/^play$|^pause$/);

                return (
                    <div
                        key={index} //
                        onClick={() => props.onControlClick(name as any)}
                        className={
                            "hover:opacity-75 cursor-pointer duration-500 " + //
                            (isPlayButton && "bg-black p-4 rounded-full flex justify-center items-center")
                        }
                    >
                        <Icon className={`h-5`} />
                    </div>
                );
            })}
        </div>
    );
};
