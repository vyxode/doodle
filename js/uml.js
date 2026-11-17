// Práctica de diagramas UML de Entornos (tema 4): enunciados de casos de uso y de actividades, comprobación del
// diagrama que dibujas en Doodle y una solución posible. Los enunciados están contados con mis palabras a partir
// de los del tema (04a, 04c, 04d, 04f) y de tus propios trabajos (Library SRS, SAI).

// ---------- comparar nombres: palabras clave, sin tildes, sin artículos y por la raíz ----------
const VACIAS = new Set('the a an of to for his her their its and or by at with from de del la el los las un una unos unas y o por para en con su sus al lo que se'.split(' '));
const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const raices = (s) => sinTildes(s).replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter((w) => w && !VACIAS.has(w)).map((w) => w.slice(0, 5));
const casa = (texto, alias) => { const t = new Set(raices(texto)); return alias.some((a) => { const r = raices(a); return r.length && r.every((x) => t.has(x)); }); };

// ---------- enunciados ----------
// casos: actores y casos con nombres que valen (alias); rel: relaciones que tendría una buena solución (se sugieren, no se exigen)
// actividad: acciones clave (alias), y si hace falta bucle, decisión o fork
export const PRACTICA_UML = [
  { id: 'uc-snack', tipo: 'casos', titulo: 'Snack vending machine', es: 'Máquina de snacks', fuente: 'Use case diagrams · Exercise 1',
    en: 'A snack machine has five shelves with eight products each, and every product has a two-digit code (11–18 on the first shelf, 21–28 on the second…). The machine does not accept money until the user has chosen a product. Before pressing the confirmation button the user can cancel at any time, and the money is given back. After confirming, a spiral drops the product so the user can take it, and then the user can take the change if there is any.',
    tr: 'Una máquina de snacks tiene cinco estantes con ocho productos cada uno y cada producto tiene un código de dos cifras (11–18 en el primero, 21–28 en el segundo…). La máquina no acepta dinero hasta que el usuario elige un producto. Antes de pulsar el botón de confirmar puede cancelar en cualquier momento y se le devuelve el dinero. Al confirmar, una espiral deja caer el producto para que lo recoja y después puede recoger el cambio, si lo hay.',
    actores: [{ id: 'u', n: 'User', alias: ['user', 'customer', 'client', 'buyer', 'usuario', 'cliente', 'comprador'] }],
    casos: [
      { id: 'choose', n: 'Choose product', alias: ['product', 'producto', 'choose', 'select', 'elegir', 'seleccionar'], actores: ['u'] },
      { id: 'money', n: 'Insert money', alias: ['money', 'dinero', 'pay', 'pagar', 'coin', 'moneda'], actores: ['u'] },
      { id: 'confirm', n: 'Confirm purchase', alias: ['confirm', 'confirmar'], actores: ['u'] },
      { id: 'cancel', n: 'Cancel operation', alias: ['cancel', 'cancelar'], actores: ['u'] },
      { id: 'deliver', n: 'Deliver product', alias: ['deliver', 'drop', 'take product', 'collect product', 'entregar', 'dispensar', 'recoger producto', 'soltar'] },
      { id: 'refund', n: 'Return money', alias: ['return money', 'refund', 'give back money', 'devolver dinero', 'devolucion'] },
      { id: 'change', n: 'Return change', alias: ['change', 'cambio', 'vuelta'], opcional: true },
    ],
    rel: [{ t: 'include', de: 'confirm', a: 'deliver' }, { t: 'include', de: 'cancel', a: 'refund' }, { t: 'extend', de: 'change', a: 'confirm' }],
    nota: 'El orden (primero el producto y luego el dinero) no se puede dibujar en un diagrama de casos de uso: eso va en el de actividades o el de secuencia.' },
  { id: 'uc-sudoku', tipo: 'casos', titulo: 'Sudoku app', es: 'App de Sudoku', fuente: 'Use case diagrams · Exercise 2',
    en: 'An app to solve Sudokus. To play, the user chooses "Start Game" and then a difficulty level. Then the user keeps choosing an empty cell and placing a number from 1 to 9 until the Sudoku is complete. At any moment the user can press "Check": the app answers "Everything is OK, you have X cells left" or "Error in highlighted cells", and in that case the wrong cells are highlighted. When the Sudoku is solved the app shows "Well done!" and the user sees the stats and the total time.',
    tr: 'Una app para resolver Sudokus. Para jugar, el usuario elige «Start Game» y después un nivel de dificultad. Luego va eligiendo una celda vacía y poniendo un número del 1 al 9 hasta completarlo. En cualquier momento puede pulsar «Check»: la app responde «Todo bien, te quedan X celdas» o «Error en las celdas marcadas», y en ese caso resalta las celdas mal. Cuando se resuelve, muestra «Well done!» y el usuario ve sus estadísticas y el tiempo total.',
    actores: [{ id: 'u', n: 'User', alias: ['user', 'player', 'usuario', 'jugador'] }],
    casos: [
      { id: 'start', n: 'Start game', alias: ['start', 'new game', 'empezar', 'iniciar', 'comenzar'], actores: ['u'] },
      { id: 'level', n: 'Choose difficulty', alias: ['difficulty', 'level', 'dificultad', 'nivel'] },
      { id: 'fill', n: 'Place number in cell', alias: ['cell', 'number', 'celda', 'numero', 'casilla'], actores: ['u'] },
      { id: 'check', n: 'Check Sudoku', alias: ['check', 'comprobar', 'verify', 'verificar'], actores: ['u'] },
      { id: 'mark', n: 'Highlight wrong cells', alias: ['highlight', 'wrong', 'error', 'resaltar', 'marcar'] },
      { id: 'stats', n: 'Show stats and time', alias: ['stats', 'statistics', 'time', 'estadisticas', 'tiempo', 'well done'] },
    ],
    rel: [{ t: 'include', de: 'start', a: 'level' }, { t: 'extend', de: 'mark', a: 'check' }, { t: 'extend', de: 'stats', a: 'check' }] },
  { id: 'uc-invoices', tipo: 'casos', titulo: 'Invoice checking module', es: 'Módulo de consulta de facturas', fuente: 'Use case diagrams · Exercise 3',
    en: 'A module to check invoices. Customers and business agents can use it after logging in with their user name and password. A customer can search their own invoices by date range or by amount. A business agent can search the invoices of their customers by customer and date range, or by customer and amount. When the search finishes, the module shows the results on screen.',
    tr: 'Un módulo para consultar facturas. Pueden usarlo clientes y agentes comerciales después de iniciar sesión con usuario y contraseña. Un cliente busca sus propias facturas por rango de fechas o por importe. Un agente busca las facturas de sus clientes por cliente y rango de fechas, o por cliente e importe. Al terminar la búsqueda, el módulo muestra los resultados en pantalla.',
    actores: [
      { id: 'c', n: 'Customer', alias: ['customer', 'client', 'cliente'] },
      { id: 'a', n: 'Business agent', alias: ['agent', 'agente', 'employee', 'empleado', 'comercial'] },
    ],
    casos: [
      { id: 'login', n: 'Log in', alias: ['log', 'login', 'sign', 'iniciar sesion', 'autenticar', 'authenticate'], actores: ['c', 'a'] },
      { id: 'own', n: 'Search own invoices', alias: ['own', 'propias', 'mis facturas', 'my invoices'], actores: ['c'] },
      { id: 'cust', n: 'Search customer invoices', alias: ['customer invoices', 'customers invoices', 'facturas cliente', 'facturas de clientes', 'by customer', 'por cliente'], actores: ['a'] },
      { id: 'date', n: 'Filter by date range', alias: ['date', 'fecha'] },
      { id: 'amount', n: 'Filter by amount', alias: ['amount', 'importe', 'cantidad'] },
      { id: 'results', n: 'Show results', alias: ['result', 'resultado', 'show', 'mostrar'] },
    ],
    rel: [{ t: 'include', de: 'own', a: 'results' }, { t: 'include', de: 'cust', a: 'results' }, { t: 'extend', de: 'date', a: 'own' }, { t: 'extend', de: 'amount', a: 'own' }],
    nota: 'Iniciar sesión es un caso de uso que comparten los dos actores. Si quieres, puedes poner un actor general «User» del que hereden los dos (generalización de actores, que el tema recomienda).' },
  { id: 'uc-loans', tipo: 'casos', titulo: 'Cultural organization: loans', es: 'Organización cultural: préstamos', fuente: 'Use case diagrams · Exercise 4 (y Requirements, Exercise 3)',
    en: 'A cultural organization lends two types of objects: music discs and books. New objects of both types can be added to the system. Users log in with a user name and password and can search any disc or book by type and/or by title. Once they choose an object, they can ask for it if it is not available. A user can have up to 5 objects on loan at the same time. If a user forgets the password, the system sends it by e-mail to the address they registered with.',
    tr: 'Una organización cultural presta dos tipos de objetos: discos de música y libros. Se pueden dar de alta objetos nuevos de los dos tipos. Los usuarios inician sesión con usuario y contraseña y pueden buscar cualquier disco o libro por tipo y/o por título. Cuando eligen un objeto, pueden pedirlo si no está disponible. Un usuario puede tener como mucho 5 objetos prestados a la vez. Si olvida la contraseña, el sistema se la envía por correo a la dirección con la que se registró.',
    actores: [
      { id: 'u', n: 'User', alias: ['user', 'member', 'usuario', 'socio'] },
      { id: 'adm', n: 'Administrator', alias: ['admin', 'administrator', 'employee', 'librarian', 'staff', 'administrador', 'empleado', 'bibliotecario'] },
    ],
    casos: [
      { id: 'login', n: 'Log in', alias: ['log', 'login', 'sign', 'iniciar sesion'], actores: ['u'] },
      { id: 'search', n: 'Search object', alias: ['search', 'find', 'buscar'], actores: ['u'] },
      { id: 'ask', n: 'Ask for object', alias: ['ask', 'request', 'borrow', 'loan', 'reserve', 'pedir', 'solicitar', 'prestamo', 'reservar'], actores: ['u'] },
      { id: 'max', n: 'Check loan limit', alias: ['limit', 'max', '5', 'limite', 'maximo'], opcional: true },
      { id: 'pwd', n: 'Recover password', alias: ['password', 'contrasena', 'forgot', 'olvid', 'recover', 'recuperar'], actores: ['u'] },
      { id: 'mail', n: 'Send e-mail', alias: ['mail', 'email', 'correo'], opcional: true },
      { id: 'add', n: 'Add object', alias: ['add', 'register object', 'new object', 'anadir', 'dar de alta', 'alta'], actores: ['adm'] },
    ],
    rel: [{ t: 'include', de: 'ask', a: 'max' }, { t: 'include', de: 'pwd', a: 'mail' }] },
  { id: 'uc-coffee', tipo: 'casos', titulo: 'Coffee machine', es: 'Máquina de café', fuente: 'Use case diagrams · A classical example',
    en: 'A coffee machine. The user starts by putting in enough money. Then the user chooses the amount of sugar and its type (white, brown…); white sugar is the default. Then the user chooses the product (just coffee, coffee with milk…). When the coffee has been prepared and served, the machine returns the change. If the user cancels before choosing the coffee, the machine returns the money.',
    tr: 'Una máquina de café. El usuario empieza metiendo dinero suficiente. Después elige la cantidad de azúcar y su tipo (blanco, moreno…); por defecto es blanco. Luego elige el producto (café solo, con leche…). Cuando el café está preparado y servido, la máquina devuelve el cambio. Si el usuario cancela antes de elegir el café, la máquina le devuelve el dinero.',
    actores: [{ id: 'u', n: 'User', alias: ['user', 'customer', 'client', 'usuario', 'cliente'] }],
    casos: [
      { id: 'money', n: 'Insert money', alias: ['money', 'dinero', 'pay', 'pagar', 'coin'], actores: ['u'] },
      { id: 'sugar', n: 'Choose sugar', alias: ['sugar', 'azucar'], actores: ['u'] },
      { id: 'product', n: 'Choose product', alias: ['product', 'coffee', 'drink', 'producto', 'cafe', 'bebida'], actores: ['u'] },
      { id: 'cancel', n: 'Cancel', alias: ['cancel', 'cancelar'], actores: ['u'] },
      { id: 'serve', n: 'Serve coffee', alias: ['serve', 'prepare', 'servir', 'preparar'], opcional: true },
      { id: 'return', n: 'Return money / change', alias: ['return', 'change', 'refund', 'devolver', 'cambio'] },
    ],
    rel: [{ t: 'include', de: 'cancel', a: 'return' }, { t: 'include', de: 'product', a: 'serve' }] },
  { id: 'uc-blog', tipo: 'casos', titulo: 'Blog', es: 'Blog', fuente: 'Requirements specification · Exercise 2',
    en: 'A blog has three types of users: administrators, editors and visitors. All of them must log in to enter the application. Administrators can register other users, editors can publish posts and visitors can comment on them.',
    tr: 'Un blog tiene tres tipos de usuarios: administradores, editores y visitantes. Todos tienen que iniciar sesión para entrar. Los administradores dan de alta a otros usuarios, los editores publican entradas y los visitantes las comentan.',
    actores: [
      { id: 'adm', n: 'Administrator', alias: ['admin', 'administrator', 'administrador'] },
      { id: 'ed', n: 'Editor', alias: ['editor'] },
      { id: 'vis', n: 'Visitor', alias: ['visitor', 'visitante', 'reader', 'lector'] },
    ],
    casos: [
      { id: 'login', n: 'Log in', alias: ['log', 'login', 'sign', 'iniciar sesion'], actores: ['adm', 'ed', 'vis'] },
      { id: 'reg', n: 'Register users', alias: ['register', 'add user', 'create user', 'dar de alta', 'registrar', 'alta'], actores: ['adm'] },
      { id: 'pub', n: 'Publish post', alias: ['publish', 'post', 'publicar', 'entrada'], actores: ['ed'] },
      { id: 'com', n: 'Comment post', alias: ['comment', 'comentar', 'comentario'], actores: ['vis'] },
    ],
    rel: [],
    nota: 'Los requisitos no funcionales del texto original (muchas visitas, varios servidores, interfaz sencilla, contraseñas cifradas) no son casos de uso: no los dibujes.' },
  { id: 'uc-library', tipo: 'casos', titulo: 'Library management (your SRS)', es: 'Biblioteca (tu SRS)', fuente: 'Tu trabajo Library_SRS',
    en: 'A small-town library lends books and music discs. Anyone (a guest, without an account) can search the catalogue and filter the search by title or type. Members are registered readers: they can do everything a guest does, log in, recover their password (they receive an e-mail), reserve an item that is on loan, renew a loan once (only if nobody has reserved the item) and see their loans. Librarians log in, manage the catalogue, register new members, lend items (checking that the item is available and that the member has fewer than 5 items) and register returns; if an item is returned late, a penalty is applied.',
    tr: 'Una biblioteca de pueblo presta libros y discos de música. Cualquiera (un invitado, sin cuenta) puede buscar en el catálogo y filtrar por título o tipo. Los socios son lectores registrados: pueden hacer todo lo del invitado, iniciar sesión, recuperar la contraseña (reciben un correo), reservar un objeto prestado, renovar un préstamo una vez (solo si nadie lo ha reservado) y ver sus préstamos. Los bibliotecarios inician sesión, gestionan el catálogo, dan de alta socios, prestan objetos (comprobando que está disponible y que el socio tiene menos de 5) y registran devoluciones; si se devuelve tarde, se aplica una penalización.',
    actores: [
      { id: 'g', n: 'Guest', alias: ['guest', 'visitor', 'invitado', 'visitante', 'anonymous'] },
      { id: 'm', n: 'Member', alias: ['member', 'reader', 'user', 'socio', 'lector', 'usuario'], padre: 'g' },
      { id: 'l', n: 'Librarian', alias: ['librarian', 'staff', 'employee', 'bibliotecario', 'empleado'] },
    ],
    casos: [
      { id: 'search', n: 'Search catalogue', alias: ['search', 'buscar', 'catalog', 'catalogo'], actores: ['g'] },
      { id: 'filter', n: 'Filter search', alias: ['filter', 'filtrar'] },
      { id: 'login', n: 'Log in', alias: ['log', 'login', 'sign', 'iniciar sesion'], actores: ['m', 'l'] },
      { id: 'pwd', n: 'Recover password', alias: ['password', 'contrasena', 'recover', 'recuperar'], actores: ['m'] },
      { id: 'mail', n: 'Send e-mail', alias: ['mail', 'email', 'correo'] },
      { id: 'reserve', n: 'Reserve item', alias: ['reserve', 'reservar', 'reserva'], actores: ['m'] },
      { id: 'renew', n: 'Renew loan', alias: ['renew', 'renovar'], actores: ['m'] },
      { id: 'checkres', n: 'Check reservations', alias: ['check reserv', 'comprobar reserv'], opcional: true },
      { id: 'my', n: 'View my loans', alias: ['my loans', 'mis prestamos', 'view loans', 'ver prestamos'], actores: ['m'], opcional: true },
      { id: 'cat', n: 'Manage catalogue', alias: ['manage catalog', 'gestionar catalogo', 'add item', 'anadir'], actores: ['l'] },
      { id: 'regm', n: 'Register member', alias: ['register member', 'new member', 'alta socio', 'registrar socio'], actores: ['l'] },
      { id: 'lend', n: 'Lend item', alias: ['lend', 'loan item', 'prestar', 'registrar prestamo'], actores: ['l'] },
      { id: 'avail', n: 'Check availability', alias: ['availab', 'disponib'] },
      { id: 'limit', n: 'Check loan limit', alias: ['limit', 'limite', 'max'] },
      { id: 'ret', n: 'Register return', alias: ['return', 'devolucion', 'devolver'], actores: ['l'] },
      { id: 'pen', n: 'Apply penalty', alias: ['penalty', 'penaliz', 'sancion', 'multa'] },
    ],
    rel: [{ t: 'extend', de: 'filter', a: 'search' }, { t: 'include', de: 'pwd', a: 'mail' }, { t: 'include', de: 'renew', a: 'checkres' }, { t: 'include', de: 'lend', a: 'avail' }, { t: 'include', de: 'lend', a: 'limit' }, { t: 'extend', de: 'pen', a: 'ret' }],
    nota: 'El socio hereda del invitado (generalización de actores): así no hace falta unir al socio con «Search catalogue».' },
  { id: 'uc-star', tipo: 'casos', titulo: 'Star Battle game', es: 'Juego Star Battle', fuente: 'Example of SRS (Star Battle)',
    en: 'Star Battle is a web and mobile strategy game. Players can be registered users (they sign up and log in) or guests. Registered users choose their side (Starfleet or Klingon Empire); guests can only play as the Klingon Empire. A game can be played against the AI or against another player online, with a difficulty level from 1 to 3. Each player places the six starships on the grid and then players take turns to shoot, choosing a ship, a weapon and the coordinates; a weapon can use double power. After every shot the damage is checked. Registered users can renew ammunition with points they have won. Starfleet can surrender. When the game ends, the ranking is updated.',
    tr: 'Star Battle es un juego de estrategia para web y móvil. Los jugadores pueden ser usuarios registrados (se registran e inician sesión) o invitados. Los registrados eligen bando (Starfleet o Imperio Klingon); los invitados solo pueden jugar como Klingon. Se juega contra la IA o contra otra persona por Internet, con una dificultad del 1 al 3. Cada jugador coloca sus seis naves en la cuadrícula y después disparan por turnos eligiendo nave, arma y coordenadas; un arma puede usar doble potencia. Tras cada disparo se comprueban los daños. Los registrados pueden renovar munición con puntos ganados. Starfleet puede rendirse. Al acabar se actualiza la clasificación.',
    actores: [
      { id: 'p', n: 'Player', alias: ['player', 'jugador', 'guest', 'invitado'] },
      { id: 'r', n: 'Registered user', alias: ['registered', 'registrado'], padre: 'p' },
    ],
    casos: [
      { id: 'sign', n: 'Sign up', alias: ['sign up', 'register', 'registrarse', 'registro'], actores: ['p'] },
      { id: 'login', n: 'Log in', alias: ['log in', 'login', 'sign in', 'iniciar sesion'], actores: ['r'] },
      { id: 'fleet', n: 'Choose fleet', alias: ['fleet', 'side', 'flota', 'bando'], actores: ['r'] },
      { id: 'mode', n: 'Choose game mode', alias: ['mode', 'modo', 'ai', 'ia', 'online'], actores: ['p'], opcional: true },
      { id: 'level', n: 'Choose difficulty', alias: ['difficulty', 'level', 'dificultad', 'nivel'], actores: ['p'] },
      { id: 'place', n: 'Place starships', alias: ['place', 'colocar', 'situar'], actores: ['p'] },
      { id: 'shoot', n: 'Shoot', alias: ['shoot', 'fire', 'attack', 'disparar', 'atacar'], actores: ['p'] },
      { id: 'double', n: 'Use double power', alias: ['double', 'doble'] },
      { id: 'damage', n: 'Check damage', alias: ['damage', 'dano', 'danos'] },
      { id: 'ammo', n: 'Renew ammunition', alias: ['ammun', 'municion', 'ammo'], actores: ['r'] },
      { id: 'surr', n: 'Surrender', alias: ['surrender', 'rendirse', 'rendicion'], actores: ['p'] },
    ],
    rel: [{ t: 'include', de: 'shoot', a: 'damage' }, { t: 'extend', de: 'double', a: 'shoot' }] },

  // ---------- diagramas de actividades ----------
  { id: 'ad-even', tipo: 'actividad', titulo: 'Even or odd', es: 'Par o impar', fuente: 'Activity diagrams · Exercise 2.1',
    en: 'A program asks the user for a number and then says whether it is even or odd.',
    tr: 'Un programa pide un número al usuario y le dice si es par o impar.',
    acciones: [{ n: 'Enter number', alias: ['number', 'numero', 'enter', 'ask', 'pedir', 'leer', 'read'] }, { n: 'Show "even"', alias: ['even', 'par'] }, { n: 'Show "odd"', alias: ['odd', 'impar'] }],
    decision: true },
  { id: 'ad-odd', tipo: 'actividad', titulo: 'Ask until odd', es: 'Pedir hasta que sea impar', fuente: 'Activity diagrams · Exercise 2.2',
    en: 'A program keeps asking the user for a number until the user types an odd number.',
    tr: 'Un programa pide números al usuario una y otra vez hasta que escribe uno impar.',
    acciones: [{ n: 'Enter number', alias: ['number', 'numero', 'enter', 'ask', 'pedir', 'leer', 'read'] }],
    decision: true, bucle: true },
  { id: 'ad-count', tipo: 'actividad', titulo: 'Count positives and negatives', es: 'Contar positivos y negativos', fuente: 'Activity diagrams · Exercise 2.3',
    en: 'A program keeps asking the user for numbers until the user types 0. Then it shows how many positive numbers and how many negative numbers were typed.',
    tr: 'Un programa pide números hasta que el usuario escribe 0. Entonces muestra cuántos positivos y cuántos negativos ha escrito.',
    acciones: [{ n: 'Enter number', alias: ['number', 'numero', 'enter', 'ask', 'pedir', 'leer', 'read'] }, { n: 'Add 1 to positives', alias: ['positiv'] }, { n: 'Add 1 to negatives', alias: ['negativ'] }, { n: 'Show totals', alias: ['show', 'total', 'mostrar', 'print'] }],
    decision: true, bucle: true },
  { id: 'ad-login3', tipo: 'actividad', titulo: 'Log in with 3 attempts', es: 'Login con 3 intentos', fuente: 'Activity diagrams · Exercise 2.4',
    en: 'A program asks the user for the user name and password. If they are not correct, it asks again, up to 3 times. After the third failed attempt it shows an error message and finishes.',
    tr: 'Un programa pide usuario y contraseña. Si no son correctos, vuelve a pedirlos, hasta 3 veces. Tras el tercer intento fallido muestra un error y termina.',
    acciones: [{ n: 'Enter user and password', alias: ['user', 'password', 'usuario', 'contrasena', 'credential', 'credencial'] }, { n: 'Show error', alias: ['error'] }, { n: 'Count attempt', alias: ['attempt', 'intento', 'try', 'count', 'contar'] }],
    decision: true, bucle: true },
  { id: 'ad-validate', tipo: 'actividad', titulo: 'Validate user and password', es: 'Validar usuario y contraseña', fuente: 'Activity diagrams · Example',
    en: 'The user must already be registered (write it in a note). The user types the user name and password and the system validates them. If they are wrong, an error message is shown and the user types them again. If they are right, an "ok" message is shown and then the user data.',
    tr: 'El usuario tiene que estar registrado antes (escríbelo en una nota). Escribe usuario y contraseña y el sistema los valida. Si están mal, se muestra un error y los vuelve a escribir. Si están bien, se muestra un mensaje «ok» y después sus datos.',
    acciones: [{ n: 'Type user and password', alias: ['user', 'password', 'usuario', 'contrasena'] }, { n: 'Validate', alias: ['validat', 'check', 'comprobar', 'validar'] }, { n: 'Show error', alias: ['error'] }, { n: 'Show "ok"', alias: ['ok'] }, { n: 'Show user data', alias: ['data', 'datos'] }],
    decision: true, bucle: true, notaObligatoria: true },
  { id: 'ad-loan', tipo: 'actividad', titulo: 'Library: ask for a book', es: 'Biblioteca: pedir un libro', fuente: 'Activity diagrams · Library management',
    en: 'Searching and asking for a book in a library. The user searches the book and the system checks if it is available; if not, it shows "not available" and the process ends. If it is available, it checks if the user is a member; if not, it shows "not a member" and ends. If the user is a member, it checks if they already have more books than allowed; if so, it shows a message about it and ends. Otherwise it registers the loan with the user and book data and updates the status of the book.',
    tr: 'Buscar y pedir un libro en una biblioteca. El usuario busca el libro y el sistema comprueba si está disponible; si no, muestra «no disponible» y termina. Si lo está, comprueba si el usuario es socio; si no, muestra «no es socio» y termina. Si es socio, comprueba si ya tiene más libros de los permitidos; si es así, lo avisa y termina. Si no, registra el préstamo con los datos del usuario y del libro y actualiza el estado del libro.',
    acciones: [{ n: 'Search book', alias: ['search', 'buscar'] }, { n: 'Show "not available"', alias: ['not available', 'no disponible'] }, { n: 'Show "not a member"', alias: ['not member', 'no socio', 'not a member'] }, { n: 'Show too many loans', alias: ['many', 'limit', 'excess', 'demasiados', 'limite', 'exceso'] }, { n: 'Register loan', alias: ['register loan', 'registrar prestamo', 'register', 'registrar'] }, { n: 'Update book status', alias: ['update', 'status', 'actualizar', 'estado'] }],
    decision: true, finales: 2 },
  { id: 'ad-sai', tipo: 'actividad', titulo: 'IT support intervention (your SAI)', es: 'Intervención del SAI (tu trabajo)', fuente: 'Tu trabajo SAI_Activity_Diagram',
    en: 'A user reports an incident to the IT support service. If it is not an IT problem, it is redirected to the right department and the process ends. Otherwise a ticket is registered. The technician connects remotely if possible or goes to the workplace, then diagnoses the problem. A software problem is repaired; a hardware problem needs a part (ordered first if there is no stock) that is replaced. The equipment is tested; if it still fails, the technician diagnoses again. When it works, the ticket is closed and the user is informed at the same time.',
    tr: 'Un usuario avisa de una incidencia al servicio de informática. Si no es un problema informático, se redirige al departamento adecuado y termina. Si lo es, se registra un ticket. El técnico se conecta en remoto si puede o va al puesto, y diagnostica el problema. Un problema de software se repara; uno de hardware necesita una pieza (se pide antes si no hay) que se cambia. Se prueba el equipo; si sigue fallando, vuelve a diagnosticar. Cuando funciona, se cierra el ticket y se informa al usuario a la vez.',
    acciones: [{ n: 'Receive incident', alias: ['incident', 'incidencia', 'report', 'aviso'] }, { n: 'Redirect', alias: ['redirect', 'redirigir', 'department', 'departamento'] }, { n: 'Register ticket', alias: ['ticket'] }, { n: 'Diagnose', alias: ['diagnos'] }, { n: 'Test equipment', alias: ['test', 'probar', 'prueba'] }, { n: 'Close ticket', alias: ['close', 'cerrar'] }, { n: 'Inform user', alias: ['inform', 'informar', 'notify', 'avisar'] }],
    decision: true, bucle: true, fork: true, finales: 2 },
];

