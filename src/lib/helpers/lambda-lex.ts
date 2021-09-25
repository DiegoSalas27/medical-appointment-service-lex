import { Message } from "../interfaces/lambda.interface";
import { doctores } from './doctors';
import {
  FulfillmentState,
  intentState,
  LexEvent,
  SessionAttribute,
  Slot,
} from "../interfaces/lex.interface";

const axios = require("axios").default;

export function getSessionAttributes(
  intentRequest: LexEvent
): SessionAttribute | {} {
  const sessionState = intentRequest["sessionState"];
  if ("sessionAttributes" in sessionState) {
    return sessionState["sessionAttributes"];
  }
  return {};
}

export function getSlots(intentRequest: LexEvent): Slot {
  return intentRequest["sessionState"]["intent"]["slots"];
}

export function getSlot(intentRequest: LexEvent, slotName: string): string {
  const slots = getSlots(intentRequest);
  if (slots && slotName in slots && slots[slotName]) {
    return slots[slotName]["value"]["interpretedValue"];
  }
  return null;
}

export function close(
  intentRequest: LexEvent,
  sessionAttributes: SessionAttribute | {},
  fulfillmentState: FulfillmentState,
  message: Message
) {
  intentRequest["sessionState"]["intent"]["state"] = fulfillmentState;

  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: "Close",
      },
      intent: intentRequest["sessionState"]["intent"],
    },
    messages: [message],
  };
}

export function resetAllSlots(slots: Slot): void {
  const keys = Object.keys(slots);
  keys.map((key) => {
    slots[key] = null;
  });
}

export function elicitSlot(
  intentRequest: LexEvent,
  sessionAttributes: SessionAttribute | {},
  slotToElicit: string,
  message: Message,
  intentState: intentState
) {
  intentRequest["sessionState"]["intent"]["state"] = intentState;

  if (message) {
    return {
      sessionState: {
        sessionAttributes,
        dialogAction: {
          type: "ElicitSlot",
          slotToElicit,
        },
        intent: intentRequest["sessionState"]["intent"],
      },
      messages: [message], // force the bot to say what the lambda dictates
    };
  } else {
    return {
      sessionState: {
        sessionAttributes,
        dialogAction: {
          type: "ElicitSlot",
          slotToElicit,
        },
        intent: intentRequest["sessionState"]["intent"], // Elicit next slot (it's all good)
      },
    };
  }
}

export async function validateFechaEspecialidad(
  fecha: string,
  especialidad: string
) {
  console.log("Especialidad val", especialidad);

  const response = await axios.get("http://23.23.15.212/especialidades");

  const especialidades = response.data.result;

  if (especialidad && !especialidades.find((dt) => dt.nombre == especialidad)) {
    console.log("ERROR especialidad NOT FOUND");
    return buildValidationResult(
      false,
      "Especialidad",
      "No se ha encontrado la especialidad ingresada. Por favor, especifique la especialidad que desea escoger"
    );
  }

  // if (fecha && !dates.find((dt) => dt == fecha)) {
  //   console.log("ERROR fecha NOT FOUND");
  //   return buildValidationResult(
  //     false,
  //     "Fecha",
  //     "No se ha encontrado una fecha disponible para la especialidad ingresada. Por favor, especifique otra fecha"
  //   );
  // }

  return buildValidationResult(true, null, null);
}

function buildValidationResult(
  isValid: boolean,
  violatedSlot: string,
  messageContent: string
) {
  if (!messageContent) {
    return {
      isValid,
      violatedSlot,
    };
  }

  return {
    isValid,
    violatedSlot,
    message: {
      contentType: "PlainText",
      content: messageContent,
    },
  };
}

export function delegate(
  sessionAttributes: SessionAttribute | {},
  slots: Slot,
  intentRequest: LexEvent
) {
  if (!intentRequest) {
    // tell the bot to start eliciting slots
    console.log("Delegating");
    return {
      sessionState: {
        sessionAttributes,
        dialogAction: {
          type: "Delegate",
          slots,
        },
      },
    };
  }

  console.log("Delegating and ready for fulfillment");

  intentRequest["sessionState"]["intent"]["state"] = "ReadyForFulfillment"; // tell the bot to finish the conversation
  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: "Delegate",
        slots,
      },
      intent: intentRequest["sessionState"]["intent"],
    },
  };
}

