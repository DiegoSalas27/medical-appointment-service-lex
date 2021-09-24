const axios = require('axios').default;

const doctores = [
  {
    id: 1,
    nombres: "Pedro",
    apellidos: "Cateriano",
    especialidad: "Dermatología",
    fechasDisponibles: [
      {
        fecha: "2021-08-08",
        horarios: [
          {
            horaInicio: "8:00",
            horaFin: "9:00",
          },
          {
            horaInicio: "9:00",
            horaFin: "10:00",
          },
        ],
      },
      {
        fecha: "2021-08-09",
        horarios: [
          {
            horaInicio: "11:00",
            horaFin: "12:00",
          },
          {
            horaInicio: "12:00",
            horaFin: "13:00",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    nombres: "Juan",
    apellidos: "Alvarado",
    especialidad: "Cardiología",
    fechasDisponibles: [
      {
        fecha: "2021-08-08",
        horarios: [
          {
            horaInicio: "8:00",
            horaFin: "9:00",
          },
          {
            horaInicio: "9:00",
            horaFin: "10:00",
          },
        ],
      },
      {
        fecha: "2021-10-10",
        horarios: [
          {
            horaInicio: "11:00",
            horaFin: "12:00",
          },
          {
            horaInicio: "12:00",
            horaFin: "13:00",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    nombres: "Javier",
    apellidos: "Piedra",
    especialidad: "Dermatología",
    fechasDisponibles: [
      {
        fecha: "2021-08-08",
        horarios: [
          {
            horaInicio: "8:00",
            horaFin: "9:00",
          },
          {
            horaInicio: "9:00",
            horaFin: "10:00",
          },
        ],
      },
      {
        fecha: "2021-08-09",
        horarios: [
          {
            horaInicio: "11:00",
            horaFin: "12:00",
          },
          {
            horaInicio: "12:00",
            horaFin: "13:00",
          },
        ],
      },
    ],
  },
];

function getSlots(intentRequest) {
  return intentRequest["sessionState"]["intent"]["slots"];
}

function getSlot(intentRequest, slotName) {
  const slots = getSlots(intentRequest);
  if (slots && slotName in slots && slots[slotName]) {
    return slots[slotName]["value"]["interpretedValue"];
  }
  return null;
}

function delegate(sessionAttributes, slots, intentRequest) {
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

function elicitSlot(
  intentRequest,
  sessionAttributes,
  slotToElicit,
  message,
  intentState
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

function getSessionAttributes(intentRequest) {
  const sessionState = intentRequest["sessionState"];
  if ("sessionAttributes" in sessionState) {
    return sessionState["sessionAttributes"];
  }
  return {};
}

function close(intentRequest, sessionAttributes, fulfillmentState, message) {
  intentRequest["sessionState"]["intent"]["state"] = fulfillmentState;

  // const requestAttributes =
  //   "requestAttributes" in intentRequest
  //     ? intentRequest["requestAttributes"]
  //     : null;

  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: "Close",
      },
      intent: intentRequest["sessionState"]["intent"],
    },
    messages: [message],
    // sessionId: intentRequest["sessionId"],
    // requestAttributes: requestAttributes,
  };
}

function retrieveDoctor(pos) {
  return doctores[pos];
}

function retrieveFecha(doctor, fecha) {
  return doctor.fechasDisponibles.filter((fe) => fe.fecha == fecha)[0];
}

function checkDoctorAvailability(fecha, especialidad) {
  return doctores.filter((doctor) => { // considerar disponibilidad horaria (booleano)
    if (
      doctor.especialidad == especialidad &&
      doctor.fechasDisponibles.find((fd) => fd.fecha == fecha)
    ) {
      return doctor;
    }
  });
}

function buildValidationResult(isValid, violatedSlot, messageContent) {
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

async function validateFechaEspecialidad(fecha, especialidad) {
  console.log("Especialidad val", especialidad);

  const { data} = axios.get('http://23.23.15.212/especialidades');

  console.log(data);

  if (especialidad && !especialidades.find((dt) => dt == especialidad)) {
    console.log("ERROR especialidad NOT FOUND");
    return buildValidationResult(
      false,
      "Especialidad",
      "No se ha encontrado la especialidad ingresada. Por favor, especifique la especialidad que desea escoger"
    );
  }

  if (fecha && !dates.find((dt) => dt == fecha)) {
    console.log("ERROR fecha NOT FOUND");
    return buildValidationResult(
      false,
      "Fecha",
      "No se ha encontrado una fecha disponible para la especialidad ingresada. Por favor, especifique otra fecha"
    );
  }

  return buildValidationResult(true, null, null);
}

function resetAllSlots(slots) {
  const keys = Object.keys(slots);
  keys.map((key) => {
    slots[key] = null;
  });
}

function retrieveSelectSchedule(intentRequest, fecha, index, sessionAttributes, slots, callback) {
  const doctorPos =
    +intentRequest["sessionState"]["sessionAttributes"]["doctorPos"];

  const doctor = retrieveDoctor(doctorPos - 1);
  const fechaSelected = retrieveFecha(doctor, fecha);

  if (!fechaSelected.horarios[index]) {
    const messageContent = `No se ha encontrado un horario disponible para la fecha ${fecha}.
    con el doctor ${doctor.nombres + " " + doctor.apellidos} Por favor, especifique otra fecha`;

    const validationResult = buildValidationResult(
      false,
      "Fecha",
      messageContent
    );

    // reseteamos los session attributes y rollbackeamos para volver a pedir fecha

    sessionAttributes["doctorPos"] = 0;
    sessionAttributes["horarioPos"] = 0; 
    slots['Fecha'] = null;
    slots['ConocerHorario'] = null;
    slots['ElegirHorario'] = null;

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

function retrieveDoctorSchedule(
  intentRequest,
  fecha,
  especialidad,
  sessionAttributes,
  slots,
  callback
) {
  // buscamos disponibilidad de doctor
  const doctorsAvailable = checkDoctorAvailability(fecha, especialidad);

  console.log("DOCS AVAILABLE", doctorsAvailable);
  console.log("DOCS POS", sessionAttributes["doctorPos"]);

  if (
    doctorsAvailable.length == 0 ||
    (sessionAttributes["doctorPos"] !== undefined &&
      sessionAttributes["doctorPos"] == doctorsAvailable.length)
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
    const messageContent = `El doctor ${
      doctorsAvailable[index].nombres + doctorsAvailable[index].apellidos
    } 
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

function dispatch(intentRequest, callback) {
  console.log(JSON.stringify(intentRequest));

  let sessionAttributes = getSessionAttributes(intentRequest);
  const slots = getSlots(intentRequest);
  const fecha = getSlot(intentRequest, "Fecha");
  const especialidad = getSlot(intentRequest, "Especialidad");
  const conocerHorario = getSlot(intentRequest, "ConocerHorario");
  const elegirHorario = getSlot(intentRequest, "ElegirHorario");

  const confirmationState =
    intentRequest["sessionState"]["intent"]["confirmationState"];

  const source = intentRequest["invocationSource"];

  if (confirmationState == "Confirmed") {
    console.log("CONFIRMADO") // Guardar en base de datos la cita medica
    console.log("THIS IS DONE!");
    const message = {
      contentType: "PlainText",
      content: "Su cita ha sido reservada",
    };
    const fulfillmentState = "Fulfilled";
    return callback(
      close(intentRequest, sessionAttributes, fulfillmentState, message)
    );
  } else if (confirmationState == "Denied") { // denided
    console.log("DIJO NO");

    console.log("RESET CONVERSATION");
    resetAllSlots(slots); // se elimina el valor de los slots para que lex lo vuelva a pedir
    sessionAttributes = {}; // se limpian todos los session attributes
    return callback(
      elicitSlot(
        intentRequest,
        sessionAttributes,
        "Especialidad",
        null,
        "Failed"
      )
    );
  }

  if (source == "DialogCodeHook") {
    const validationResult = validateFechaEspecialidad(fecha, especialidad);

    console.log("VALIDATION RESULT", validationResult);
    console.log("SESSION ATTRIBUTES", sessionAttributes);
    console.log("SLOTS", slots);

    if (!validationResult.isValid) {
      slots[validationResult["violatedSlot"]] = null; // se elimina el valor del slot para que lex lo vuelva a pedir
      return callback(
        elicitSlot(
          intentRequest,
          sessionAttributes,
          validationResult["violatedSlot"],
          validationResult["message"],
          "Failed"
        )
      );
    }

    if (!fecha && !especialidad) {
      // recién ha comenzado la interacción, el usuario no ha ingresado nada. Dejar al bot elicitar slots
      return callback(delegate(sessionAttributes, slots, null));
    } else if (fecha && especialidad && !conocerHorario) {
      return retrieveDoctorSchedule(
        intentRequest,
        fecha,
        especialidad,
        sessionAttributes,
        slots,
        callback
      );
    } else if (especialidad && !fecha) {
      return callback(
        elicitSlot(
          intentRequest,
          sessionAttributes,
          "Fecha",
          null,
          "InProgress"
        )
      );
    } else if (especialidad && fecha && conocerHorario && !elegirHorario) {
      // El usuario eligió o no a su doctor
      if (conocerHorario == "Si" || conocerHorario == "Sí") {
        console.log("DIJO SI");
        const index =
          intentRequest["sessionState"]["sessionAttributes"]["horarioPos"] !==
          undefined
            ? intentRequest["sessionState"]["sessionAttributes"]["horarioPos"]
            : 0;

        return retrieveSelectSchedule(intentRequest, fecha, index, sessionAttributes, slots, callback);
      } else {
        console.log("DIJO NO");
        // Vamos por el siguiente doctor
        return retrieveDoctorSchedule(
          intentRequest,
          fecha,
          especialidad,
          sessionAttributes,
          slots,
          callback
        );
      }
    } else if (especialidad && fecha && conocerHorario && elegirHorario) {
      if (elegirHorario == "Si" || elegirHorario == "Sí") {
        console.log("DIJO SI");

        const doctorPos =
          +intentRequest["sessionState"]["sessionAttributes"]["doctorPos"];

        const horarioPos =
          +intentRequest["sessionState"]["sessionAttributes"]["horarioPos"] - 1;

        const doctor = retrieveDoctor(doctorPos - 1);
        const fechaSelected = retrieveFecha(doctor, fecha);

        // Nos permite construir el Confirmation prompts

        slots["DoctorName"] = {
          value: {
            originalValue: doctor.nombres,
            interpretedValue: doctor.nombres,
            resolvedValues: [doctor.nombres],
          },
        };
        slots["DoctorLastName"] = {
          value: {
            originalValue: doctor.apellidos,
            interpretedValue: doctor.apellidos,
            resolvedValues: [doctor.apellidos],
          },
        };
        slots["HoraInicio"] = {
          value: {
            originalValue: fechaSelected.horarios[horarioPos].horaInicio,
            interpretedValue: fechaSelected.horarios[horarioPos].horaInicio,
            resolvedValues: [fechaSelected.horarios[horarioPos].horaInicio],
          },
        };
        slots["HoraFin"] = {
          value: {
            originalValue: fechaSelected.horarios[horarioPos].horaFin,
            interpretedValue: fechaSelected.horarios[horarioPos].horaFin,
            resolvedValues: [fechaSelected.horarios[horarioPos].horaFin],
          },
        };

        const outputSessionAttributes =
          intentRequest["sessionState"]["sessionAttributes"];

        return callback(
          delegate(outputSessionAttributes, slots, intentRequest)
        );
      } else {
        console.log("DIJO NO");

        const index =
          intentRequest["sessionState"]["sessionAttributes"]["horarioPos"];

        return retrieveSelectSchedule(intentRequest, fecha, index, sessionAttributes, slots, callback);
      }
    }
  } else {
    // theorettically this won't ever get called
    console.log("THIS IS DONE!");
    const message = {
      contentType: "PlainText",
      content: `El doctor ${retrieveDoctor(
        especialidad
      )} está disponible para atenderlo el 
          dia ${fecha}.
          Desea conocer su horario de atención?`,
    };
    const fulfillmentState = "Fulfilled";
    return callback(
      close(intentRequest, sessionAttributes, fulfillmentState, message)
    );
  }
}

exports.handler = (event, context, callback) => {
  try {
    dispatch(event, (response) => {
      callback(null, response);
    });
  } catch (err) {
    callback(err);
  }
};