// ---------- comprobar un diagrama de casos de uso ----------
const dentro = (n, caja, tam) => { const t = tam(n), b = tam(caja), cx = n.x + t.w / 2, cy = n.y + t.h / 2; return cx > caja.x && cx < caja.x + b.w && cy > caja.y && cy < caja.y + b.h; };
const tipoRel = (e) => (e.estilo === 'herencia' ? 'gen' : /include/i.test(e.etiqueta || '') ? 'include' : /extend/i.test(e.etiqueta || '') ? 'extend' : e.estilo === 'discontinua' ? 'discontinua' : 'linea');
export function comprobarCasos(d, ej, tam) {
  const res = []; // { ok: true|false|null (consejo), t }
  const N = d.nodos || [], A = d.aristas || [], de = (id) => N.find((n) => n.id === id);
  const actores = N.filter((n) => n.tipo === 'actor'), casos = N.filter((n) => n.tipo === 'caso'), sistemas = N.filter((n) => n.tipo === 'sistema');
  if (!casos.length) return [{ ok: false, t: 'Todavía no hay ningún caso de uso (óvalo).' }];
  // reglas del tema
  res.push(sistemas.length ? { ok: true, t: 'Hay un rectángulo de sistema.' } : { ok: false, t: 'Falta el rectángulo del sistema: los casos van dentro y los actores fuera.' });
  if (sistemas.length) {
    const fuera = casos.filter((c) => !sistemas.some((s) => dentro(c, s, tam))), mal = actores.filter((a) => sistemas.some((s) => dentro(a, s, tam)));
    res.push(fuera.length ? { ok: false, t: `Estos casos de uso están fuera del sistema: ${fuera.map((c) => c.texto).join(', ')}.` } : { ok: true, t: 'Todos los casos de uso están dentro del sistema.' });
    if (mal.length) res.push({ ok: false, t: `Los actores van fuera del sistema: ${mal.map((a) => a.texto).join(', ')}.` });
  }
  const sueltos = casos.filter((c) => !A.some((e) => e.de === c.id || e.a === c.id));
  if (sueltos.length) res.push({ ok: false, t: `Casos de uso sin ninguna línea: ${sueltos.map((c) => c.texto).join(', ')}. Todo caso lo empieza un actor, directamente o a través de otro caso.` });
  for (const e of A) {
    const a = de(e.de), b = de(e.a); if (!a || !b) continue;
    const r = tipoRel(e), par = [a.tipo, b.tipo].sort().join('-');
    if (par === 'caso-caso' && r === 'linea') res.push({ ok: false, t: `«${a.texto}» y «${b.texto}» están unidos con línea continua. Entre casos de uso solo se usa «include» o «extend».` });
    if (par === 'caso-caso' && r === 'discontinua') res.push({ ok: false, t: `La línea discontinua entre «${a.texto}» y «${b.texto}» no dice si es «include» o «extend».` });
    if (par === 'caso-caso' && r === 'gen') res.push({ ok: null, t: `Generalización entre «${a.texto}» y «${b.texto}»: el tema la desaconseja entre casos de uso; mejor «extend».` });
    if (par === 'actor-caso' && r !== 'linea') res.push({ ok: false, t: `Actor y caso de uso («${a.texto}» – «${b.texto}») se unen con línea continua (comunicación).` });
    if (par === 'actor-actor' && r !== 'gen') res.push({ ok: false, t: `Entre dos actores («${a.texto}», «${b.texto}») solo cabe la generalización (flecha de triángulo hueco).` });
  }
  const sustantivo = casos.filter((c) => /^(the |el |la )|^\S+(tion|cion|agement|miento)\b/i.test(sinTildes(c.texto).trim()));
  if (sustantivo.length) res.push({ ok: null, t: `Empieza el nombre con un verbo (p. ej. «Validate user», no «User validation»): ${sustantivo.map((c) => c.texto).join(', ')}.` });
  // lo que pide el enunciado
  const buscar = (lista, x) => lista.find((n) => casa(n.texto, x.alias));
  const faltanA = ej.actores.filter((x) => !buscar(actores, x));
  res.push(faltanA.length ? { ok: false, t: `Actor${faltanA.length > 1 ? 'es' : ''} que falta${faltanA.length > 1 ? 'n' : ''}: ${faltanA.map((x) => x.n).join(', ')}.` } : { ok: true, t: `Están los actores: ${ej.actores.map((x) => x.n).join(', ')}.` });
  const imprescindibles = ej.casos.filter((x) => !x.opcional), faltanC = imprescindibles.filter((x) => !buscar(casos, x));
  res.push(faltanC.length ? { ok: false, t: `Te faltan casos de uso para: ${faltanC.map((x) => x.n).join(', ')}.` } : { ok: true, t: `Están los ${imprescindibles.length} casos de uso principales.` });
  const opcionales = ej.casos.filter((x) => x.opcional && !buscar(casos, x));
  if (opcionales.length) res.push({ ok: null, t: `También podrías tener: ${opcionales.map((x) => x.n).join(', ')}.` });
  // quién usa cada caso
  for (const x of ej.casos.filter((c) => c.actores)) {
    const c = buscar(casos, x); if (!c) continue;
    for (const aid of x.actores) {
      const ax = ej.actores.find((a) => a.id === aid), an = buscar(actores, ax); if (!an) continue;
      const hijos = ej.actores.filter((h) => h.padre === aid).map((h) => buscar(actores, h)).filter(Boolean);
      const unido = [an, ...hijos].some((a) => A.some((e) => (e.de === a.id && e.a === c.id) || (e.a === a.id && e.de === c.id)));
      // también vale si lo alcanza a través de un caso que lo incluye o al que extiende
      const via = A.some((e) => (e.de === c.id || e.a === c.id) && tipoRel(e) !== 'linea');
      if (!unido && !via) res.push({ ok: false, t: `«${c.texto}» lo usa ${ax.n}, pero no hay línea entre los dos.` });
    }
  }
  // relaciones que tendría una buena solución
  for (const r of ej.rel) {
    const a = buscar(casos, ej.casos.find((c) => c.id === r.de)), b = buscar(casos, ej.casos.find((c) => c.id === r.a));
    if (!a || !b) continue;
    const e = A.find((x) => (x.de === a.id && x.a === b.id) || (x.de === b.id && x.a === a.id));
    const nombre = `«${a.texto}» ${r.t === 'include' ? '«include»' : '«extend»'} «${b.texto}»`;
    if (!e) { res.push({ ok: null, t: `Piensa si hace falta ${nombre}: ${r.t === 'include' ? 'pasa siempre' : 'pasa solo a veces'}.` }); continue; }
    const t = tipoRel(e);
    if (t !== r.t) res.push({ ok: null, t: `Entre «${a.texto}» y «${b.texto}» has puesto ${t === 'linea' ? 'una línea continua' : '«' + t + '»'}; ¿pasa siempre (include) o solo a veces (extend)?` });
    else if (e.de !== a.id) res.push({ ok: false, t: `${nombre}: la flecha va al revés. ${r.t === 'include' ? 'Sale del caso base y apunta al incluido.' : 'Sale del caso que extiende y apunta al caso base.'}` });
    else res.push({ ok: true, t: nombre + ', bien puesto.' });
  }
  return res;
}

