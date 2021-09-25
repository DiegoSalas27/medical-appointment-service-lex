export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface DoctorName {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface Fecha {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface Especialidad {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface DoctorLastName {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface ConocerHorario {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface HoraFin {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface HoraInicio {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface ElegirHorario {
	shape: string;
	value: Value;
}

export interface Slot {
	doctorName: DoctorName;
	fecha: Fecha;
	especialidad: Especialidad;
	doctorLastName: DoctorLastName;
	conocerHorario: ConocerHorario;
	horaFin: HoraFin;
	horaInicio: HoraInicio;
	elegirHorario: ElegirHorario;
}

export interface Intent {
	slots: Slot;
	confirmationState: 'Confirmed' | 'Denied';
	name: string;
	state: string;
}

export interface Interpretation {
	intent: Intent;
	nluConfidence: number;
}

export interface SessionAttribute {
	doctorPos: string | number;
	horarioPos: string | number;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface DoctorName {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface Fecha {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface Especialidad {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface DoctorLastName {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface ConocerHorario {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface HoraFin {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface HoraInicio {
	shape: string;
	value: Value;
}

export interface Value {
	originalValue: string;
	resolvedValues: string[];
	interpretedValue: string;
}

export interface ElegirHorario {
	shape: string;
	value: Value;
}

export interface Slot {
	doctorName: DoctorName;
	fecha: Fecha;
	especialidad: Especialidad;
	doctorLastName: DoctorLastName;
	conocerHorario: ConocerHorario;
	horaFin: HoraFin;
	horaInicio: HoraInicio;
	elegirHorario: ElegirHorario;
}

export interface Intent {
	slots: Slot;
	confirmationState: 'Confirmed' | 'Denied';
	name: string;
	state: string;
}

export interface SessionState {
	sessionAttributes: SessionAttribute;
	activeContexts: any[];
	intent: Intent;
	originatingRequestId: string;
}

export interface Bot {
	aliasId: string;
	aliasName: string;
	name: string;
	version: string;
	localeId: string;
	id: string;
}

export type FulfillmentState = "Fulfilled";

export type intentState = "InProgress" | "Failed";

export interface LexEvent {
	sessionId: string;
	inputTranscript: string;
	interpretations: Interpretation[];
	responseContentType: string;
	invocationSource: string;
	messageVersion: string;
	sessionState: SessionState;
	bot: Bot;
	inputMode: string;
}