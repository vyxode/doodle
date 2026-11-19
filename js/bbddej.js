// Banco de ejercicios de Bases de datos (UD02 y UD03): enunciados propios con su E/R y su modelo relacional.
// er usa la descripción corta de chen() (js/bbdd.js); rel, la notación de clase; alt, otras soluciones válidas;
// alias, otros nombres que se aceptan para una entidad o tabla.
export const EJERCICIOS_BD = [
  {
    id: 'musica', t: 'Escuela de música', dif: 1, temas: 'Entidades, 1:N y N:M con atributo',
    enun: `Una escuela de música quiere guardar a su alumnado, los instrumentos que enseña y a su profesorado.

De cada alumno se guarda un número de matrícula, que lo identifica, su nombre y su fecha de nacimiento. De cada instrumento, un código y su nombre (piano, violín…). De cada profesor, su DNI, su nombre y su teléfono.

Cada alumno estudia uno o varios instrumentos y, de cada instrumento que estudia, interesa el nivel en el que está. Un instrumento puede no tener ningún alumno este curso.

Cada profesor enseña exactamente un instrumento, y cada instrumento lo enseñan uno o varios profesores.`,
    er: { e: { ALUMNO: { x: 0, y: 100, a: ['#matricula', 'nombre', 'fecha_nac'] }, INSTRUMENTO: { x: 430, y: 100, a: ['#cod_instr', 'nombre'] }, PROFESOR: { x: 860, y: 100, a: ['#dni', 'nombre', 'telefono'] } },
      r: [{ n: 'estudia', x: 215, y: 90, con: [['ALUMNO', '(0,N)'], ['INSTRUMENTO', '(1,M)']], a: ['nivel'] }, { n: 'enseña', x: 650, y: 90, con: [['INSTRUMENTO', '(1,1)'], ['PROFESOR', '(1,N)']] }] },
    rel: `ALUMNO (matricula, nombre, fecha_nac)
   PK:  matricula

INSTRUMENTO (cod_instr, nombre)
   PK:  cod_instr

PROFESOR (dni, nombre, telefono, cod_instr)
   PK:  dni
   FK:  cod_instr → INSTRUMENTO
   VNN: cod_instr

ESTUDIA (matricula, cod_instr, nivel)
   PK:  (matricula, cod_instr)
   FK:  matricula → ALUMNO
   FK:  cod_instr → INSTRUMENTO`,
    notas: ['estudia es N:M: tabla nueva con las dos claves como PK. El nivel depende de la pareja alumno-instrumento, así que va ahí.', 'enseña es 1:N: la clave del instrumento viaja a PROFESOR. Todo profesor enseña uno, así que lleva VNN.', 'Pérdidas semánticas: «todo alumno estudia al menos un instrumento» y «todo instrumento tiene al menos un profesor» no se pueden obligar con claves.'],
  },
  {
    id: 'cines', t: 'Cadena de cines', dif: 2, temas: 'Entidad débil por identificación y 1:N opcional',
    enun: `Una cadena tiene varios cines, cada uno con un código y un nombre. Cada cine tiene varias salas, numeradas desde 1 dentro de cada cine (la sala 1 existe en todos los cines), y de cada sala se guarda su aforo.

Cada sala tiene en cartel una película, o ninguna si está cerrada por obras. Una película, identificada por un código y con su título y duración, puede estar en cartel en muchas salas o en ninguna.

Los empleados (DNI y nombre) trabajan en un único cine, y todo cine tiene al menos un empleado.`,
    er: { e: { CINE: { x: 0, y: 100, a: ['#cod_cine', 'nombre'] }, SALA: { x: 430, y: 100, d: true, a: ['%num_sala', 'aforo'] }, PELICULA: { x: 860, y: 100, a: ['#cod_peli', 'titulo', 'duracion'] }, EMPLEADO: { x: 0, y: 420, a: ['#dni', 'nombre'], ab: true } },
      r: [{ n: 'tiene (ID)', d: true, x: 215, y: 90, con: [['CINE', '(1,1)'], ['SALA', '(1,N)']] }, { n: 'proyecta', x: 645, y: 90, con: [['SALA', '(0,N)'], ['PELICULA', '(0,1)']] }, { n: 'trabaja', x: -5, y: 250, con: [['CINE', '(1,1)'], ['EMPLEADO', '(1,N)']], ab: false }] },
    alias: { PELICULA: ['FILM'] },
    rel: `CINE (cod_cine, nombre)
   PK:  cod_cine

SALA (cod_cine, num_sala, aforo, cod_peli)
   PK:  (cod_cine, num_sala)
   FK:  cod_cine → CINE
   FK:  cod_peli → PELICULA

PELICULA (cod_peli, titulo, duracion)
   PK:  cod_peli

EMPLEADO (dni, nombre, cod_cine)
   PK:  dni
   FK:  cod_cine → CINE
   VNN: cod_cine`,
    notas: ['SALA es débil por identificación: el número se repite entre cines, así que su PK es (cod_cine, num_sala) y cod_cine es además FK.', 'proyecta es 1:N con la sala en el lado N: cod_peli va en SALA y admite NULL (sala cerrada).', 'Pérdida semántica: «todo cine tiene al menos un empleado».'],
  },
  {
    id: 'veterinaria', t: 'Clínica veterinaria', dif: 1, temas: 'Atributos compuestos y multivaluados, débil por existencia',
    enun: `Una clínica veterinaria guarda a los propietarios de las mascotas: DNI, nombre, dirección (calle, número y ciudad) y uno o varios teléfonos.

Cada mascota tiene un número de chip que no se repite nunca, un nombre y una especie. Toda mascota tiene un único propietario registrado, y no tiene sentido guardar una mascota sin él. Todo propietario tiene al menos una mascota.

Los veterinarios (número de colegiado y nombre) tratan a las mascotas. Una mascota puede haber sido tratada por varios veterinarios, o por ninguno si es nueva, y un veterinario trata a muchas o a ninguna. De cada tratamiento se guarda el diagnóstico.`,
    er: { e: { PROPIETARIO: { x: 0, y: 140, a: ['#dni', 'nombre', '*telefono', 'direccion(calle,numero,ciudad)'] }, MASCOTA: { x: 470, y: 140, d: true, a: ['#chip', 'nombre', 'especie'] }, VETERINARIO: { x: 900, y: 140, a: ['#num_colegiado', 'nombre'] } },
      r: [{ n: 'tiene (E)', d: true, x: 250, y: 130, con: [['PROPIETARIO', '(1,1)'], ['MASCOTA', '(1,N)']] }, { n: 'trata', x: 690, y: 130, con: [['MASCOTA', '(0,N)'], ['VETERINARIO', '(0,M)']], a: ['diagnostico'] }] },
    alias: { PROPIETARIO: ['DUENO', 'CLIENTE'] },
    rel: `PROPIETARIO (dni, nombre, calle, numero, ciudad)
   PK:  dni

TELEFONO (dni, telefono)
   PK:  (dni, telefono)
   FK:  dni → PROPIETARIO

MASCOTA (chip, nombre, especie, dni)
   PK:  chip
   FK:  dni → PROPIETARIO
   VNN: dni

VETERINARIO (num_colegiado, nombre)
   PK:  num_colegiado

TRATA (chip, num_colegiado, diagnostico)
   PK:  (chip, num_colegiado)
   FK:  chip → MASCOTA
   FK:  num_colegiado → VETERINARIO`,
    notas: ['La dirección es compuesta: desaparece y quedan calle, numero y ciudad como columnas.', 'El teléfono es multivaluado: tabla aparte con PK (dni, telefono).', 'MASCOTA es débil por existencia: tiene identificador propio (chip), así que su PK es chip y la dependencia es la FK con VNN.', 'Pérdidas: «todo propietario tiene al menos una mascota» y «al menos un teléfono».'],
  },
  {
    id: 'bicis', t: 'Bicicletas municipales', dif: 2, temas: '1:1 opcional, 1:N opcional y reflexiva',
    enun: `Un servicio municipal de bicicletas tiene estaciones (código, dirección y número de anclajes) y bicicletas (número de bici y modelo).

Una bicicleta está anclada en una estación, o en ninguna si alguien la está usando o está en el taller. En una estación puede haber muchas bicis o ninguna.

Los usuarios se identifican por su DNI y se guarda su nombre y su correo. Un usuario puede tener alquilada en este momento una bici como mucho, y una bici la tiene alquilada un usuario o ninguno. Del alquiler se guarda la hora de inicio.

Un usuario nuevo puede darse de alta invitado por otro usuario, y un usuario puede invitar a muchos.`,
    er: { e: { ESTACION: { x: 0, y: 100, a: ['#cod_estacion', 'direccion', 'anclajes'] }, BICI: { x: 430, y: 100, a: ['#num_bici', 'modelo'] }, USUARIO: { x: 860, y: 100, a: ['#dni', 'nombre', 'correo'] } },
      r: [{ n: 'anclada', x: 215, y: 90, con: [['ESTACION', '(0,1)'], ['BICI', '(0,N)']] }, { n: 'alquila', x: 645, y: 90, con: [['BICI', '(0,1)'], ['USUARIO', '(0,1)']], a: ['hora_inicio'] }, { n: 'invita', x: 870, y: 300, con: [['USUARIO', '(0,1)', 'invitador'], ['USUARIO', '(0,N)', 'invitado']], ab: true }] },
    alias: { BICI: ['BICICLETA'] },
    rel: `ESTACION (cod_estacion, direccion, anclajes)
   PK:  cod_estacion

BICI (num_bici, modelo, cod_estacion)
   PK:  num_bici
   FK:  cod_estacion → ESTACION

USUARIO (dni, nombre, correo, dni_invitador)
   PK:  dni
   FK:  dni_invitador → USUARIO

ALQUILA (num_bici, dni, hora_inicio)
   PK:  num_bici
   UK:  dni
   FK:  num_bici → BICI
   FK:  dni → USUARIO
   VNN: dni`,
    alt: [`ESTACION (cod_estacion, direccion, anclajes)
   PK:  cod_estacion

BICI (num_bici, modelo, cod_estacion, dni, hora_inicio)
   PK:  num_bici
   UK:  dni
   FK:  cod_estacion → ESTACION
   FK:  dni → USUARIO

USUARIO (dni, nombre, correo, dni_invitador)
   PK:  dni
   FK:  dni_invitador → USUARIO`],
    notas: ['alquila es 1:1 opcional en los dos lados: tabla aparte con PK en una clave y UK obligatoria en la otra, sin nulos. También vale poner dni en BICI como FK con UK que admite NULL.', 'invita es reflexiva 1:N: FK dni_invitador hacia la propia tabla, con NULL para quien se apuntó solo.', 'anclada es 1:N opcional: cod_estacion en BICI admite NULL.'],
  },
  {
    id: 'cursos', t: 'Plataforma de cursos online', dif: 2, temas: 'Jerarquía parcial y solapada, 1:N y N:M',
    enun: `Una plataforma de cursos online tiene usuarios, identificados por su correo, de los que se guarda el nombre y la fecha de alta. Algunos usuarios son alumnos (se guarda su nivel) y otros son docentes (se guarda su especialidad). Un usuario puede ser alumno y docente a la vez, y hay usuarios que aún no son ninguna de las dos cosas.

Cada curso tiene un código, un título y un precio, y lo imparte exactamente un docente. Un docente imparte uno o varios cursos.

Los alumnos se inscriben en cursos, y de cada inscripción se guarda la fecha y la nota final. Todo alumno está inscrito al menos en un curso y puede estarlo en muchos; un curso puede no tener alumnos.`,
    er: { e: { USUARIO: { x: 430, y: 100, a: ['#correo', 'nombre', 'fecha_alta'] }, ALUMNO: { x: 60, y: 420, a: ['nivel'] }, DOCENTE: { x: 800, y: 420, a: ['especialidad'] }, CURSO: { x: 430, y: 840, a: ['#cod_curso', 'titulo', 'precio'], ab: true } },
      h: [{ x: 455, y: 230, sup: 'USUARIO', sub: ['ALUMNO', 'DOCENTE'], T: false, S: true }],
      r: [{ n: 'inscribe', x: 220, y: 640, con: [['ALUMNO', '(0,N)'], ['CURSO', '(1,M)']], a: ['fecha', 'nota'] }, { n: 'imparte', x: 640, y: 640, con: [['DOCENTE', '(1,1)'], ['CURSO', '(1,N)']] }] },
    rel: `USUARIO (correo, nombre, fecha_alta)
   PK:  correo

ALUMNO (correo, nivel)
   PK:  correo
   FK:  correo → USUARIO

DOCENTE (correo, especialidad)
   PK:  correo
   FK:  correo → USUARIO

CURSO (cod_curso, titulo, precio, correo_docente)
   PK:  cod_curso
   FK:  correo_docente → DOCENTE
   VNN: correo_docente

INSCRIPCION (correo_alumno, cod_curso, fecha, nota)
   PK:  (correo_alumno, cod_curso)
   FK:  correo_alumno → ALUMNO
   FK:  cod_curso → CURSO`,
    notas: ['Jerarquía (P,S): parcial porque hay usuarios que no son ni una cosa ni la otra; solapada porque se puede ser las dos. La opción B (supertipo y subtipos) vale siempre; la C (solo subtipos) no vale aquí.', 'imparte une DOCENTE (no USUARIO) con CURSO: solo los docentes imparten. Es 1:N y la FK va en CURSO con VNN.', 'inscribe es N:M con fecha y nota.'],
  },
  {
    id: 'metro', t: 'Red de metro', dif: 2, temas: 'N:M con atributo, reflexiva N:M y 1:1 con un lado obligatorio',
    enun: `Una red de metro tiene líneas (número y color) y estaciones (código, nombre y si está adaptada). Una línea pasa por muchas estaciones y por una estación pasa al menos una línea, a veces varias. De cada línea interesa el orden de cada estación en su recorrido.

Para calcular trayectos se guardan las conexiones directas entre estaciones: una estación conecta con varias estaciones y, de cada conexión, se guarda cuántos minutos se tarda.

Cada jefe de estación (número de empleado y nombre) es jefe de exactamente una estación. Una estación tiene como mucho un jefe; las pequeñas no tienen.`,
    er: { e: { LINEA: { x: 0, y: 100, a: ['#num_linea', 'color'] }, ESTACION: { x: 430, y: 100, a: ['#cod_estacion', 'nombre', 'adaptada'] }, JEFE: { x: 860, y: 100, a: ['#num_empleado', 'nombre'] } },
      r: [{ n: 'pasa', x: 215, y: 90, con: [['LINEA', '(1,N)'], ['ESTACION', '(1,M)']], a: ['orden'] }, { n: 'conecta', x: 440, y: 300, con: [['ESTACION', '(0,N)', 'origen'], ['ESTACION', '(0,M)', 'destino']], a: ['minutos'] }, { n: 'dirige', x: 645, y: 90, con: [['ESTACION', '(1,1)'], ['JEFE', '(0,1)']] }] },
    alias: { JEFE: ['JEFE_ESTACION', 'JEFE_DE_ESTACION'] },
    rel: `LINEA (num_linea, color)
   PK:  num_linea

ESTACION (cod_estacion, nombre, adaptada)
   PK:  cod_estacion

PASA (num_linea, cod_estacion, orden)
   PK:  (num_linea, cod_estacion)
   FK:  num_linea → LINEA
   FK:  cod_estacion → ESTACION

CONECTA (cod_origen, cod_destino, minutos)
   PK:  (cod_origen, cod_destino)
   FK:  cod_origen → ESTACION
   FK:  cod_destino → ESTACION

JEFE (num_empleado, nombre, cod_estacion)
   PK:  num_empleado
   UK:  cod_estacion
   FK:  cod_estacion → ESTACION
   VNN: cod_estacion`,
    notas: ['pasa es N:M con el atributo orden.', 'conecta es reflexiva N:M: tabla nueva con la clave de ESTACION dos veces, una por rol. Una regla de fila evitaría que una estación conecte consigo misma.', 'dirige es 1:1 con el jefe obligatorio: la FK va en JEFE, con UK (una estación, un jefe) y VNN.'],
  },
  {
    id: 'mensajeria', t: 'Empresa de mensajería', dif: 2, temas: '1:N obligatoria y opcional, 1:1 con un lado obligatorio',
    enun: `Una empresa de mensajería tiene clientes (código, nombre y dirección) que envían paquetes. Cada paquete tiene un número de seguimiento, un peso y un destino, y lo envía exactamente un cliente. Un cliente puede no haber enviado aún ningún paquete.

Los repartidores (DNI y nombre) entregan paquetes. Un paquete lo entrega un repartidor, o ninguno mientras está en el almacén. Un repartidor entrega muchos paquetes o ninguno.

Cada furgoneta (matrícula y capacidad) está asignada a exactamente un repartidor, y un repartidor tiene como mucho una furgoneta: los que reparten en moto no tienen.`,
    er: { e: { CLIENTE: { x: 0, y: 100, a: ['#cod_cliente', 'nombre', 'direccion'] }, PAQUETE: { x: 540, y: 100, a: ['#num_seguimiento', 'peso', 'destino'] }, REPARTIDOR: { x: 1040, y: 100, a: ['#dni', 'nombre'] }, FURGONETA: { x: 1040, y: 430, a: ['#matricula', 'capacidad'], ab: true } },
      r: [{ n: 'envia', x: 270, y: 90, con: [['CLIENTE', '(1,1)'], ['PAQUETE', '(0,N)']] }, { n: 'entrega', x: 800, y: 90, con: [['PAQUETE', '(0,N)'], ['REPARTIDOR', '(0,1)']] }, { n: 'asignada', x: 1050, y: 255, con: [['REPARTIDOR', '(1,1)'], ['FURGONETA', '(0,1)']], ab: false }] },
    rel: `CLIENTE (cod_cliente, nombre, direccion)
   PK:  cod_cliente

REPARTIDOR (dni, nombre)
   PK:  dni

PAQUETE (num_seguimiento, peso, destino, cod_cliente, dni_repartidor)
   PK:  num_seguimiento
   FK:  cod_cliente → CLIENTE
   FK:  dni_repartidor → REPARTIDOR
   VNN: cod_cliente

FURGONETA (matricula, capacidad, dni)
   PK:  matricula
   UK:  dni
   FK:  dni → REPARTIDOR
   VNN: dni`,
    notas: ['Las dos 1:N acaban en PAQUETE. La del cliente es obligatoria (VNN); la del repartidor no (NULL en el almacén).', 'asignada es 1:1 con la furgoneta obligatoria: la FK va en FURGONETA, con UK y VNN.'],
  },
  {
    id: 'liga', t: 'Liga de baloncesto', dif: 3, temas: 'Ternaria 1:N:N y 1:N',
    enun: `Una liga de baloncesto amateur guarda sus jugadores (número de licencia, nombre y fecha de nacimiento), sus equipos (código, nombre y ciudad) y las temporadas (año de inicio).

Interesa saber en qué equipo jugó cada jugador en cada temporada. En una temporada, un jugador juega en un solo equipo; un equipo tiene muchos jugadores en cada temporada, y un jugador puede repetir equipo varias temporadas. Se guarda el dorsal que llevó.

Cada equipo juega como local en exactamente un pabellón (código y nombre). En un pabellón pueden jugar varios equipos, y puede haber pabellones registrados sin ningún equipo.`,
    er: { e: { JUGADOR: { x: 0, y: 100, a: ['#licencia', 'nombre', 'fecha_nac'] }, EQUIPO: { x: 560, y: 100, a: ['#cod_equipo', 'nombre', 'ciudad'] }, TEMPORADA: { x: 285, y: 380, a: ['#anio'], ab: true }, PABELLON: { x: 1010, y: 100, a: ['#cod_pab', 'nombre'] } },
      r: [{ n: 'juega', x: 280, y: 90, con: [['JUGADOR', '(0,N)'], ['EQUIPO', '(1,1)'], ['TEMPORADA', '(0,N)']], a: ['dorsal'], ab: false }, { n: 'local_en', x: 790, y: 90, con: [['EQUIPO', '(0,N)'], ['PABELLON', '(1,1)']] }] },
    rel: `JUGADOR (licencia, nombre, fecha_nac)
   PK:  licencia

TEMPORADA (anio)
   PK:  anio

PABELLON (cod_pab, nombre)
   PK:  cod_pab

EQUIPO (cod_equipo, nombre, ciudad, cod_pab)
   PK:  cod_equipo
   FK:  cod_pab → PABELLON
   VNN: cod_pab

JUEGA (licencia, anio, cod_equipo, dorsal)
   PK:  (licencia, anio)
   FK:  licencia → JUGADOR
   FK:  anio → TEMPORADA
   FK:  cod_equipo → EQUIPO
   VNN: cod_equipo`,
    notas: ['juega es ternaria: el hecho necesita a los tres. Para una pareja (jugador, temporada) hay un solo equipo, así que junto a EQUIPO va (1,1): es 1:N:N.', 'En una 1:N:N la PK son las claves de los lados N (licencia, anio) y la del lado 1 va con VNN.', 'local_en es 1:N: cod_pab viaja a EQUIPO con VNN.'],
  },
  {
    id: 'hackathon', t: 'Hackathon', dif: 3, temas: 'Agregación, N:M y 1:N',
    enun: `En un hackathon participan equipos (código y nombre) que se apuntan a retos (código, título y dificultad). Un equipo se apunta al menos a un reto y puede apuntarse a varios; un reto puede no tener equipos. De cada participación se guarda la URL del proyecto entregado.

Cada participación la evalúa un miembro del jurado, o ninguno si el equipo no entregó a tiempo. Los miembros del jurado tienen DNI, nombre y empresa, y cada uno evalúa muchas participaciones o ninguna. De la evaluación se guarda la puntuación.

Los equipos están formados por participantes (DNI, nombre y edad). Cada participante está en un único equipo, y un equipo tiene uno o varios participantes.`,
    er: { g: [{ n: 'PARTICIPACION', x: -40, y: 10, w: 680, h: 260 }], e: { EQUIPO: { x: 0, y: 120, a: ['#cod_equipo', 'nombre'] }, RETO: { x: 460, y: 120, a: ['#cod_reto', 'titulo', 'dificultad'] }, JURADO: { x: 230, y: 540, a: ['#dni', 'nombre', 'empresa'], ab: true }, PARTICIPANTE: { x: -480, y: 120, a: ['#dni', 'nombre', 'edad'] } },
      r: [{ n: 'se_apunta', x: 225, y: 110, con: [['EQUIPO', '(0,N)'], ['RETO', '(1,M)']], a: ['url'] }, { n: 'evalua', x: 225, y: 330, con: [['PARTICIPACION', '(0,N)'], ['JURADO', '(0,1)']], a: ['puntuacion'] }, { n: 'forma', x: -260, y: 110, con: [['EQUIPO', '(1,1)'], ['PARTICIPANTE', '(1,N)']], ab: true }] },
    alias: { JURADO: ['MIEMBRO_JURADO', 'MIEMBRO'] },
    rel: `EQUIPO (cod_equipo, nombre)
   PK:  cod_equipo

RETO (cod_reto, titulo, dificultad)
   PK:  cod_reto

JURADO (dni, nombre, empresa)
   PK:  dni

PARTICIPANTE (dni, nombre, edad, cod_equipo)
   PK:  dni
   FK:  cod_equipo → EQUIPO
   VNN: cod_equipo

PARTICIPACION (cod_equipo, cod_reto, url, dni_jurado, puntuacion)
   PK:  (cod_equipo, cod_reto)
   FK:  cod_equipo → EQUIPO
   FK:  cod_reto → RETO
   FK:  dni_jurado → JURADO`,
    notas: ['La participación existe aunque nadie la evalúe: por eso se agrega (caja PARTICIPACION) en vez de hacer una ternaria.', 'Primero la N:M de dentro da la tabla PARTICIPACION. Luego evalua es 1:N con la agregación en el lado N: dni_jurado y puntuacion viajan a PARTICIPACION, y admiten NULL.', 'forma es 1:N: cod_equipo va en PARTICIPANTE con VNN.'],
  },
];