// ---------- comprobar un diagrama de actividades ----------
export function comprobarActividad(d, ej) {
  const N = d.nodos || [], A = d.aristas || [], res = [];
  const ent = (id) => A.filter((e) => e.a === id), sal = (id) => A.filter((e) => e.de === id);
  const ini = N.filter((n) => n.tipo === 'inicio'), fin = N.filter((n) => n.tipo === 'fin');
  if (N.filter((n) => n.tipo !== 'nota').length < 2) return [{ ok: false, t: 'Todavía no hay diagrama: empieza por el nodo de inicio (círculo negro).' }];
  res.push(ini.length === 1 ? { ok: true, t: 'Hay un nodo de inicio.' } : { ok: false, t: ini.length ? 'Hay más de un nodo de inicio: solo puede haber uno.' : 'Falta el nodo de inicio (círculo negro).' });
  res.push(fin.length ? { ok: true, t: `Hay ${fin.length === 1 ? 'un nodo final' : fin.length + ' nodos finales'}.` } : { ok: false, t: 'Falta el nodo final (círculo con un punto negro dentro).' });
  if (ej.finales && fin.length && fin.length < ej.finales) res.push({ ok: null, t: 'Este proceso puede terminar de varias maneras: puedes usar un nodo final en cada una.' });
  for (const n of ini) if (ent(n.id).length) res.push({ ok: false, t: 'Al nodo de inicio no puede llegar ninguna flecha.' });
  for (const n of fin) if (sal(n.id).length) res.push({ ok: false, t: 'Del nodo final no puede salir ninguna flecha.' });
  const pasos = N.filter((n) => !['inicio', 'fin', 'nota'].includes(n.tipo));
  const sinSalida = pasos.filter((n) => !sal(n.id).some((e) => (N.find((x) => x.id === e.a) || {}).tipo !== 'nota'));
  if (sinSalida.length) res.push({ ok: false, t: `Sin flecha de salida: ${sinSalida.map((n) => n.texto || (n.tipo === 'decision' ? 'un rombo' : 'una barra')).join(', ')}. Todo paso tiene que seguir hacia otro o hacia un final.` });
  // todo se alcanza desde el inicio
  if (ini.length === 1) {
    const visto = new Set([ini[0].id]), cola = [ini[0].id];
    while (cola.length) for (const e of sal(cola.shift())) if (!visto.has(e.a)) { visto.add(e.a); cola.push(e.a); }
    const sueltos = N.filter((n) => n.tipo !== 'nota' && !visto.has(n.id));
    if (sueltos.length) res.push({ ok: false, t: `No se llega desde el inicio a: ${sueltos.map((n) => n.texto || n.tipo).join(', ')}.` });
  }
  for (const n of N.filter((x) => x.tipo === 'decision')) {
    const s = sal(n.id), e = ent(n.id);
    if (s.length >= 2) {
      const sinGuarda = s.filter((x) => !/\[.+\]/.test(x.etiqueta || ''));
      res.push(sinGuarda.length ? { ok: false, t: `Una decisión${n.texto ? ' («' + n.texto + '»)' : ''} tiene salidas sin condición entre corchetes, como [yes] / [no].` } : { ok: true, t: `Decisión${n.texto ? ' «' + n.texto + '»' : ''} con sus condiciones.` });
    } else if (e.length < 2 && s.length === 1) res.push({ ok: null, t: 'Hay un rombo con una entrada y una salida: si es una decisión, le falta otra salida; si es una unión (merge), le faltan entradas.' });
  }
  for (const n of N.filter((x) => x.tipo === 'barra')) {
    const s = sal(n.id).length, e = ent(n.id).length;
    if (!((e === 1 && s >= 2) || (e >= 2 && s === 1))) res.push({ ok: false, t: 'Una barra es un fork (una entrada, varias salidas a la vez) o un join (varias entradas, una salida).' });
  }
  const noFlecha = A.filter((e) => { const a = N.find((x) => x.id === e.de), b = N.find((x) => x.id === e.a); return a && b && a.tipo !== 'nota' && b.tipo !== 'nota' && e.estilo !== 'flecha'; });
  if (noFlecha.length) res.push({ ok: false, t: 'Los flujos de control son flechas: cambia el estilo de las líneas a «Flecha».' });
  // lo que pide el enunciado
  const faltan = ej.acciones.filter((x) => !N.some((n) => (n.tipo === 'accion' || n.tipo === 'nota') && casa(n.texto, x.alias)));
  res.push(faltan.length ? { ok: false, t: `Faltan acciones para: ${faltan.map((x) => x.n).join(', ')}.` } : { ok: true, t: 'Están las acciones principales.' });
  if (ej.decision && !N.some((n) => n.tipo === 'decision')) res.push({ ok: false, t: 'Hace falta al menos una decisión (rombo).' });
  if (ej.bucle) {
    // hay bucle si alguna flecha vuelve a un nodo desde el que se llega a ella
    const llega = (de, a) => { const v = new Set([de]), c = [de]; while (c.length) { const x = c.shift(); if (x === a) return true; for (const e of sal(x)) if (!v.has(e.a)) { v.add(e.a); c.push(e.a); } } return false; };
    res.push(A.some((e) => llega(e.a, e.de)) ? { ok: true, t: 'Tiene el bucle que pide (una flecha que vuelve atrás).' } : { ok: false, t: 'Aquí se repite algo: falta una flecha que vuelva atrás (bucle).' });
  }
  if (ej.fork && !N.some((n) => n.tipo === 'barra')) res.push({ ok: false, t: 'Hay dos acciones que se hacen a la vez: usa una barra de fork y otra de join.' });
  if (ej.notaObligatoria && !N.some((n) => n.tipo === 'nota')) res.push({ ok: null, t: 'El enunciado pide una nota (rectángulo con la esquina doblada).' });
  return res;
}

