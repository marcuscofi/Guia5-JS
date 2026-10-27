//Generamos un numero aleatorio que se encuentre en el rango del 1 al 25
const numeroAleatorio = Math.floor(Math.random() * 25) + 1;
// Creamos una constante que permite identificar el maximo de intentos
const numeroIntentos = 3;
// Guardara el numero de intentos que realiza el usuario
let intentos = 1;

function generarNumeroAleatorio() {
  //Definimos una variable para impresion de mensajes
  let mensaje;
  // Utilizamos el dom para acceder al parrafo creado
  const parrafo = document.querySelector("#idParrafo");

  // Verificamos en que intento esta el usuario
  if (intentos <= numeroIntentos) {
    // prompt devuelve texto (o null si se cancela); lo convertimos a entero
    const numero = parseInt(
      prompt("¿Que número se ha generado (Intento " + intentos + ")?"),
      10
    );

    //verificamos el numero aleatorio con el ingresado por el usuario
    if (numero === numeroAleatorio) {
      mensaje = `¡Es sorprente, pudiste adivinar el numero oculto (${numeroAleatorio}).
        Refresque la página para volver a jugar.`;
    } else if (intentos === numeroIntentos) {
      mensaje = `Su numero de intentos ha terminado.
        El numero oculto era: ${numeroAleatorio}. Refresque la página para volver a jugar.`;
    } else {
      // ---- EJERCICIO 1: pista de "más alto" o "más bajo" ----
      let pista;
      if (Number.isNaN(numero)) {
        pista = "Debe ingresar un número entero.";
      } else if (numero < numeroAleatorio) {
        pista = `El número ${numero} es muy bajo: el número que busca es MÁS ALTO.`;
      } else {
        pista = `El número ${numero} es muy alto: el número que busca es MÁS BAJO.`;
      }

      const restantes = numeroIntentos - intentos;
      mensaje = `Vuelve a intentar. ${pista} Quedan ${restantes} ${
        restantes === 1 ? "intento" : "intentos"
      }.`;
    }

    //aumentamos el valor de los intentos
    intentos++;
  } else {
    mensaje = `Su numero de intentos ha terminado.
      El numero oculto era: ${numeroAleatorio}. Refresque la página para volver a jugar.`;
  }

  parrafo.innerHTML = mensaje;
}
