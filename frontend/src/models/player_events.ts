export interface PlayerEvent {
	id: string;
	type: string;
}

export interface PlayCardEvent extends PlayerEvent {}