// ---------- una solución posible, dibujada ----------
// Casos de uso: actores a la izquierda, los casos que usan en una columna y los incluidos/extensiones al lado del suyo.
function solucionCasos(ej) {
  const nodos = [], aristas = [], id = (s) => 'sol-' + s, FILA = 80, sx = 220, sy = 20;
  const relDe = (c) => ej.rel.find((r) => r.de === c.id || r.a === c.id);
  const base = ej.casos.filter((c) => c.actores), resto = ej.casos.filter((c) => !c.actores && relDe(c));
  const y = {};
  base.forEach((c, i) => { y[c.id] = sy + 50 + i * FILA; });
  let libre = sy + 50;
  for (const c of resto) { const r = relDe(c), otro = r.de === c.id ? r.a : r.de; y[c.id] = Math.max(libre, y[otro] ?? libre); libre = y[c.id] + FILA; }
  const alto = Math.max(...Object.values(y)) + FILA + 10 - sy, ancho = resto.length ? 620 : 320;
  nodos.push({ id: id('sistema'), tipo: 'sistema', x: sx, y: sy, w: ancho, h: alto, texto: ej.titulo });
  base.forEach((c) => nodos.push({ id: id(c.id), tipo: 'caso', x: sx + 40, y: y[c.id], texto: c.n }));
  resto.forEach((c) => nodos.push({ id: id(c.id), tipo: 'caso', x: sx + 340, y: y[c.id], texto: c.n }));
  let ya = 0;
  for (const a of ej.actores) {
    const mios = base.filter((c) => c.actores.includes(a.id)).map((c) => y[c.id]);
    const ay = Math.max(ya, mios.length ? mios.reduce((s, v) => s + v, 0) / mios.length - 20 : ya);
    nodos.push({ id: id('a-' + a.id), tipo: 'actor', x: 60, y: ay, texto: a.n }); ya = ay + 150;
  }
  let k = 0;
  for (const c of base) for (const a of c.actores) aristas.push({ id: id('e' + k++), de: id('a-' + a), a: id(c.id), estilo: 'linea' });
  for (const r of ej.rel) aristas.push({ id: id('e' + k++), de: id(r.de), a: id(r.a), estilo: 'discontinua', etiqueta: r.t === 'include' ? '«include»' : '«extend»' });
  for (const a of ej.actores.filter((x) => x.padre)) aristas.push({ id: id('e' + k++), de: id('a-' + a.id), a: id('a-' + a.padre), estilo: 'herencia' });
  return { notacion: 'casos', nodos, aristas, vista: { x: 20, y: 20, z: 0.8 } };
}
// Actividades: escritas a mano, columna (c) y fila (f); flechas [de, a, guarda].
const ACT = {
  'ad-even': [[['i', 'inicio', 1, 0], ['pide', 'accion', 1, 1, 'Enter a number'], ['d', 'decision', 1, 2, 'number % 2 == 0?'], ['par', 'accion', 0, 3, 'Show "even"'], ['imp', 'accion', 2, 3, 'Show "odd"'], ['m', 'decision', 1, 4], ['f', 'fin', 1, 5]],
    [['i', 'pide'], ['pide', 'd'], ['d', 'par', '[yes]'], ['d', 'imp', '[no]'], ['par', 'm'], ['imp', 'm'], ['m', 'f']]],
  'ad-odd': [[['i', 'inicio', 1, 0], ['m', 'decision', 0, 1], ['pide', 'accion', 1, 2, 'Enter a number'], ['d', 'decision', 1, 3, 'Is it odd?'], ['f', 'fin', 1, 4]],
    [['i', 'm'], ['m', 'pide'], ['pide', 'd'], ['d', 'f', '[yes]'], ['d', 'm', '[no]']]],
  'ad-count': [[['i', 'inicio', 1, 0], ['m', 'decision', 0, 1], ['pide', 'accion', 1, 2, 'Enter a number'], ['d0', 'decision', 1, 3, 'number == 0?'], ['d', 'decision', 1, 4, 'number > 0?'], ['pos', 'accion', 0, 5, 'Add 1 to positives'], ['neg', 'accion', 1, 5, 'Add 1 to negatives'], ['show', 'accion', 2, 4, 'Show positives and negatives'], ['f', 'fin', 2, 5]],
    [['i', 'm'], ['m', 'pide'], ['pide', 'd0'], ['d0', 'show', '[yes]'], ['d0', 'd', '[no]'], ['d', 'pos', '[yes]'], ['d', 'neg', '[no]'], ['pos', 'm'], ['neg', 'm'], ['show', 'f']]],
  'ad-login3': [[['i', 'inicio', 1, 0], ['ini', 'accion', 1, 1, 'attempts = 0'], ['m', 'decision', 2, 2], ['pide', 'accion', 1, 3, 'Enter user and password'], ['d', 'decision', 1, 4, 'Correct?'], ['ok', 'accion', 0, 5, 'Show welcome'], ['inc', 'accion', 2, 5, 'Add 1 to attempts'], ['d3', 'decision', 3, 5, 'attempts == 3?'], ['err', 'accion', 3, 6, 'Show error'], ['f1', 'fin', 0, 6], ['f2', 'fin', 3, 7]],
    [['i', 'ini'], ['ini', 'm'], ['m', 'pide'], ['pide', 'd'], ['d', 'ok', '[yes]'], ['d', 'inc', '[no]'], ['inc', 'd3'], ['d3', 'm', '[no]'], ['d3', 'err', '[yes]'], ['ok', 'f1'], ['err', 'f2']]],
  'ad-validate': [[['n', 'nota', 2, 1, 'The user must be registered'], ['i', 'inicio', 1, 0], ['m', 'decision', 1, 1], ['pide', 'accion', 1, 2, 'Type user and password'], ['val', 'accion', 1, 3, 'Validate user and password'], ['d', 'decision', 1, 4, 'Correct?'], ['err', 'accion', 0, 4, 'Show error message'], ['ok', 'accion', 1, 5, 'Show "ok" message'], ['data', 'accion', 1, 6, 'Show user data'], ['f', 'fin', 1, 7]],
    [['n', 'pide', null, 'punteada'], ['i', 'm'], ['m', 'pide'], ['pide', 'val'], ['val', 'd'], ['d', 'err', '[no]'], ['err', 'm'], ['d', 'ok', '[yes]'], ['ok', 'data'], ['data', 'f']]],
  'ad-loan': [[['i', 'inicio', 1, 0], ['s', 'accion', 1, 1, 'Search book'], ['d1', 'decision', 1, 2, 'Available?'], ['na', 'accion', 0, 2, 'Show "not available"'], ['d2', 'decision', 1, 3, 'Is a member?'], ['nm', 'accion', 0, 3, 'Show "not a member"'], ['d3', 'decision', 1, 4, 'Too many loans?'], ['tm', 'accion', 0, 4, 'Show "too many loans"'], ['reg', 'accion', 1, 5, 'Register loan'], ['up', 'accion', 1, 6, 'Update book status'], ['fa', 'fin', -0.6, 2], ['fb', 'fin', -0.6, 3], ['fc', 'fin', -0.6, 4], ['f2', 'fin', 1, 7]],
    [['i', 's'], ['s', 'd1'], ['d1', 'na', '[no]'], ['d1', 'd2', '[yes]'], ['d2', 'nm', '[no]'], ['d2', 'd3', '[yes]'], ['d3', 'tm', '[yes]'], ['d3', 'reg', '[no]'], ['na', 'fa'], ['nm', 'fb'], ['tm', 'fc'], ['reg', 'up'], ['up', 'f2']]],
  'ad-sai': [[['i', 'inicio', 1, 0], ['rec', 'accion', 1, 1, 'Receive incident report'], ['d1', 'decision', 1, 2, 'IT problem?'], ['red', 'accion', 0, 2, 'Redirect to the right department'], ['f1', 'fin', 0, 3], ['tk', 'accion', 1, 3, 'Register ticket'], ['d2', 'decision', 1, 4, 'Can it be solved remotely?'], ['rem', 'accion', 0, 5, 'Connect remotely'], ['go', 'accion', 2, 5, 'Go to the workplace'], ['m1', 'decision', 1, 6], ['m2', 'decision', 0, 7], ['dia', 'accion', 1, 8, 'Diagnose the problem'], ['d3', 'decision', 1, 9, 'Hardware problem?'], ['sw', 'accion', 1, 10, 'Repair software'], ['hw', 'accion', 2, 10, 'Replace component'], ['m3', 'decision', 1, 11], ['test', 'accion', 1, 12, 'Test the equipment'], ['d4', 'decision', 0, 13, 'Solved?'], ['fork', 'barra', 1, 14], ['cl', 'accion', 0, 15, 'Close ticket'], ['inf', 'accion', 2, 15, 'Inform the user'], ['join', 'barra', 1, 16], ['f2', 'fin', 1, 17]],
    [['i', 'rec'], ['rec', 'd1'], ['d1', 'red', '[no]'], ['red', 'f1'], ['d1', 'tk', '[yes]'], ['tk', 'd2'], ['d2', 'rem', '[yes]'], ['d2', 'go', '[no]'], ['rem', 'm1'], ['go', 'm1'], ['m1', 'm2'], ['m2', 'dia'], ['dia', 'd3'], ['d3', 'sw', '[no]'], ['d3', 'hw', '[yes]'], ['sw', 'm3'], ['hw', 'm3'], ['m3', 'test'], ['test', 'd4'], ['d4', 'm2', '[no]'], ['d4', 'fork', '[yes]'], ['fork', 'cl'], ['fork', 'inf'], ['cl', 'join'], ['inf', 'join'], ['join', 'f2']]],
};
const TAM_ACT = { inicio: [30, 30], fin: [32, 32], decision: [46, 46], barra: [140, 8], accion: [190, 46], nota: [190, 40] };
function solucionActividad(ej) {
  const [nodos, flechas] = ACT[ej.id];
  return {
    notacion: 'actividad', vista: { x: 20, y: 20, z: 0.8 },
    nodos: nodos.map(([k, tipo, c, f, texto = '']) => { const [w, h] = TAM_ACT[tipo]; return { id: 'sol-' + k, tipo, x: 40 + c * 240 + (190 - w) / 2, y: 20 + f * 80 + (46 - h) / 2, texto }; }),
    aristas: flechas.map(([de, a, g, estilo], i) => ({ id: 'sol-e' + i, de: 'sol-' + de, a: 'sol-' + a, estilo: estilo || 'flecha', etiqueta: g || '' })),
  };
}
export const solucionUml = (ej) => (ej.tipo === 'casos' ? solucionCasos(ej) : solucionActividad(ej));
