export type PlayerEventType = "play card";

export interface PlayerEvent {
	id: string;
	type: PlayerEventType;
}

export interface PlayCardEvent extends PlayerEvent {}