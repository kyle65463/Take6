export interface GameEvent {
	id: string;
	type: string;
}

export interface GameStartEvent extends GameEvent {}

export interface GameUpdateEvent extends GameEvent {}
