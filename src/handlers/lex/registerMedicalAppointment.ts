import { LexEvent, FulfillmentState } from '../../lib/interfaces/lex.interface';
import { getSessionAttributes, getSlot, getSlots, close, resetAllSlots, elicitSlot, validateFechaEspecialidad, delegate, retrieveDoctorSchedule, retrieveSelectSchedule, retrieveDoctor, retrieveFecha } from '../../lib/helpers/lambda-lex';
import { Message } from '../../lib/interfaces/lambda.interface';

exports.handler = async (event: LexEvent, context: any, callback: (error: any, response?: any) => any) => {
  try {
    await dispatch(event, (response) => {
      callback(null, response);
    });
  } catch (err) {
    callback(err);
  }
};

async function dispatch(intentRequest: LexEvent, callback: any) {
  console.log(JSON.stringify(intentRequest));

  let sessionAttributes = getSessionAttributes(intentRequest);
  const slots = getSlots(intentRequest);
  const fecha = getSlot(intentRequest, "Fecha");
  const especialidad = getSlot(intentRequest, "Especialidad");
  const conocerHorario = getSlot(intentRequest, "ConocerHorario");
  const elegirHorario = getSlot(intentRequest, "ElegirHorario");

  const confirmationState =
    intentRequest["sessionState"]["intent"]['confirmationState'];

  const source = intentRequest["invocationSource"];

  if (confirmationState == "Confirmed") {
    console.log("CONFIRMADO") // Guardar en base de datos la cita medica
    console.log("THIS IS DONE!");
    const message: Message = {
      contentType: "PlainText",
      content: "Su cita ha sido reservada",
    };
    const fulfillmentState: FulfillmentState = "Fulfilled";

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
    const validationResult = await validateFechaEspecialidad(fecha, especialidad);

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
      return await retrieveDoctorSchedule(
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
        return await retrieveDoctorSchedule(
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

