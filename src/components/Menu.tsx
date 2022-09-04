import type { ReactNode } from "react";
import type {SyntheticEvent} from 'react';

type ItemProps = {
    active?: boolean;
    image: string;
    label: string;
    onClick: () => void;
};

function addDefaultSrc(ev: SyntheticEvent<HTMLImageElement, Event>) {
    ev.currentTarget.src = "/images/default.jpg";
  }
  
export const Item = (props: ItemProps) => (
    <a
        onClick={props.onClick}
        className={
            `flex gap-5 items-center overflow-hidden text-lg text-white font-bold whitespace-nowrap rounded hover:bg-opacity-25 transition duration-300 ease-in-out hover:opacity-75 cursor-pointer ` + //
            (props.active && (props.active ? "bg-gradient-to-r from-transparent to-green" : ""))
        }
    >
        
        <img src={props.image} alt={props.label} className="h-10 w-10 object-cover object-center rounded-lg"  onError={addDefaultSrc}/>
        <p className="truncate" title={props.label}>
            {props.label?props.label:"Green-bot Dashboard"}
        </p>
    </a>
);

type ContainerProps = {
    title: string;
    children: ReactNode;
    className?: string;
};

export const Container = ({ title, children, className }: ContainerProps) => (
    <div className={`relative px-1 grid gap-6 w-full ${className}`}>
        <p className="font-medium uppercase tracking-wide text-white text-left">{title}</p>
        <div className="relative grid gap-5">{children}</div>
    </div>
);
