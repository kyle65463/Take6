export type PlayerEventType = "play card" | "select row";

export interface PlayerEvent {
	id: string;
	type: PlayerEventType;
}

export interface PlayCardEvent extends PlayerEvent {}

export interface SelectRowEvent extends PlayerEvent {
	rowIdx: number;
}