export async function retrieveDoctorSchedule(
  intentRequest: LexEvent,
  fecha: string,
  especialidad: string,
  sessionAttributes: SessionAttribute | {},
  slots: Slot,
  callback: any
) {
  // buscamos disponibilidad de doctor
  const doctorsAvailable = await checkDoctorAvailability(
    fecha,
    especialidad,
    sessionAttributes["doctorPos"]
  );

  console.log("DOCS AVAILABLE", doctorsAvailable);
  console.log("DOCS POS", sessionAttributes["doctorPos"]);

  if (
    doctorsAvailable.count == 0 ||
    (sessionAttributes["doctorPos"] !== undefined &&
      sessionAttributes["doctorPos"] == doctorsAvailable.count)
  ) {
    const messageContent = `No se ha encontrado un doctor disponible para el ${fecha}. 
    Por favor, especifique otra fecha`;

    const validationResult = buildValidationResult(
      false,
      "Fecha",
      messageContent
    );

    sessionAttributes["doctorPos"] = 0; // reseteamos la posicion de los doctores para comenzar de nuevo con otra fecha
    slots[validationResult["violatedSlot"]] = null;
    return callback(
      elicitSlot(
        // volvemos a pedir fecha para ver si encontramos un doctor disponible
        intentRequest,
        sessionAttributes,
        validationResult["violatedSlot"],
        validationResult["message"],
        "Failed"
      )
    );
  } else {
    const index =
      sessionAttributes["doctorPos"] !== undefined
        ? sessionAttributes["doctorPos"]
        : 0;
    const messageContent = `El doctor ${doctorsAvailable.doctor} 
        está disponible para atenderlo el dia ${fecha}.\nDesea conocer su horario de atención?`;

    // Session attributes contain application-specific information that is passed between
    // a bot and a client and lambda application during a session.
    // see https://docs.aws.amazon.com/lexv2/latest/dg/context-mgmt-session-attribs.html
    // con esto podemos ir manejando lo que la base de datos va validando (el id del doctor por ejemplo)
    // para luego volverlo a buscar y trabajar con el mimsmo doctor (cuando una lambda
    // se termina de ejecutar lo que se haya guardado en memoria se elimina. SessionAttributes
    // es la solucion)

    const outputSessionAttributes =
      intentRequest["sessionState"]["sessionAttributes"];
    outputSessionAttributes.doctorPos = +index + 1;

    const message = {
      contentType: "PlainText",
      content: messageContent,
    };

    return callback(
      elicitSlot(
        intentRequest,
        outputSessionAttributes,
        "ConocerHorario",
        message,
        "InProgress"
      )
    );
  }
}

async function checkDoctorAvailability(
  fecha: string,
  especialidad: string,
  doctorPos: string | number
) {
  let index = doctorPos !== undefined ? doctorPos : 0;
  const response = await axios.post(
    `http://23.23.15.212/doctor-fechas/buscar?index=${index}`,
    {
      especialidad: especialidad,
      fecha: fecha,
    }
  );

  const doctor = response.data.result;

  console.log("DOCTOR ENCONTRADO", doctor);

  return doctor;
}

export function retrieveSelectSchedule(
  intentRequest: LexEvent,
  fecha: string,
  index: string | number,
  sessionAttributes: SessionAttribute | {},
  slots: Slot,
  callback: any
) {
  const doctorPos =
    +intentRequest["sessionState"]["sessionAttributes"]["doctorPos"];

  const doctor = retrieveDoctor(doctorPos - 1);
  const fechaSelected = retrieveFecha(doctor, fecha);

  if (!fechaSelected.horarios[index]) {
    const messageContent = `No se ha encontrado un horario disponible para la fecha ${fecha}.
    con el doctor ${
      doctor.nombres + " " + doctor.apellidos
    } Por favor, especifique otra fecha`;

    const validationResult = buildValidationResult(
      false,
      "Fecha",
      messageContent
    );

    // reseteamos los session attributes y rollbackeamos para volver a pedir fecha

    sessionAttributes["doctorPos"] = 0;
    sessionAttributes["horarioPos"] = 0;
    slots["Fecha"] = null;
    slots["ConocerHorario"] = null;
    slots["ElegirHorario"] = null;

    return callback(
      elicitSlot(
        // volvemos a pedir fecha para ver si encontramos un doctor disponible
        intentRequest,
        sessionAttributes,
        validationResult["violatedSlot"],
        validationResult["message"],
        "Failed"
      )
    );
  } else {
    const messageContent = `El doctor ${
      doctor.nombres + " " + doctor.apellidos
    } tiene disponibilidad de
    ${fechaSelected.horarios[index].horaInicio} a ${
      fechaSelected.horarios[index].horaFin
    }.Desea elegir este horario?`;

    // si no desea elegir ese horario en la repeticion vamos al siguiente horario
    const outputSessionAttributes =
      intentRequest["sessionState"]["sessionAttributes"];
    outputSessionAttributes.horarioPos = +index + 1;

    const message = {
      contentType: "PlainText",
      content: messageContent,
    };

    return callback(
      elicitSlot(
        intentRequest,
        outputSessionAttributes,
        "ElegirHorario",
        message,
        "InProgress"
      )
    );
  }
}

export function retrieveDoctor(pos) {
  return doctores[pos];
}

export function retrieveFecha(doctor, fecha) {
  return doctor.fechasDisponibles.filter((fe) => fe.fecha == fecha)[0];
}
