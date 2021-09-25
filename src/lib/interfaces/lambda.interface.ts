export interface Message {
	content: string;
	contentType: string;
}

export interface DialogAction {
	type: string;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface ConocerHorario {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface DoctorLastName {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface DoctorName {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface ElegirHorario {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface Especialidad {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface Fecha {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface HoraFin {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface HoraInicio {
	value: Value;
}

export interface Slot {
	conocerHorario: ConocerHorario;
	doctorLastName: DoctorLastName;
	doctorName: DoctorName;
	elegirHorario: ElegirHorario;
	especialidad: Especialidad;
	fecha: Fecha;
	horaFin: HoraFin;
	horaInicio: HoraInicio;
}

export interface Intent {
	name: string;
	slots: Slot;
	state: string;
	confirmationState: string;
}

export interface SessionAttribute {
	doctorPos: string;
	horarioPos: string;
}

export interface SessionState {
	dialogAction: DialogAction;
	intent: Intent;
	sessionAttributes: SessionAttribute;
	originatingRequestId: string;
}

export interface NluConfidence {
	score: number;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface ConocerHorario {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface DoctorLastName {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface DoctorName {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface ElegirHorario {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface Especialidad {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface Fecha {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface HoraFin {
	value: Value;
}

export interface Value {
	originalValue: string;
	interpretedValue: string;
	resolvedValues: string[];
}

export interface HoraInicio {
	value: Value;
}

export interface Slot {
	conocerHorario: ConocerHorario;
	doctorLastName: DoctorLastName;
	doctorName: DoctorName;
	elegirHorario: ElegirHorario;
	especialidad: Especialidad;
	fecha: Fecha;
	horaFin: HoraFin;
	horaInicio: HoraInicio;
}

export interface Intent {
	name: string;
	slots: Slot;
	state: string;
	confirmationState: string;
}

export interface Interpretation {
	nluConfidence: NluConfidence;
	intent: Intent;
}

export interface LambdaResponse {
	messages: Message[];
	sessionState: SessionState;
	interpretations?: Interpretation[];
	sessionId?: string;
}