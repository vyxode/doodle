// Preguntas de repaso por módulo, sobre los temas que se ven en Aules hasta ahora.
// p: pregunta · o: opciones · c: índice de la correcta · x: explicación breve
window.REPASO = {
  'Bases de Datos': [
    { p: 'En el modelo E/R de Chen, ¿qué se dibuja con un rombo?', o: ['Una entidad', 'Una relación', 'Un atributo', 'Una jerarquía'], c: 1, x: 'Rectángulo = entidad, rombo = relación, elipse = atributo, triángulo = jerarquía (ES).' },
    { p: '¿Qué es una entidad débil?', o: ['Una entidad con pocos atributos', 'Una entidad que no puede identificarse sin otra entidad de la que depende', 'Una entidad sin relaciones', 'Una entidad con atributos derivados'], c: 1, x: 'Depende de una entidad fuerte (propietaria). Se dibuja con doble rectángulo y su relación con doble rombo.' },
    { p: 'Si junto a PEDIDO pone (0,N) en CLIENTE —realiza— PEDIDO, ¿qué significa?', o: ['Un pedido tiene muchos clientes', 'Un cliente puede tener entre 0 y muchos pedidos', 'Todo cliente tiene al menos un pedido', 'Cada pedido es de 0 clientes'], c: 1, x: 'La cardinalidad junto a una entidad indica cuántas ocurrencias de ella se relacionan con una de la otra.' },
    { p: 'Al pasar a relacional una relación 1:N, ¿dónde va la clave ajena?', o: ['En la tabla del lado 1', 'En la tabla del lado N', 'En una tabla nueva', 'En las dos tablas'], c: 1, x: 'La entidad del lado «muchos» recibe la clave primaria de la otra como clave ajena.' },
    { p: 'Al pasar a relacional una relación N:M, ¿qué se hace?', o: ['Se pone la clave ajena en cualquiera de las dos', 'Se crea una tabla nueva con las claves de ambas como clave primaria', 'Se fusionan las dos tablas', 'Se ignora la relación'], c: 1, x: 'La tabla intermedia lleva las dos claves (PK compuesta y FK) y los atributos propios de la relación.' },
    { p: '¿Cómo se representa un atributo multivaluado en Chen?', o: ['Elipse con línea discontinua', 'Elipse doble', 'Elipse subrayada', 'Rombo doble'], c: 1, x: 'Doble elipse = multivaluado; discontinua = derivado; subrayado = clave.' },
    { p: 'En una jerarquía, ¿qué significa que sea «total»?', o: ['Todo supertipo pertenece a algún subtipo', 'Un supertipo puede ser de varios subtipos', 'Los subtipos no tienen atributos', 'Hay exactamente dos subtipos'], c: 0, x: 'Total/parcial: si toda ocurrencia del supertipo está en algún subtipo. Exclusiva/solapada: si puede estar en uno o en varios.' },
    { p: 'Una clave primaria…', o: ['Puede tener valores repetidos', 'Puede ser nula', 'Identifica de forma única cada fila', 'Siempre es un número'], c: 2, x: 'Es única y no nula. Puede estar formada por varias columnas (compuesta).' },
    { p: '¿Para qué sirve una agregación en el modelo EER?', o: ['Para sumar valores', 'Para tratar una relación (con sus entidades) como una entidad que participa en otra relación', 'Para unir dos entidades iguales', 'Para crear una jerarquía'], c: 1, x: 'Se dibuja con un recuadro alrededor de la relación y sus entidades.' },
    { p: '¿Qué es un atributo derivado?', o: ['Uno que se calcula a partir de otros (p. ej. la edad desde la fecha de nacimiento)', 'Uno que viene de otra tabla', 'La clave ajena', 'Uno que puede tener varios valores'], c: 0, x: 'No hace falta guardarlo: se calcula. En Chen, elipse discontinua.' },
  ],
  'Programación': [
    { p: '¿Qué escribe Console.WriteLine(7 / 2); en C#?', o: ['3,5', '3', '4', 'Error'], c: 1, x: 'Entre enteros, «/» es división entera. Para 3,5 hace falta un double: 7 / 2.0 o (double)7 / 2.' },
    { p: '¿Cuál es el índice del último elemento de int[] a = new int[10]?', o: ['10', '9', '11', '1'], c: 1, x: 'Los arrays empiezan en 0: van de 0 a Length - 1.' },
    { p: '¿Qué devuelve "Hola".Length?', o: ['3', '4', '5', 'Error'], c: 1, x: 'Length es el número de caracteres.' },
    { p: '¿Qué hace "Hola mundo".Substring(5, 3)?', o: ['"mun"', '"o m"', '" mu"', '"mundo"'], c: 0, x: 'Substring(inicio, longitud): desde la posición 5 (la «m») toma 3 caracteres.' },
    { p: 'Para comparar dos cadenas alfabéticamente en C# se usa…', o: ['El operador >', 'CompareTo', 'Equals siempre', 'Length'], c: 1, x: 'a.CompareTo(b) da negativo, 0 o positivo según el orden alfabético.' },
    { p: '¿Qué tipo de bucle se ejecuta al menos una vez?', o: ['while', 'for', 'do…while', 'foreach'], c: 2, x: 'do…while comprueba la condición al final.' },
    { p: '¿Cómo se declara un array de dos dimensiones de 3×4 enteros?', o: ['int[3][4] m;', 'int[,] m = new int[3, 4];', 'int m[3,4];', 'int[] m = new int[3, 4];'], c: 1, x: 'Array rectangular: tipo[,] y new tipo[filas, columnas].' },
    { p: '¿Qué es un struct?', o: ['Un tipo que agrupa varios datos (campos) relacionados', 'Un bucle', 'Un método', 'Una cadena especial'], c: 0, x: 'Por ejemplo, struct Cancion con artista, título y duración.' },
    { p: '¿Qué hace Convert.ToInt32("abc")?', o: ['Devuelve 0', 'Lanza una FormatException', 'Devuelve -1', 'Devuelve 97'], c: 1, x: 'Si el texto no es un número se produce una excepción; se puede capturar con try/catch.' },
    { p: '¿Qué hace Split(\' \') sobre "uno dos tres"?', o: ['Devuelve el número de espacios', 'Devuelve un array con "uno", "dos" y "tres"', 'Quita los espacios', 'Devuelve "unodostres"'], c: 1, x: 'Parte la cadena por el separador indicado.' },
  ],
  'Entornos de Desarrollo': [
    { p: '¿Qué ciclo de vida sigue las fases una tras otra, sin volver atrás?', o: ['Espiral', 'Cascada', 'Incremental', 'Ágil'], c: 1, x: 'Cascada: requisitos, diseño, implementación, pruebas y mantenimiento en secuencia.' },
    { p: '¿Qué caracteriza al modelo en espiral?', o: ['No tiene fases', 'Iteraciones con análisis de riesgos en cada vuelta', 'Solo sirve para proyectos pequeños', 'No hay pruebas'], c: 1, x: 'Cada vuelta: planificación, análisis de riesgos, ingeniería y evaluación.' },
    { p: 'En Scrum, ¿cómo se llama cada iteración?', o: ['Fase', 'Sprint', 'Hito', 'Release'], c: 1, x: 'Un sprint suele durar de 1 a 4 semanas y termina con un incremento del producto.' },
    { p: '«La aplicación debe responder en menos de 2 segundos» es un requisito…', o: ['Funcional', 'No funcional', 'De usuario', 'De dominio'], c: 1, x: 'Los no funcionales describen cualidades (rendimiento, seguridad, usabilidad), no qué hace el sistema.' },
    { p: '«El usuario podrá exportar sus notas a PDF» es un requisito…', o: ['Funcional', 'No funcional', 'De hardware', 'Legal'], c: 0, x: 'Describe una función que el sistema debe ofrecer.' },
    { p: '¿Qué es el Product Backlog?', o: ['La lista priorizada de todo lo que hay que hacer en el producto', 'El informe final', 'El equipo de desarrollo', 'Un tipo de prueba'], c: 0, x: 'Lo gestiona el Product Owner.' },
    { p: 'En un tablero Kanban, el objetivo principal es…', o: ['Fijar sprints', 'Visualizar el flujo de trabajo y limitar el trabajo en curso', 'Escribir documentación', 'Hacer pruebas unitarias'], c: 1, x: 'Columnas como Por hacer / En curso / Hecho y límites de WIP.' },
    { p: '¿Qué es un IDE?', o: ['Un lenguaje de programación', 'Un entorno con editor, compilador y depurador integrados', 'Un sistema operativo', 'Una metodología'], c: 1, x: 'Por ejemplo Visual Studio, IntelliJ IDEA o VS Code con extensiones.' },
    { p: 'Un lenguaje compilado…', o: ['Se traduce entero a código máquina antes de ejecutarse', 'Se ejecuta línea a línea sin traducir', 'No necesita traducción', 'Solo funciona en la web'], c: 0, x: 'Frente a los interpretados, que se traducen mientras se ejecutan. Java y C# usan un paso intermedio (bytecode / IL).' },
    { p: 'En una prueba unitaria con JUnit, assertEquals(esperado, real)…', o: ['Imprime los valores', 'Falla la prueba si no son iguales', 'Compara referencias siempre', 'Solo sirve para cadenas'], c: 1, x: 'Si real no coincide con esperado, la prueba falla con un mensaje.' },
  ],
  'Lenguajes de Marcas': [
    { p: '¿Qué etiqueta HTML define el título que se ve en la pestaña del navegador?', o: ['<h1>', '<title>', '<header>', '<head>'], c: 1, x: '<title> va dentro de <head>.' },
    { p: '¿Cuál es el selector CSS de un elemento con id="menu"?', o: ['.menu', '#menu', 'menu', '*menu'], c: 1, x: '# para id, . para clase.' },
    { p: '¿Qué atributo es obligatorio en <img> por accesibilidad?', o: ['title', 'alt', 'width', 'name'], c: 1, x: 'alt describe la imagen si no se puede ver.' },
    { p: 'En el modelo de caja de CSS, ¿qué hay entre el borde y el contenido?', o: ['margin', 'padding', 'outline', 'gap'], c: 1, x: 'De dentro a fuera: contenido, padding, border, margin.' },
    { p: '¿Qué hace position: absolute?', o: ['Fija el elemento a la ventana', 'Lo coloca respecto al ancestro posicionado más cercano', 'Lo deja en su sitio normal', 'Lo oculta'], c: 1, x: 'Si ningún ancestro tiene position distinto de static, se toma la página.' },
    { p: '¿Qué hace position: fixed?', o: ['Lo coloca respecto a la ventana: no se mueve al hacer scroll', 'Lo coloca respecto a su padre', 'Lo pega al hacer scroll dentro de su contenedor', 'Nada'], c: 0, x: 'sticky es el que se queda pegado al llegar a una posición dentro de su contenedor.' },
    { p: '¿Qué etiqueta crea una fila en una tabla HTML?', o: ['<td>', '<tr>', '<th>', '<row>'], c: 1, x: '<tr> fila, <td> celda, <th> celda de cabecera.' },
    { p: '¿Qué significa que un documento XML esté «bien formado»?', o: ['Que cumple una DTD', 'Que cumple las reglas de sintaxis: una raíz, etiquetas cerradas y bien anidadas…', 'Que tiene estilos', 'Que no tiene atributos'], c: 1, x: 'Bien formado es la sintaxis; válido es además cumplir una DTD o un XSD.' },
    { p: '¿Qué selector tiene más prioridad (especificidad)?', o: ['p', '.nota', '#principal', '*'], c: 2, x: 'id > clase > etiqueta > universal.' },
    { p: '¿Para qué sirve el validador del W3C?', o: ['Para subir la web', 'Para comprobar que el HTML o el CSS cumplen el estándar', 'Para comprimir imágenes', 'Para ejecutar JavaScript'], c: 1, x: 'validator.w3.org para HTML y jigsaw.w3.org/css-validator para CSS.' },
  ],
  'Sistemas Informáticos': [
    { p: '¿Qué memoria pierde su contenido al apagar el ordenador?', o: ['SSD', 'RAM', 'ROM', 'Disco duro'], c: 1, x: 'La RAM es volátil.' },
    { p: '¿Qué componente conecta todos los demás y tiene el socket del procesador?', o: ['La fuente de alimentación', 'La placa base', 'La tarjeta gráfica', 'El disco'], c: 1, x: 'La placa base (motherboard), con su chipset, zócalos y conectores.' },
    { p: '¿Qué indica la potencia en vatios de una fuente de alimentación?', o: ['Su velocidad', 'La energía máxima que puede suministrar', 'Su tamaño', 'Su número de cables'], c: 1, x: 'Debe cubrir el consumo de todos los componentes con margen.' },
    { p: 'GPT frente a MBR…', o: ['Solo admite 4 particiones primarias', 'Admite discos de más de 2 TB y muchas más particiones', 'Es más antiguo', 'Solo funciona en Linux'], c: 1, x: 'MBR: máx. 4 primarias y 2 TB. GPT (con UEFI): hasta 128 particiones en Windows y discos enormes.' },
    { p: '¿Qué sistema de archivos se usa normalmente en Ubuntu?', o: ['NTFS', 'ext4', 'FAT32', 'APFS'], c: 1, x: 'ext4 en Linux, NTFS en Windows, APFS en macOS.' },
    { p: 'En un arranque dual (dual-boot), ¿qué suele instalarse primero?', o: ['Linux', 'Windows', 'Da igual siempre', 'El gestor de arranque'], c: 1, x: 'Windows primero, porque al instalarse sobrescribe el gestor de arranque; luego Linux instala GRUB, que detecta Windows.' },
    { p: '¿Qué diferencia principal hay entre Ubuntu Desktop y Ubuntu Server?', o: ['El núcleo', 'Server no trae entorno gráfico por defecto', 'Server es de pago', 'Desktop no tiene terminal'], c: 1, x: 'Server se administra por terminal y está pensado para servicios.' },
    { p: '¿Qué mide la frecuencia de un procesador?', o: ['Su memoria', 'Los ciclos de reloj por segundo (GHz)', 'Su temperatura', 'Sus núcleos'], c: 1, x: 'Más GHz no es todo: también cuentan núcleos, caché y arquitectura.' },
    { p: 'Un SSD frente a un disco duro mecánico…', o: ['Es más lento', 'No tiene partes móviles y es mucho más rápido', 'Tiene más capacidad por euro siempre', 'No necesita sistema de archivos'], c: 1, x: 'Los HDD siguen siendo más baratos por GB.' },
    { p: '¿Qué hace la memoria caché del procesador?', o: ['Guarda datos de forma permanente', 'Guarda copias de datos usados a menudo para acceder más rápido que a la RAM', 'Sustituye a la RAM', 'Enfría el procesador'], c: 1, x: 'Niveles L1, L2 y L3, de más rápida y pequeña a más lenta y grande.' },
    // Tema 2 (prácticas): d = dificultad (1 fácil, 2 media, 3 difícil). La correcta va la primera; se barajan al mostrarlas.
    { d: 1, p: '¿Cuál es el tamaño máximo de un archivo en FAT32?', o: ['4 GB', '16 TB', '16 EB', '2 TB'], c: 0, x: 'FAT32: 4 GB por archivo. NTFS: 16 EB. ext4: 16 TB (bloques de 4 KB).' },
    { d: 1, p: 'Pendrive de 128 GB para llevar vídeos de 8 GB entre Windows, macOS y Linux. ¿Qué sistema de archivos?', o: ['exFAT', 'FAT32', 'NTFS', 'ext4'], c: 0, x: 'FAT32 no admite archivos de más de 4 GB, NTFS solo se lee en macOS y ext4 no funciona en Windows ni macOS sin programas extra.' },
    { d: 1, p: 'Partición raíz de un servidor Linux con archivos de varios usuarios. ¿Qué sistema de archivos?', o: ['ext4', 'NTFS', 'FAT32', 'exFAT'], c: 0, x: 'ext4 guarda los permisos de cada archivo y tiene journaling.' },
    { d: 1, p: '¿Qué sistema de archivos lleva la partición EFI de un equipo UEFI?', o: ['FAT32', 'NTFS', 'ext4', 'exFAT'], c: 0, x: 'La especificación UEFI exige FAT: es lo que el firmware sabe leer antes de cargar el sistema.' },
    { d: 1, p: '¿Cuál es el tamaño máximo de un archivo en ext4 (bloques de 4 KB)?', o: ['16 TB', '4 GB', '16 EB', '1 EB'], c: 0, x: 'ext4: archivo 16 TB, partición 1 EB.' },
    { d: 2, p: '¿Dónde guarda NTFS los metadatos de todos los archivos?', o: ['En la MFT (Master File Table)', 'En la tabla de inodos', 'En el superbloque', 'En la tabla FAT'], c: 0, x: 'NTFS usa la MFT; ext4 se basa en inodos.' },
    { d: 2, p: 'Para un pendrive que se usa en Windows, macOS y Linux, ¿por qué se descarta NTFS?', o: ['macOS solo puede leerlo, no escribir', 'No admite archivos de más de 4 GB', 'No funciona en Windows', 'No admite particiones de 128 GB'], c: 0, x: 'NTFS: Windows completo, Linux lectura/escritura con controladores, macOS solo lectura.' },
    { d: 2, p: 'Disco externo de 2 TB para copias de Windows y de Linux conservando los permisos. ¿Qué harías?', o: ['Dos particiones: una NTFS y otra ext4', 'Una sola partición exFAT', 'Una sola partición FAT32', 'Una sola partición ext4 para los dos'], c: 0, x: 'NTFS guarda los permisos de Windows y ext4 los de Linux; ningún sistema cumple todo a la vez.' },
    { d: 3, p: 'Si eliges exFAT para un pendrive en vez de NTFS o ext4, ¿a qué renuncias?', o: ['A los permisos y al registro de cambios (journaling)', 'A los archivos de más de 4 GB', 'A usarlo en macOS', 'A particiones de más de 32 GB'], c: 0, x: 'exFAT no tiene permisos ni journaling.' },
    { d: 2, p: 'Cámara antigua que solo reconoce FAT32: ¿qué pasa cuando el vídeo llega a 4 GB?', o: ['La cámara corta el archivo: empieza otro o deja de grabar', 'El archivo se comprime solo', 'La tarjeta se formatea en exFAT', 'El vídeo sigue en el mismo archivo sin límite'], c: 0, x: 'Se evita grabando en fragmentos y uniéndolos después, o bajando la resolución o la calidad.' },
    { d: 1, p: '¿En qué sistema de archivos se instala Windows 11?', o: ['NTFS', 'FAT32', 'exFAT', 'ext4'], c: 0, x: 'Windows 11 solo se instala en NTFS (permisos, journaling, cifrado, archivos grandes).' },
    { d: 3, p: '¿Cuál es el tamaño máximo de partición de FAT32?', o: ['32 GB en la práctica (2 TB en teoría)', '16 EB', '1 EB', '4 GB'], c: 0, x: 'El límite práctico es 32 GB, aunque en teoría llega a 2 TB.' },
    { d: 2, p: '¿Qué sistema de archivos no tiene ni permisos ni journaling?', o: ['FAT32', 'NTFS', 'ext4', 'Ninguno de estos'], c: 0, x: 'NTFS tiene ACL y journaling; ext4, permisos Unix y journaling.' },
    { d: 3, p: '¿Cuál de estos tiene cifrado nativo?', o: ['NTFS (EFS)', 'ext4', 'FAT32', 'exFAT'], c: 0, x: 'ext4 cifra con herramientas externas (eCryptfs o LUKS).' },
    { d: 1, p: '¿Cuántas particiones primarias admite MBR?', o: ['4', '2', '128', 'Ilimitadas'], c: 0, x: 'MBR: 4 primarias, o 3 primarias + 1 extendida.' },
    { d: 1, p: '¿Cuántas particiones primarias admite GPT?', o: ['128', '4', '16', '8'], c: 0, x: 'GPT: hasta 128 primarias, sin extendidas ni lógicas.' },
    { d: 1, p: 'En Linux, ¿desde qué número se nombran las particiones lógicas?', o: ['Desde 5 (/dev/sda5)', 'Desde 1', 'Desde 4', 'Desde 0'], c: 0, x: 'Las primarias y la extendida usan del 1 al 4.' },
    { d: 2, p: '¿Qué esquema de particiones necesita UEFI?', o: ['GPT', 'MBR', 'Extendida', 'Ninguno'], c: 0, x: 'MBR es para BIOS (legacy); GPT requiere UEFI.' },
    { d: 2, p: '¿Qué tamaño de disco admite como máximo MBR?', o: ['2 TB', '512 GB', '8 ZiB', '16 EB'], c: 0, x: 'GPT llega hasta 8 ZiB.' },
    { d: 2, p: '¿Cuántas particiones extendidas puede haber en un disco?', o: ['Una, y solo en MBR', 'Cuatro', 'Una en MBR y otra en GPT', '128'], c: 0, x: 'La extendida ocupa una de las 4 ranuras primarias y contiene las lógicas.' },
    { d: 2, p: '¿Qué es la MSR?', o: ['La partición reservada de Microsoft en GPT, de 16 MB y sin formato', 'La partición de recuperación de Windows', 'La partición de arranque de GRUB', 'La tabla de particiones de MBR'], c: 0, x: 'Windows la crea en todos los discos GPT para uso interno; no tiene letra.' },
    { d: 3, p: '¿Dónde guarda GPT una copia de su tabla de particiones?', o: ['Al final del disco', 'En la partición EFI', 'En el MBR', 'No guarda copia'], c: 0, x: 'Si se daña la del principio, se puede recuperar.' },
    { d: 3, p: 'Un equipo con BIOS y disco MBR necesita 6 particiones (sistema, swap, datos y tres de pruebas). ¿Cómo se reparten?', o: ['3 primarias + 1 extendida con 3 lógicas', '6 primarias', '4 primarias + 2 lógicas', '2 extendidas con 3 lógicas cada una'], c: 0, x: 'La tabla MBR solo tiene 4 entradas: la cuarta se hace extendida y dentro van las lógicas (sda5, sda6, sda7).' },
    { d: 2, p: '¿Cómo se llama la primera partición de un SSD NVMe en Linux?', o: ['/dev/nvme0n1p1', '/dev/sda1', '/dev/nvme1', '/dev/nvme0p1'], c: 0, x: 'nvme0 = controladora, n1 = namespace, p1 = partición.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 2, p: 'Al instalar Ubuntu en una máquina con BIOS y disco GPT, el instalador crea una sda1 de 1 MB sin formato. ¿Qué es?', o: ['La partición BIOS boot que GRUB necesita al arrancar con BIOS desde un disco GPT', 'La partición EFI', 'La partición MSR', 'Un error del instalador'], c: 0, x: 'Guarda la parte de GRUB que en MBR iría detrás del primer sector.' },
    { d: 1, p: 'En un dual boot con Windows y Ubuntu, ¿qué se instala primero?', o: ['Windows', 'Ubuntu', 'Da igual', 'GRUB'], c: 0, x: 'Si Ubuntu va el último, su GRUB queda como gestor principal y detecta Windows.' },
    { d: 2, p: '¿Por qué se instala Ubuntu después de Windows?', o: ['GRUB detecta Windows y lo añade a su menú; el gestor de Windows no detecta Linux', 'Ubuntu necesita la partición C:', 'Windows borra el disco entero', 'Ubuntu no se puede instalar en un disco vacío'], c: 0, x: 'GRUB usa os-prober para encontrar los otros sistemas.' },
    { d: 2, p: 'Al instalar Ubuntu junto a Windows en UEFI, ¿qué se hace con la partición EFI que ya existe?', o: ['Se usa sin formatearla', 'Se formatea en FAT32', 'Se borra y se crea otra', 'Se formatea en ext4'], c: 0, x: 'Si se formatea, se borra el gestor de arranque de Windows.' },
    { d: 3, p: 'Si se instala primero Ubuntu y después Windows (UEFI), ¿qué pasa?', o: ['Windows se pone el primero en el orden de arranque y entra sin menú, pero Ubuntu sigue instalado', 'Ubuntu se borra del disco', 'GRUB detecta Windows automáticamente', 'El equipo deja de arrancar'], c: 0, x: 'Los archivos de GRUB siguen en \\EFI\\ubuntu; basta con volver a llamarlos.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 3, p: 'Un portátil con 16 GB de RAM va a tener Ubuntu sin hibernación. ¿Cuánta swap se recomienda (guía SwapFaq de Ubuntu)?', o: ['4 GB', '16 GB', '20 GB', '32 GB'], c: 0, x: 'Según la guía SwapFaq de Ubuntu. Con hibernación harían falta unos 20 GB.' },
    { d: 2, p: 'Portátil con UEFI y SSD de 512 GB en el que se instalarán Windows 11 y Ubuntu. ¿Por qué se elige GPT?', o: ['El equipo tiene UEFI y Windows 11 en UEFI solo se instala sobre GPT', 'Porque el disco pasa de 2 TB', 'Porque MBR no admite NTFS', 'Porque Ubuntu no arranca con MBR'], c: 0, x: 'El límite de 2 TB de MBR no importa: el disco es de 512 GB.' },
    { d: 2, p: '¿Para qué sirve tener /home en una partición separada?', o: ['Para no perder los datos del usuario si hay que reinstalar Ubuntu', 'Para que el sistema arranque más rápido', 'Porque lo exige ext4', 'Para poder hibernar'], c: 0, x: 'Basta con volver a montarla en /home sin formatearla.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 3, p: 'Equipo antiguo con BIOS (sin UEFI) y disco de 2 TB. ¿Sería GPT mejor que MBR?', o: ['Sí si es Linux (con una partición BIOS boot); no si se quiere Windows o la BIOS es muy antigua', 'Siempre', 'Nunca, GPT no funciona con BIOS', 'Solo si el disco es de más de 2 TB'], c: 0, x: 'Windows solo arranca desde GPT con UEFI.' },
    { d: 1, p: 'VirtualBox y VMware Workstation son hipervisores de…', o: ['Tipo 2 (se instalan sobre un sistema operativo)', 'Tipo 1 (sobre el hardware)', 'Tipo 0', 'Tipo contenedor'], c: 0, x: 'Los de tipo 1 (ESXi, Hyper-V, Proxmox) se ejecutan directamente sobre el hardware.' },
    { d: 1, p: '¿Cuál de estos es un hipervisor de tipo 1?', o: ['Microsoft Hyper-V', 'VirtualBox', 'VMware Workstation', 'Parallels Desktop'], c: 0, x: 'Tipo 1: VMware ESXi, Hyper-V, Proxmox.' },
    { d: 1, p: '¿Cuál es el modo de red por defecto en VirtualBox?', o: ['NAT', 'Adaptador puente', 'Red interna', 'Solo-anfitrión'], c: 0, x: 'Con NAT la VM sale a Internet compartiendo la IP del anfitrión.' },
    { d: 2, p: 'Quieres que la VM tenga su propia IP en la red física, como un equipo más. ¿Qué modo de red?', o: ['Adaptador puente (bridged)', 'NAT', 'Red interna', 'Solo-anfitrión'], c: 0, x: 'Sirve para alojar servicios accesibles desde la red local.' },
    { d: 2, p: 'Red privada solo entre máquinas virtuales, sin anfitrión ni Internet:', o: ['Red interna', 'NAT', 'Adaptador puente', 'Solo-anfitrión'], c: 0, x: 'Útil para simular sistemas multicapa o analizar malware.' },
    { d: 2, p: 'Red privada entre el anfitrión y las VM, sin salida a la red externa:', o: ['Solo-anfitrión (host-only)', 'Red interna', 'NAT', 'Adaptador puente'], c: 0, x: 'Útil para desarrollo cliente-servidor seguro.' },
    { d: 2, p: '¿Qué equivale en VMware al disco VDI dinámico de VirtualBox?', o: ['Un disco VMDK sin reservar el espacio', 'Un disco VHD fijo', 'Un archivo ISO', 'Una partición física'], c: 0, x: 'El archivo empieza pequeño y crece a medida que se usa.' },
    { d: 2, p: '¿Qué equivale en VMware a las Guest Additions de VirtualBox?', o: ['Las VMware Tools (paquete open-vm-tools)', 'El paquete build-essential', 'VBoxLinuxAdditions.run', 'El paquete dkms'], c: 0, x: 'Ajustan la resolución, comparten el portapapeles y permiten arrastrar archivos.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 1, p: 'En sudo apt update && sudo apt upgrade -y, ¿qué hace -y?', o: ['Responde «sí» a la confirmación', 'Actualiza el núcleo', 'Muestra más información', 'Ignora los errores'], c: 0, x: 'Así apt no se para a preguntar.' },
    { d: 2, p: 'En sudo apt update && sudo apt upgrade -y, ¿qué hace &&?', o: ['Ejecuta la segunda orden solo si la primera ha ido bien', 'Ejecuta las dos a la vez', 'Ejecuta la segunda aunque falle la primera', 'Redirige la salida'], c: 0, x: 'Y el orden importa: primero la lista de paquetes, luego la actualización.' },
    { d: 2, p: '¿Qué diferencia hay entre apt update y apt upgrade?', o: ['update descarga la lista de paquetes; upgrade instala las versiones nuevas', 'Son lo mismo', 'update instala y upgrade descarga', 'upgrade solo actualiza el núcleo'], c: 0, x: 'Si se hace al revés, se instala según un catálogo desactualizado.' },
    { d: 3, p: '¿Para qué sirve sudo apt autoremove?', o: ['Para borrar paquetes que ya no son necesarios, como núcleos antiguos', 'Para actualizar el sistema', 'Para desinstalar Ubuntu', 'Para limpiar la caché del navegador'], c: 0, x: 'Por ejemplo, los paquetes de un núcleo antiguo que ya se ha sustituido por uno nuevo.' },
    { d: 2, p: 'En la práctica de instalar Ubuntu Desktop en una máquina virtual, ¿qué particionado manual se pedía?', o: ['45 % para /, 50 % para /home y 5 % para swap', '50 % /, 45 % /home, 5 % swap', 'Todo el disco para /', '/boot, / y /home a partes iguales'], c: 0, x: 'En un disco de 25 GiB (26,84 GB) queda: / 11,13 GB, /home 12,50 GB y swap 3,21 GB, más la BIOS boot de 1 MB.' },
    { d: 1, p: '¿Qué instalador usa Ubuntu Server?', o: ['Subiquity, en modo texto', 'El mismo instalador gráfico que Desktop', 'Anaconda', 'Calamares'], c: 0, x: 'Se maneja con el teclado: flechas, Tab, Espacio e Intro.' },
    { d: 2, p: '¿Cómo organiza el disco Ubuntu Server por defecto?', o: ['Con LVM', 'Con particiones primarias sin LVM', 'Con una sola partición FAT32', 'Con RAID'], c: 0, x: 'Opción «Use an entire disk» con «Set up this disk as an LVM group».' },
    { d: 3, p: 'En LVM, ¿cuál es el orden de capas?', o: ['Partición → volumen físico (PV) → grupo de volúmenes (VG) → volumen lógico (LV)', 'VG → PV → LV → partición', 'LV → VG → PV', 'Partición → LV → PV → VG'], c: 0, x: 'En Ubuntu Server: sda3 es el PV, ubuntu-vg el grupo y ubuntu-lv el volumen lógico montado en /.' },
    { d: 2, p: 'Al instalar Ubuntu Server con las opciones por defecto (todo el disco con LVM), ¿dónde queda la swap?', o: ['En un archivo, /swap.img, dentro de la raíz', 'En una partición swap propia', 'En /boot', 'No tiene'], c: 0, x: 'Se ve al iniciar sesión: «Swap usage: 0%».' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 2, p: 'Un Ubuntu Server con IP fija configurada en el instalador da «Fallo temporal al resolver archive.ubuntu.com» al hacer apt update, aunque ip addr muestra la IP. ¿Qué falta?', o: ['Faltaban la puerta de enlace y el DNS en la configuración de red', 'La tarjeta de red estaba apagada', 'No había espacio en disco', 'El usuario no tenía sudo'], c: 0, x: 'ip addr mostraba la IP, así que la tarjeta funcionaba.' },
    { d: 2, p: '¿Dónde guarda Ubuntu Server la configuración de red y cómo se aplica?', o: ['En /etc/netplan/50-cloud-init.yaml; se aplica con sudo netplan apply', 'En /etc/network.conf; se aplica reiniciando', 'En /boot/red.cfg; con apt update', 'En /etc/hosts; con ping'], c: 0, x: 'Hay que respetar la sangría con espacios del archivo YAML.' },
    { d: 2, p: 'ip route no muestra ninguna línea «default». ¿Qué falta?', o: ['La puerta de enlace', 'La dirección IP', 'El DNS', 'La tarjeta de red'], c: 0, x: 'Sin puerta de enlace no se puede salir de la red.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 1, p: '¿Qué es un contenedor respecto a una imagen?', o: ['Una instancia en ejecución de la imagen', 'Un Dockerfile compilado', 'Una copia de seguridad de la imagen', 'Un registro de imágenes'], c: 0, x: 'La imagen es una plantilla de solo lectura creada a partir de un Dockerfile.' },
    { d: 1, p: '¿Qué hace -p 8080:80?', o: ['Publica el puerto 80 del contenedor en el 8080 del equipo', 'Publica el 8080 del contenedor en el 80 del equipo', 'Limita la memoria a 8080 MB', 'Abre 80 contenedores'], c: 0, x: 'La forma es puerto_equipo:puerto_contenedor.' },
    { d: 1, p: 'Contenedores frente a máquinas virtuales:', o: ['Los contenedores comparten el kernel del anfitrión', 'Cada contenedor tiene su propio sistema operativo completo', 'Los contenedores arrancan en minutos', 'Las máquinas virtuales consumen menos recursos'], c: 0, x: 'Las VM tienen un Guest OS completo y aíslan a nivel de hardware.' },
    { d: 2, p: 'Dockerfile para servir una web estática con FROM nginx:stable-alpine: ¿adónde hay que copiar la carpeta web/?', o: ['A /usr/share/nginx/html/', 'A /var/www/html/', 'A /app', 'A /etc/nginx/'], c: 0, x: 'Es donde nginx busca las páginas. Base: FROM nginx:stable-alpine.' },
    { d: 2, p: '¿Qué hace docker build -t mi-web:1.0 . ?', o: ['Construye una imagen llamada mi-web con la etiqueta 1.0 a partir del Dockerfile de la carpeta actual', 'Ejecuta el contenedor mi-web', 'Descarga la imagen mi-web', 'Sube la imagen a Docker Hub'], c: 0, x: 'El punto final es la carpeta de contexto.' },
    { d: 2, p: '¿Para qué sirve lanzar un contenedor de nginx con -v montando la carpeta web/ del equipo en /usr/share/nginx/html?', o: ['Para editar el HTML sin reconstruir la imagen', 'Para que el contenedor arranque más rápido', 'Para publicar el puerto 80', 'Para guardar la base de datos'], c: 0, x: 'Es un bind mount: enlaza una carpeta del equipo con una del contenedor.' },
    { d: 2, p: 'En un Dockerfile, ¿cuándo se ejecuta RUN y cuándo CMD?', o: ['RUN al construir la imagen; CMD al arrancar el contenedor', 'Los dos al arrancar', 'RUN al arrancar; CMD al construir', 'Los dos al construir'], c: 0, x: 'En la parte 2: RUN npm install y CMD ["node", "server.js"].' },
    { d: 2, p: 'En la práctica de Docker Compose (contador de visitas en Node.js con base de datos), ¿qué imágenes se usan?', o: ['node:24-alpine para la app y mariadb:11.4 para la base de datos', 'nginx:stable-alpine y mysql:5.7', 'ubuntu y postgres', 'node:latest y mariadb:latest'], c: 0, x: 'Alpine es una distribución muy pequeña.' },
    { d: 3, p: 'En un compose.yaml con dos servicios, app y db, la app se conecta con DB_HOST: db. ¿Por qué funciona?', o: ['Dentro de la red de Compose el nombre del servicio se resuelve a su contenedor', 'Porque db es una IP reservada', 'Porque MariaDB se llama db por defecto', 'Porque está en el archivo hosts del equipo'], c: 0, x: 'Compose crea la red parte2_default para los dos servicios.' },
    { d: 2, p: '¿Qué hace docker compose down?', o: ['Para y borra contenedores y red, pero no los volúmenes', 'Borra también los volúmenes', 'Solo para los contenedores', 'Borra las imágenes'], c: 0, x: 'Por eso, al volver a levantar con up -d, la base de datos conserva sus datos.' },
    { d: 2, p: 'Una app guarda un contador de visitas en MariaDB con un volumen de Compose. Tras docker compose down -v y docker compose up -d, ¿qué pasa con el contador?', o: ['Vuelve a empezar en 1: se borró el volumen con los datos', 'Sigue donde estaba', 'Da error para siempre', 'Se duplica'], c: 0, x: '-v elimina también los volúmenes (Volume parte2_datos-db Removed).' },
    { d: 3, p: '¿Por qué el puerto 3306 de MariaDB no se publica en el equipo?', o: ['Solo lo usa la app dentro de la red de Compose', 'Porque MariaDB no usa puertos', 'Porque 3306 está prohibido', 'Por un error en compose.yaml'], c: 0, x: 'docker compose ps lo muestra como 3306/tcp, sin 0.0.0.0.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 2, p: '¿Qué hace docker compose up -d --build?', o: ['Construye las imágenes que hagan falta y levanta todos los servicios en segundo plano', 'Solo construye las imágenes', 'Para los servicios', 'Borra los volúmenes'], c: 0, x: 'Luego docker compose ps muestra el estado de los servicios.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    // Tema 2 (teoría de los apartados 1-11 que entran en el examen)
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    { d: 1, p: '¿En qué arquitectura todo el SO se ejecuta en un único espacio de direcciones en modo kernel?', o: ['Monolítica', 'Microkernel', 'Por capas', 'Híbrida'], c: 0, x: 'Rendimiento alto, pero un fallo en un módulo puede tumbar todo el sistema.' },
    { d: 2, p: '¿Qué arquitectura ejecuta en modo kernel solo procesos, memoria e IPC, y el resto en modo usuario?', o: ['Microkernel', 'Monolítica', 'Por capas', 'Híbrida'], c: 0, x: 'Ejemplos: QNX, MINIX, L4.' },
    { d: 2, p: 'Desventaja principal del microkernel:', o: ['Sobrecarga de comunicación entre procesos y menos rendimiento', 'Un fallo en un módulo tumba todo el sistema', 'Hay que recompilar todo para cualquier cambio', 'No se puede portar a otras plataformas'], c: 0, x: 'A cambio es muy modular, seguro y estable.' },
    { d: 2, p: 'En la arquitectura por capas, cada capa…', o: ['Ofrece servicios a la de arriba y usa los de la de abajo', 'Se ejecuta en un proceso independiente', 'Tiene su propio kernel', 'Se comunica con todas las demás'], c: 0, x: 'Ejemplos: Windows NT y THE OS. Desventaja: sobrecarga en las llamadas entre capas.' },
    { d: 3, p: '¿Qué arquitectura tiene modularidad baja porque cualquier cambio obliga a recompilar el SO completo?', o: ['Monolítica', 'Microkernel', 'Por capas', 'Híbrida'], c: 0, x: 'Ejemplos: MS-DOS, primeras versiones de Unix y el núcleo de Linux.' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 1, p: '¿Qué es un proceso?', o: ['Un programa en ejecución que necesita recursos', 'Un archivo ejecutable en disco', 'Un controlador de dispositivo', 'Una parte del kernel'], c: 0, x: 'Necesita CPU, memoria y archivos.' },
    { d: 1, p: 'Un proceso en memoria esperando a que le den la CPU está en estado…', o: ['Listo', 'Bloqueado', 'Nuevo', 'Ejecutando'], c: 0, x: 'Bloqueado = esperando un evento externo como el disco o el teclado.' },
    { d: 2, p: 'Un proceso que espera a que termine una lectura de disco está en estado…', o: ['Bloqueado', 'Listo', 'Nuevo', 'Terminado'], c: 0, x: 'Al acabar la E/S vuelve a Listo.' },
    { d: 2, p: '¿Qué algoritmo de planificación tiene el «efecto convoy»?', o: ['FCFS (por orden de llegada)', 'Round Robin', 'SJF', 'Multinivel'], c: 0, x: 'Es simple y justo, pero los cortos esperan detrás de los largos.' },
    { d: 2, p: '¿Qué algoritmo reparte la CPU en cuantos de tiempo cíclicos?', o: ['Round Robin', 'FCFS', 'SJF', 'Prioridad'], c: 0, x: 'Evita que un proceso monopolice la CPU.' },
    { d: 3, p: '¿Qué algoritmo tiene riesgo de inanición?', o: ['Por prioridad', 'Round Robin', 'FCFS', 'Ninguno'], c: 0, x: 'Los de prioridad baja pueden no ejecutarse nunca.' },
    { d: 3, p: 'SJF consigue la menor espera media, pero…', o: ['Es difícil predecir cuánto dura cada proceso', 'Provoca inanición siempre', 'No funciona con varios procesos', 'Necesita varias CPU'], c: 0, x: 'SJF = el más corto primero.' },
    { d: 2, p: 'ls | grep "txt" es un ejemplo de comunicación entre procesos mediante…', o: ['Una tubería (pipe)', 'Un socket', 'Un semáforo', 'Memoria compartida'], c: 0, x: 'Los pipes son unidireccionales; las colas de mensajes, bidireccionales.' },
    { d: 2, p: '¿Qué mecanismo IPC sirve para sincronizar y evitar condiciones de carrera?', o: ['Semáforos', 'Sockets', 'Pipes', 'Colas de mensajes'], c: 0, x: 'Los sockets comunican procesos de distintas máquinas.' },
    { d: 1, p: 'De más rápida a más lenta, ¿cuál es el orden correcto?', o: ['Registros, caché, RAM, SSD, HDD', 'RAM, registros, caché, HDD, SSD', 'Caché, RAM, registros, SSD, HDD', 'SSD, RAM, caché, registros, HDD'], c: 0, x: 'Registros ~1 ns, RAM ~100 ns, SSD ~10-100 µs, HDD ~5-10 ms.' },
    { d: 2, p: '¿Qué técnica de memoria provoca fragmentación interna?', o: ['Partición fija', 'Partición dinámica', 'Paginación', 'Segmentación'], c: 0, x: 'La partición dinámica y la segmentación provocan fragmentación externa.' },
    { d: 2, p: '¿Qué técnica elimina la fragmentación externa pero añade sobrecarga de tablas?', o: ['Paginación', 'Segmentación', 'Partición dinámica', 'Partición fija'], c: 0, x: 'Divide la memoria en marcos físicos y páginas lógicas.' },
    { d: 2, p: '¿Qué es un page fault?', o: ['La página no está en RAM y hay que cargarla desde disco o swap', 'Un error de división por cero', 'Un bloque defectuoso del disco', 'Un proceso bloqueado'], c: 0, x: 'La tabla de páginas tiene bits de presencia, modificación y referencia.' },
    { d: 3, p: 'Segmentación: ¿en qué divide la memoria y qué ventaja tiene?', o: ['En segmentos lógicos (código, datos, pila); protección y compartición', 'En marcos de 4 KB; sin fragmentación', 'En particiones fijas; sencillez', 'En bloques de disco; más RAM'], c: 0, x: 'Su desventaja es la fragmentación externa.' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    { d: 1, p: '¿Qué tipo de software es gratuito pero con código cerrado?', o: ['Freeware', 'Software libre', 'Código abierto', 'Copyleft'], c: 0, x: 'El software libre deja usar, estudiar, modificar y redistribuir.' },
    { d: 2, p: 'Una licencia GPL es…', o: ['Copyleft: las obras derivadas mantienen la misma libertad', 'Permisiva: se puede meter en productos cerrados', 'Propietaria', 'Freeware'], c: 0, x: 'El núcleo Linux usa GPL. MIT y BSD son permisivas.' },
    { d: 1, p: '¿Qué licencia de Windows viene preinstalada y queda ligada a ese equipo?', o: ['OEM', 'Retail', 'Por volumen', 'De evaluación'], c: 0, x: 'Retail se compra suelta y se puede transferir; por volumen, para empresas y centros.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 2, p: '¿Qué estrategia de asignación de bloques es la más usada?', o: ['Indexada', 'Contigua', 'Encadenada', 'Aleatoria'], c: 0, x: 'Un índice guarda las direcciones; no fragmenta y permite acceso secuencial y aleatorio.' },
    { d: 3, p: 'En la asignación encadenada…', o: ['Cada bloque apunta al siguiente: no fragmenta, pero la lectura es lenta', 'Los bloques van seguidos: rápida pero fragmenta', 'Un índice guarda las direcciones', 'Se usa un árbol B'], c: 0, x: 'La contigua es eficiente en acceso secuencial pero fragmenta.' },
    { d: 2, p: '¿Qué sistema de archivos ofrece snapshots, compresión transparente y deduplicación pero es menos maduro que ext4?', o: ['Btrfs', 'ZFS', 'exFAT', 'FAT32'], c: 0, x: 'ZFS también tiene snapshots y checksums, pero consume mucha RAM (al menos 4 GB).' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 2, p: 'Particionado típico de Linux en GPT (UEFI):', o: ['/boot/efi (FAT32), /boot, /, /home (ext4) y swap, todas primarias', '/boot primaria y el resto en una extendida', 'Solo / y swap en lógicas', 'C:, D: y MSR'], c: 0, x: 'En MBR: /boot primaria y /, /home y swap como lógicas dentro de una extendida.' },
    { d: 2, p: '¿Qué herramientas de particionado en línea de comandos tiene Linux?', o: ['fdisk, gdisk y parted', 'diskpart', 'GParted y KDE Partition Manager', 'mkfs y mount'], c: 0, x: 'GParted y KDE Partition Manager son gráficas. En Windows: diskpart y el Administrador de discos.' },
    null, // quitada: no entra en el examen
    { d: 1, p: '¿Qué tipo de actualización es la más urgente?', o: ['La de seguridad', 'La de funcionalidades', 'La de calidad', 'Todas igual'], c: 0, x: 'Las de funcionalidades pueden requerir copia previa.' },
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 1, p: '¿Cómo se llama también al hipervisor?', o: ['Monitor de máquina virtual (VMM)', 'Kernel', 'Contenedor', 'Gestor de arranque'], c: 0, x: 'Presenta hardware virtual a cada VM y reparte los recursos físicos.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { d: 2, p: 'Usos de VirtualBox según el temario:', o: ['Probar software, entornos de desarrollo aislados, simular redes y analizar malware', 'Solo jugar', 'Sustituir al sistema anfitrión', 'Gestionar centros de datos'], c: 0, x: 'Es tipo 2, gratuito y de código abierto.' },
    { d: 1, p: 'Para entornos críticos, en lugar de Docker Compose el temario recomienda…', o: ['Kubernetes o Docker Swarm', 'VirtualBox', 'WSL', 'LXC'], c: 0, x: 'Compose sirve para desarrollo local, pruebas de integración y producción no crítica.' },
    { d: 2, p: '¿Cuál es la red por defecto de Docker?', o: ['bridge', 'host', 'NAT', 'internal'], c: 0, x: 'Se pueden crear redes propias para que los contenedores se comuniquen.' },
    { d: 2, p: '¿Sobre qué se ejecutan los contenedores?', o: ['Sobre el Docker Engine, compartiendo el kernel del anfitrión', 'Sobre un hipervisor, cada uno con su SO', 'Sobre la BIOS', 'Sobre WSL 1'], c: 0, x: 'Las VM se ejecutan sobre un hipervisor, cada una con su SO invitado.' },
    { d: 3, p: '¿Por qué Docker permite ejecutar más contenedores con menos recursos que una VM?', o: ['No reserva recursos fijos: usa el kernel y los recursos que necesita en cada momento', 'Porque comprime la memoria', 'Porque no usa CPU', 'Porque solo ejecuta Alpine'], c: 0, x: 'Explicación del tutorial de Docker.' },
    { d: 2, p: 'Los datos guardados dentro de un contenedor sin volumen…', o: ['Se pierden al eliminar el contenedor', 'Se guardan en la imagen', 'Se suben al registro', 'Se guardan en el anfitrión automáticamente'], c: 0, x: 'Para persistirlos se usa -v o un volumen.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { d: 1, p: '¿Qué comando instala WSL 2 con Ubuntu por defecto?', o: ['wsl --install', 'wsl --shutdown', 'apt install wsl', 'docker install wsl'], c: 0, x: 'Desde PowerShell como administrador; luego reiniciar y comprobar con wsl --list --verbose.' },
    { d: 2, p: '¿En qué se diferencia WSL 2 de WSL 1?', o: ['Usa una máquina virtual ligera con un kernel Linux real', 'Traduce llamadas al sistema con el kernel de Windows', 'No admite Docker', 'Arranca más rápido y consume menos'], c: 0, x: 'WSL 2 rinde mejor en archivos y red, admite GUI e integra Docker Desktop.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
  ],
  'Proyecto Intermodular': [
    { p: 'En el patrón MVC, ¿qué parte contiene los datos y la lógica de negocio?', o: ['Vista', 'Modelo', 'Controlador', 'Router'], c: 1, x: 'Modelo = datos y reglas; Vista = presentación; Controlador = recibe acciones y coordina.' },
    { p: '¿Cuál es el formato habitual de una historia de usuario?', o: ['Si… entonces…', 'Como [rol] quiero [algo] para [beneficio]', 'Dado… cuando… entonces…', 'Entrada, proceso, salida'], c: 1, x: '«Dado… cuando… entonces…» es el formato de los criterios de aceptación.' },
    { p: 'En un diagrama de casos de uso, ¿qué representa el monigote?', o: ['Una clase', 'Un actor: alguien o algo que interactúa con el sistema', 'Un caso de uso', 'El sistema'], c: 1, x: 'Los casos de uso son las elipses dentro del rectángulo del sistema.' },
    { p: '«include» entre dos casos de uso significa que…', o: ['El segundo se ejecuta siempre como parte del primero', 'El segundo es opcional', 'Son el mismo caso', 'Uno hereda del otro'], c: 0, x: '«extend» es el opcional, que ocurre solo en ciertas condiciones.' },
    { p: 'Las siglas MVP en un proyecto significan…', o: ['Most Valuable Player', 'Producto mínimo viable', 'Modelo Vista Presentador siempre', 'Máxima versión publicada'], c: 1, x: 'La versión más pequeña que ya aporta valor y permite aprender de los usuarios.' },
  ],
};

// Tarjetas para estudiar: f delante, b detrás. Se repasan con las mismas cajas que las preguntas.
window.TARJETAS = {
  'Sistemas Informáticos': [
    { f: 'Sistema de archivos', b: 'La forma que tiene un dispositivo de organizar la información: dónde va cada archivo, cómo se encuentra y sus metadatos (nombre, tamaño, fechas, permisos).' },
    { f: 'FAT32: límites', b: 'Archivo máx. 4 GB. Partición máx. 32 GB en la práctica (2 TB en teoría). Sin permisos ni journaling.' },
    { f: 'NTFS: límites y rasgos', b: 'Archivo y partición hasta 16 EB. MFT, permisos ACL, journaling, compresión, cifrado EFS. macOS solo lo lee.' },
    { f: 'ext4: límites y rasgos', b: 'Archivo 16 TB (bloques de 4 KB), partición 1 EB. Inodos, permisos Unix, journaling, extents. Windows no lo lee sin controladores.' },
    { f: 'exFAT', b: 'Sin el límite de 4 GB por archivo. Windows, macOS y Linux. Sin permisos ni journaling. Ideal para USB y SD grandes.' },
    { f: 'Pendrive 128 GB, vídeos de 8 GB, Windows + macOS + Linux', b: 'exFAT. Se renuncia a permisos y journaling.' },
    { f: 'Raíz de un servidor Linux con varios usuarios', b: 'ext4: permisos por archivo y journaling.' },
    { f: 'Volumen de Windows 11', b: 'NTFS.' },
    { f: 'SD de cámara que solo lee FAT32: vídeo de más de 4 GB', b: 'La cámara corta el archivo (abre otro o para). Grabar en fragmentos y unirlos, o bajar resolución/calidad.' },
    { f: 'Disco externo 2 TB, copias de Windows y Linux con permisos', b: 'Dos particiones: NTFS + ext4. Si solo una: NTFS sin permisos de Linux, o copias de Linux en .tar.' },
    { f: 'Partición EFI: sistema de archivos', b: 'FAT32: lo exige UEFI y es lo que lee el firmware al arrancar.' },
    { f: 'Journaling', b: 'Registro de cambios que permite recuperarse mejor si el equipo se apaga de golpe. Lo tienen NTFS y ext4, no FAT32 ni exFAT.' },
    { f: 'MBR', b: 'Tabla en los primeros 512 bytes. Discos hasta 2 TB. 4 primarias o 3 primarias + 1 extendida. BIOS.' },
    { f: 'GPT', b: 'GUIDs, discos hasta 8 ZiB, 128 primarias sin extendidas ni lógicas, copia de la tabla al final del disco. UEFI.' },
    { f: 'Partición extendida', b: 'Contenedor de particiones lógicas. Solo una por disco y solo en MBR. Ocupa una de las 4 ranuras.' },
    { f: 'Particiones lógicas en Linux', b: 'Van dentro de la extendida y se numeran desde 5: /dev/sda5.' },
    { f: 'MSR', b: 'Partición reservada de Microsoft en discos GPT: 16 MB, sin formato ni letra.' },
    { f: 'Partición BIOS boot', b: '1 MB sin formato que GRUB necesita para arrancar con BIOS desde un disco GPT. Por eso el instalador crea una sda1 de 1 MB.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { f: 'Nombre de un disco NVMe', b: '/dev/nvme0n1: nvme0 controladora, n1 namespace, p1, p2… particiones.' },
    { f: 'Dual boot: GRUB', b: 'Gestor de Ubuntu. Detecta los otros sistemas (os-prober) y los añade a su menú.' },
    { f: 'Dual boot: Windows Boot Manager', b: 'Solo arranca Windows y no detecta Linux. Al instalarse se pone el primero en la UEFI.' },
    { f: 'Gestor de arranque con BIOS frente a UEFI', b: 'BIOS: código en el MBR, solo cabe uno (el último lo sobrescribe). UEFI: cada sistema deja su .efi en la ESP y conviven.' },
    { f: 'Dual boot: orden de instalación', b: 'Primero Windows, después Ubuntu: así GRUB queda como gestor principal con los dos sistemas.' },
    { f: 'Instalar Ubuntu junto a Windows: la ESP', b: 'Usar la que ya existe sin formatearla; si se formatea se borra el arranque de Windows. Gestor de arranque en /dev/nvme0n1.' },
    { f: 'Ubuntu primero y Windows después', b: 'Windows entra directo sin menú, pero Ubuntu sigue. Arreglo: poner ubuntu primero en la UEFI, bcdedit…shimx64.efi, Boot-Repair o grub-install + update-grub.' },
    { f: 'Dual boot: tabla de particiones de un portátil UEFI con NVMe de 512 GB (Windows 11 + Ubuntu)', b: 'EFI 512 MB FAT32 · MSR 16 MB · Windows 160 GB NTFS · Recuperación 1 GB · / 60 GB ext4 · swap 4 GB · /home el resto ext4.' },
    { f: 'Swap con 16 GB de RAM', b: 'Sin hibernación: 4 GB. Con hibernación: unos 20 GB.' },
    { f: 'Por qué /home separado', b: 'Si hay que reinstalar Ubuntu, documentos y configuración no se pierden: se vuelve a montar sin formatear.' },
    { f: 'Equipo con BIOS y disco de 2 TB: tabla MBR con 6 particiones', b: 'sda1 / (primaria activa) · sda2 swap · sda3 /datos · sda4 extendida · sda5-7 pruebas 1-3 (lógicas).' },
    { f: '¿GPT en el equipo antiguo con BIOS?', b: 'Mejor para Linux (con partición BIOS boot). No si se quiere Windows (solo GPT con UEFI) o si la BIOS es muy antigua.' },
    { f: 'Hipervisor', b: 'Capa entre el hardware y las VM: da hardware virtual a cada una y reparte los recursos físicos.' },
    { f: 'Hipervisor tipo 1 y tipo 2', b: 'Tipo 1, sobre el hardware: ESXi, Hyper-V, Proxmox. Tipo 2, sobre un SO: VirtualBox, VMware Workstation, Parallels.' },
    { f: 'Anfitrión e invitado', b: 'Host OS: el sistema del equipo real. Guest OS: el instalado en la máquina virtual.' },
    { f: 'Red NAT', b: 'Por defecto. La VM sale a Internet con la IP del anfitrión; desde fuera no se ve sin redirigir puertos.' },
    { f: 'Adaptador puente', b: 'La VM recibe su propia IP de la red física, como un equipo más.' },
    { f: 'Red interna', b: 'Red privada solo entre VM, sin anfitrión ni Internet.' },
    { f: 'Solo-anfitrión', b: 'Red privada entre el anfitrión y las VM, sin salida a la red externa.' },
    { f: 'VirtualBox → VMware', b: 'Nueva → File > New Virtual Machine · VDI dinámico → VMDK sin reservar · Almacenamiento → CD/DVD con ISO · Guest Additions → VMware Tools.' },
    { f: 'VMware Tools / Guest Additions', b: 'Controladores de integración: resolución, portapapeles, arrastrar archivos. En Linux: paquete open-vm-tools.' },
    { f: 'Máquina virtual para las prácticas de Ubuntu', b: '4 GB de RAM, 2 núcleos, disco de 25 GB VMDK. Desktop en red Bridged; Server en NAT.' },
    { f: 'sudo apt update && sudo apt upgrade -y', b: 'update: lista de paquetes. upgrade: instala versiones nuevas. &&: la 2.ª solo si va bien la 1.ª. -y: responde sí.' },
    { f: 'sudo apt autoremove', b: 'Borra paquetes que ya no hacen falta (por ejemplo, núcleos antiguos).' },
    { f: 'Comandos para verificar la instalación', b: 'lsb_release -a (versión) · lsblk (particiones) · swapon --show (swap) · ip addr (red).' },
    { f: 'Particionado manual de la práctica de Ubuntu Desktop', b: '45 % /, 50 % /home, 5 % swap. Resultado: / 11,13 GB, /home 12,50 GB, swap 3,21 GB.' },
    { f: 'Ubuntu Server frente a Desktop', b: 'Sin entorno gráfico, instalador Subiquity en texto, sin «Probar Ubuntu», red e IP fija al instalar, LVM por defecto, ofrece OpenSSH.' },
    { f: 'LVM', b: 'Capa entre disco y sistemas de archivos: partición → volumen físico (PV) → grupo (VG) → volúmenes lógicos (LV). Se amplía sin reparticionar.' },
    { f: 'Disco de Ubuntu Server instalado con LVM (25 GB)', b: 'sda1 BIOS boot 1 MiB · sda2 /boot ext4 2 GiB · sda3 PV → ubuntu-vg → ubuntu-lv en / (11,5 GiB) + 11,5 GiB libres.' },
    { f: 'Swap en Ubuntu Server', b: 'Un archivo: /swap.img dentro de la raíz.' },
    { f: 'lvextend', b: 'Amplía un volumen lógico usando el espacio libre del grupo.' },
    { f: 'netplan', b: 'Configuración de red de Ubuntu Server: /etc/netplan/50-cloud-init.yaml. Se aplica con sudo netplan apply.' },
    { f: 'Fallo «Fallo temporal al resolver archive.ubuntu.com»', b: 'No hay DNS (ni puerta de enlace). Añadir routes: default via 192.168.111.2 y nameservers [192.168.111.2, 8.8.8.8].' },
    { f: 'ip route sin línea default', b: 'Falta la puerta de enlace.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { f: 'SSH en Ubuntu Server', b: 'Instalar servidor OpenSSH para administrarlo a distancia: ssh fran@192.168.111.10.' },
    { f: 'Docker', b: 'Empaqueta una aplicación con lo que necesita (sistema base, librerías, configuración) en una imagen.' },
    { f: 'Dockerfile / imagen / contenedor', b: 'Dockerfile: instrucciones. Imagen: plantilla de solo lectura. Contenedor: instancia en ejecución de una imagen.' },
    { f: 'Contenedor frente a VM', b: 'Contenedor: comparte kernel, ligero, arranca en segundos, aislamiento medio. VM: Guest OS completo, más recursos, minutos, aislamiento alto.' },
    { f: 'Puerto publicado', b: '-p puerto_equipo:puerto_contenedor. -p 8080:80 → localhost:8080 llega al 80 de nginx.' },
    { f: 'Volumen', b: 'Almacenamiento que persiste fuera del contenedor: bind mount (carpeta del equipo) o volumen gestionado por Docker.' },
    { f: 'Dockerfile para servir una web con nginx', b: 'FROM nginx:stable-alpine\nCOPY web/ /usr/share/nginx/html/' },
    { f: 'Construir y lanzar una web con nginx', b: 'docker build -t mi-web:1.0 .\ndocker run -d --name mi-web -p 8080:80 mi-web:1.0' },
    { f: 'Editar la web sin reconstruir', b: 'docker run -d --name mi-web -p 8080:80 -v "${PWD}\\web:/usr/share/nginx/html" mi-web:1.0' },
    { f: 'Parar y borrar un contenedor', b: 'docker stop mi-web\ndocker rm mi-web' },
    { f: 'Dockerfile de una app Node.js', b: 'FROM node:24-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["node", "server.js"]' },
    { f: 'RUN frente a CMD', b: 'RUN: durante la construcción de la imagen. CMD: al arrancar el contenedor.' },
    { f: 'compose.yaml del contador de visitas: servicio app', b: 'build: ./app · ports 3000:3000 · DB_HOST db, DB_USER usuario, DB_PASSWORD usuario123, DB_NAME visitas · depends_on: db.' },
    { f: 'compose.yaml del contador de visitas: servicio db', b: 'image: mariadb:11.4 · MARIADB_ROOT_PASSWORD, MARIADB_DATABASE, MARIADB_USER, MARIADB_PASSWORD · volumen datos-db:/var/lib/mysql.' },
    { f: 'Por qué DB_HOST: db', b: 'En la red de Compose (parte2_default) cada servicio se encuentra por su nombre.' },
    { f: 'docker compose up -d --build / ps', b: 'Construye y levanta todo en segundo plano / muestra el estado de los servicios.' },
    { f: 'docker compose down frente a down -v', b: 'down: borra contenedores y red, conserva volúmenes (contador sigue). down -v: borra también el volumen (contador a 1).' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    // Teoría de los apartados 1-11
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { f: 'Arquitectura monolítica', b: 'Todo el SO en un espacio de direcciones en modo kernel. Rendimiento alto; modularidad y seguridad bajas. MS-DOS, Unix temprano, núcleo de Linux.' },
    { f: 'Arquitectura por capas', b: 'Niveles jerárquicos: cada capa usa la de abajo y sirve a la de arriba. Modular; sobrecarga entre capas. Windows NT, THE OS.' },
    { f: 'Arquitectura microkernel', b: 'Solo procesos, memoria e IPC en modo kernel; el resto en modo usuario. Muy modular y seguro; sobrecarga de comunicación. QNX, MINIX, L4.' },
    { f: 'Arquitectura híbrida', b: 'Mezcla: algunos servicios en el kernel y otros en modo usuario. Equilibrio rendimiento/modularidad; diseño complejo. Windows desde NT, macOS.' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { f: 'Estados de un proceso', b: 'Nuevo → Listo → Ejecutando → Bloqueado (espera E/S) → Listo → Terminado.' },
    { f: 'FCFS / SJF', b: 'FCFS: por orden de llegada, simple, efecto convoy. SJF: el más corto primero, menor espera media, difícil predecir duraciones.' },
    { f: 'Round Robin / Prioridad / Multinivel', b: 'RR: cuantos cíclicos, evita monopolio. Prioridad: flexible, riesgo de inanición. Multinivel: combina algoritmos, compleja.' },
    { f: 'Mecanismos IPC', b: 'Memoria compartida · paso de mensajes (pipes unidireccionales, colas bidireccionales) · semáforos (sincronizar) · sockets (otras máquinas).' },
    { f: 'Jerarquía de memoria', b: 'Registros ~1 ns · L1 ~1-4 ns · L2/L3 ~10-50 ns · RAM ~100 ns · SSD ~10-100 µs · HDD ~5-10 ms · cinta, segundos.' },
    { f: 'Partición fija / dinámica', b: 'Fija: simple, fragmentación interna. Dinámica: según el proceso, sin interna pero con fragmentación externa.' },
    { f: 'Paginación / segmentación / memoria virtual', b: 'Paginación: sin fragmentación externa, sobrecarga de tablas. Segmentación: código, datos, pila; fragmentación externa. Virtual: disco como RAM extra.' },
    { f: 'Página, marco, page fault', b: 'Página: bloque lógico (p. ej. 4 KB). Marco: bloque físico. Page fault: la página no está en RAM y se trae del disco o swap.' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { f: 'Libre / código abierto / propietario', b: 'Libre: usar, estudiar, modificar, redistribuir. Abierto: código accesible y modificable. Propietario: solo uso según EULA.' },
    { f: 'Freeware / shareware', b: 'Freeware: gratis, código cerrado. Shareware: gratis un tiempo o limitado; luego se paga.' },
    { f: 'Copyleft / permisivas', b: 'Copyleft (GPL, núcleo Linux): las derivadas mantienen la libertad. Permisivas (MIT, BSD): se pueden meter en productos cerrados.' },
    { f: 'Licencias de Windows', b: 'OEM (ligada al equipo), Retail (transferible), por volumen (empresas, centros). Server: por núcleos + licencias de acceso de cliente.' },
    { f: 'Asignación de bloques', b: 'Contigua (rápida en secuencial, fragmenta) · encadenada (no fragmenta, lenta) · indexada (índice; la más usada).' },
    { f: 'Btrfs / ZFS', b: 'Btrfs: snapshots, compresión, deduplicación, RAID; menos maduro. ZFS: checksums, pools, mucha RAM (≥4 GB), no nativo en Windows.' },
    { f: 'Particionado típico Windows', b: 'MBR: C:, D: y extendida con lógica de recuperación (oculta de 100-500 MB). GPT: EFI FAT32, C:, D: y MSR de 16 MB.' },
    { f: 'Particionado típico Linux', b: 'MBR: /boot primaria + extendida con /, /home y swap lógicas. GPT: /boot/efi FAT32, /boot, /, /home y swap, todas primarias.' },
    { f: 'Herramientas de particionado', b: 'Windows: diskpart, Administrador de discos. Linux: fdisk, gdisk, parted; GParted, KDE Partition Manager.' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { f: 'Tipos de actualizaciones', b: 'De seguridad (las más urgentes), de calidad o errores, de funcionalidades (pueden requerir copia).' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    { f: 'Características de Docker', b: 'Aislamiento, portabilidad, eficiencia (comparte kernel), escalabilidad horizontal, automatización con Dockerfile.' },
    { f: 'Docker Compose: cuándo', b: 'Desarrollo local, pruebas de integración y producción no crítica. Crítico: Kubernetes o Docker Swarm.' },
    { f: 'Redes en Docker', b: 'Por defecto bridge. Con redes propias los contenedores se encuentran por nombre (Compose crea una para todos los servicios).' },
    { f: 'Instrucciones de Dockerfile', b: 'FROM, RUN, COPY, ADD, WORKDIR, ENV, CMD, ENTRYPOINT, EXPOSE, VOLUME.' },
    null, // quitada: no entra en el examen
    { f: 'Datos de un contenedor', b: 'Son volátiles: se pierden al eliminarlo. Para persistir, -v o volúmenes. Cambios definitivos: reconstruir la imagen con nueva etiqueta (:v2).' },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { f: 'WSL', b: 'Entorno Linux completo en Windows sin VM tradicional, dual boot ni servidor remoto. Rendimiento casi nativo, archivos compartidos.' },
    { f: 'WSL 1 frente a WSL 2', b: 'WSL 1: traduce llamadas, kernel de Windows, ligero y rápido, sin GUI. WSL 2: VM ligera con kernel Linux real, mejor en archivos y red, GUI, Docker Desktop.' },
    null, // quitada: no entra en el examen
    { f: 'Instalar WSL', b: 'wsl --install (PowerShell admin) → reiniciar → wsl --list --verbose. Otra distro: wsl --list --online, wsl --install -d.' },
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
  ],
};

// Preguntas de desarrollo: r = respuesta modelo · k = puntos que tiene que tener tu respuesta (para corregirte).
window.DESARROLLO = {
  'Sistemas Informáticos': [
    { d: 1, p: 'Explica qué es un sistema de archivos y qué son los metadatos.', r: 'Es la forma que tiene un dispositivo de almacenamiento de organizar la información: decide dónde se coloca cada archivo, cómo se encuentra después y qué información se guarda sobre él. Sin él, el disco sería un montón de datos sin orden. Esa información (nombre, tamaño, fechas de creación y modificación, quién puede abrirlo o cambiarlo) son los metadatos.', k: ['Organiza la información del dispositivo', 'Decide dónde va cada archivo y cómo se encuentra', 'Metadatos: nombre, tamaño, fechas', 'Metadatos: permisos'] },
    { d: 2, p: 'Compara FAT32, NTFS y ext4: tamaño máximo de archivo, permisos, journaling y compatibilidad.', r: 'FAT32: archivos de hasta 4 GB, sin permisos ni journaling, compatible con casi todo (macOS solo lectura según el temario). NTFS: hasta 16 EB, permisos ACL, journaling, cifrado EFS; Windows completo, Linux con controladores y macOS solo lectura. ext4: archivos de 16 TB, permisos Unix, journaling; Linux y Android, Windows no lo lee sin controladores.', k: ['FAT32: 4 GB, sin permisos ni journaling', 'NTFS: 16 EB, ACL, journaling', 'ext4: 16 TB, permisos Unix, journaling', 'Compatibilidad de cada uno con Windows, Linux y macOS'] },
    { d: 2, p: 'Elige y justifica el sistema de archivos para: un pendrive de 128 GB con vídeos de 8 GB entre Windows, macOS y Linux, y la partición EFI de un equipo UEFI.', r: 'Pendrive: exFAT. FAT32 no admite archivos de más de 4 GB, NTFS solo se puede leer en macOS y ext4 no funciona en Windows ni macOS sin programas extra; exFAT admite archivos grandes y funciona en los tres. Se renuncia a los permisos y al journaling. Partición EFI: FAT32, porque la especificación UEFI exige FAT y es lo que el firmware sabe leer antes de cargar el sistema; NTFS y ext4 no funcionarían.', k: ['Pendrive: exFAT', 'Descarta FAT32 por el límite de 4 GB', 'Descarta NTFS (macOS solo lee) y ext4', 'Renuncia a permisos y journaling', 'EFI: FAT32 porque lo exige UEFI'] },
    { d: 3, p: 'Disco externo de 2 TB para copias de seguridad de un Windows y de un Linux, conservando los permisos. ¿Qué harías y por qué?', r: 'Ningún sistema cumple todo: NTFS guarda los permisos de Windows pero no los de Linux, y ext4 guarda los de Linux pero Windows no lo lee. Lo mejor es dividir el disco en dos particiones: una NTFS para las copias de Windows y otra ext4 para las de Linux. Con un solo sistema elegiría NTFS y renunciaría a los permisos de Linux; otra opción es guardar las copias de Linux en un archivo .tar, que sí conserva los permisos.', k: ['Ningún sistema cumple todo', 'Dos particiones: NTFS + ext4', 'Por qué cada una (permisos de cada sistema)', 'Alternativa con un solo sistema o .tar'] },
    { d: 2, p: 'Explica las diferencias entre MBR y GPT y cuándo usarías cada uno.', r: 'MBR guarda la tabla en los primeros 512 bytes, admite discos de hasta 2 TB y 4 primarias (o 3 primarias + 1 extendida con lógicas); se usa con BIOS en equipos antiguos. GPT usa GUIDs, admite discos de hasta 8 ZiB y 128 primarias sin extendidas ni lógicas, guarda una copia de la tabla al final del disco y requiere UEFI; es el de los equipos modernos.', k: ['MBR: 512 bytes, 2 TB, 4 primarias', 'Extendida y lógicas solo en MBR', 'GPT: 8 ZiB, 128 primarias', 'GPT guarda copia de la tabla', 'MBR con BIOS, GPT con UEFI'] },
    { d: 3, p: 'Caso A: portátil UEFI con SSD NVMe de 512 GB y 16 GB de RAM, con Windows 11 (al menos 150 GB) y Ubuntu con /home separado y sin hibernación. Elige esquema, diseña la tabla y justifica los tamaños.', r: 'GPT, porque el equipo es UEFI y Windows 11 en UEFI solo se instala sobre GPT (además, 128 primarias y copia de la tabla). Tabla: nvme0n1p1 EFI FAT32 512 MB (/boot/efi), p2 MSR 16 MB sin formato, p3 Windows NTFS 160 GB (C:), p4 recuperación NTFS 1 GB, p5 / ext4 60 GB, p6 swap 4 GB, p7 /home ext4 con el resto (unos 286 GB). Una sola ESP para los dos gestores; swap de 4 GB porque no se hiberna; /home separado para no perder los datos al reinstalar.', k: ['GPT y por qué', 'EFI FAT32 + MSR 16 MB', 'Windows ≥150 GB en NTFS', '/, swap y /home con ext4/swap', 'Nombres /dev/nvme0n1pX', 'Justifica swap 4 GB y /home separado'] },
    { d: 3, p: 'En un dual boot UEFI, ¿en qué orden instalas Windows y Ubuntu y por qué? ¿Qué pasa si lo haces al revés y cómo lo arreglas?', r: 'Primero Windows y después Ubuntu: Windows Boot Manager solo arranca Windows y se pone el primero sin preguntar, mientras que GRUB detecta los otros sistemas con os-prober y los añade a su menú. Al instalar Ubuntu se usa la ESP existente sin formatearla. Si se hace al revés, Windows se pone primero en la UEFI y entra directo; Ubuntu sigue instalado y GRUB sigue en \\EFI\\ubuntu. Se arregla poniendo ubuntu primero en el orden de arranque de la UEFI, con bcdedit /set {bootmgr} path \\EFI\\ubuntu\\shimx64.efi, o con Boot-Repair / grub-install y update-grub.', k: ['Primero Windows, después Ubuntu', 'GRUB detecta Windows; Windows Boot Manager no detecta Linux', 'ESP sin formatear', 'Al revés: Windows entra sin menú, Ubuntu sigue', 'Al menos una solución'] },
    { d: 2, p: 'Caso B: equipo con BIOS y disco de 2 TB que necesita 6 particiones con MBR. Diseña la tabla y razona si GPT sería mejor.', r: 'MBR solo tiene 4 entradas, así que: 3 primarias (sda1 / ext4 activa, sda2 swap, sda3 /datos ext4) y sda4 extendida con 3 lógicas (sda5, sda6, sda7 para pruebas). El disco cabe entero: el límite es 2^32 × 512 B = 2 TiB y 2 TB son unos 1,82 TiB. GPT sería mejor para Linux (sin extendida, copia de la tabla, sin límite), con una partición BIOS boot de 1 MB para GRUB; pero si se quiere Windows, que solo arranca GPT con UEFI, o la BIOS es muy antigua, MBR es lo seguro.', k: ['3 primarias + extendida + 3 lógicas', 'Lógicas desde sda5', 'El disco cabe (límite 2 TiB)', 'GPT mejor para Linux con BIOS boot', 'MBR si Windows o BIOS muy antigua'] },
    { d: 2, p: 'Explica qué es un hipervisor, los dos tipos y los modos de red de VirtualBox.', r: 'Es la capa de software entre el hardware y las máquinas virtuales: da a cada una hardware virtual y reparte los recursos físicos. Tipo 1 (bare-metal) va sobre el hardware: ESXi, Hyper-V, Proxmox. Tipo 2 se instala sobre un SO: VirtualBox, VMware Workstation. Modos de red: NAT (por defecto, sale con la IP del anfitrión), puente (IP propia en la red física), red interna (solo entre VM) y solo-anfitrión (anfitrión y VM, sin salida).', k: ['Definición de hipervisor', 'Tipo 1 con ejemplos', 'Tipo 2 con ejemplos', 'NAT y puente', 'Red interna y solo-anfitrión'] },
    { d: 2, p: 'Describe la instalación de Ubuntu Desktop en una máquina virtual con un particionado manual de 45 % para /, 50 % para /home y 5 % para swap.', r: 'Se crea la VM (Linux, Ubuntu 64 bits, 4 GB de RAM, disco de 25 GB dinámico) y se le pone la ISO. Se arranca, se elige idioma y teclado, «Instalar Ubuntu», instalación normal y se hace instalación manual: 45 % para / (ext4), 50 % para /home (ext4) y 5 % para swap. Se crea el usuario y se instala. Después: sudo apt update && sudo apt upgrade -y, herramientas de integración (Guest Additions o VMware Tools) y reiniciar. Se comprueba con lsb_release -a, lsblk y swapon --show.', k: ['Configuración de la VM (RAM, disco, ISO)', 'Pasos del instalador', 'Particionado 45/50/5 con ext4 y swap', 'Actualización con apt', 'Guest Additions / VMware Tools'] },
    { d: 3, p: 'Explica las diferencias entre Ubuntu Server y Ubuntu Desktop y cómo queda un disco de 25 GB al instalar Ubuntu Server con LVM.', r: 'Server no tiene entorno gráfico (gasta menos memoria y disco), usa el instalador Subiquity en modo texto, no tiene «Probar Ubuntu», configura la red e IP fija durante la instalación, usa LVM por defecto y ofrece instalar OpenSSH. Disco: sda1 BIOS boot de 1 MiB, sda2 /boot ext4 de 2 GiB fuera de LVM, sda3 volumen físico del grupo ubuntu-vg, con el volumen lógico ubuntu-lv (11,5 GiB) montado en / y 11,5 GiB libres para ampliar con lvextend. La swap es el archivo /swap.img.', k: ['Sin entorno gráfico', 'Subiquity, red al instalar, SSH', 'LVM: PV → VG → LV', '/boot fuera de LVM', 'Espacio libre para lvextend y swap en /swap.img'] },
    { d: 3, p: 'Un Ubuntu Server en la red NAT de VMware (192.168.111.0/24) tiene la IP fija 192.168.111.10, pero apt update falla con «Fallo temporal al resolver archive.ubuntu.com». Explica la causa, cómo se diagnostica y cómo se arregla.', r: 'Al poner la IP fija 192.168.111.10/24 se dejaron vacíos la puerta de enlace y los DNS, así que salía «Fallo temporal al resolver archive.ubuntu.com». ip addr mostraba ens33 con la IP (la tarjeta funcionaba) e ip route no tenía línea default. Se arregla editando /etc/netplan/50-cloud-init.yaml: routes to default via 192.168.111.2 (el router virtual de la NAT de VMware) y nameservers 192.168.111.2 y 8.8.8.8; luego sudo netplan apply, ping -c 3 archive.ubuntu.com y repetir apt update.', k: ['Faltaban puerta de enlace y DNS', 'ip addr / ip route para diagnosticar', 'Editar netplan (archivo .yaml)', 'Puerta de enlace 192.168.111.2 y DNS', 'sudo netplan apply y comprobar'] },
    { d: 2, p: 'Compara contenedores y máquinas virtuales.', r: 'Los contenedores virtualizan a nivel de sistema operativo: comparten el kernel del anfitrión, son ligeros, consumen pocos recursos y arrancan en segundos, con un aislamiento medio. Las máquinas virtuales virtualizan el hardware: cada una tiene su propio sistema operativo invitado, consumen más recursos, arrancan en minutos y aíslan más. Ejemplos: Docker frente a VirtualBox o VMware.', k: ['Contenedor comparte kernel', 'VM tiene Guest OS completo', 'Recursos y tiempo de arranque', 'Aislamiento', 'Ejemplos'] },
    { d: 3, p: 'Quieres servir una web estática (carpeta web/) con nginx en Docker. Escribe el Dockerfile y explica cómo construir la imagen, lanzar el contenedor en el puerto 8080 y editar la web sin reconstruir.', r: 'Dockerfile en parte1: FROM nginx:stable-alpine y COPY web/ /usr/share/nginx/html/, que es donde nginx busca las páginas. Se construye con docker build -t mi-web:1.0 . y se comprueba con docker images. Se lanza con docker run -d --name mi-web -p 8080:80 mi-web:1.0 (segundo plano, puerto 80 del contenedor en el 8080 del equipo) y se abre localhost:8080. Después docker stop y docker rm, y se vuelve a lanzar con -v "${PWD}\\web:/usr/share/nginx/html" para editar el HTML sin reconstruir la imagen.', k: ['FROM nginx:stable-alpine y COPY a /usr/share/nginx/html', 'docker build -t mi-web:1.0 .', 'docker run -d --name -p 8080:80', 'Explica el puerto equipo:contenedor', 'Volumen -v para editar sin reconstruir'] },
    { d: 3, p: 'Una app Node.js (puerto 3000) guarda un contador de visitas en MariaDB. Explica cómo sería su compose.yaml con dos servicios, app y db, y cómo se comunican.', r: 'Dos servicios. app se construye con build: ./app (Dockerfile con node:24-alpine, WORKDIR /app, COPY, RUN npm install, CMD node server.js), publica el 3000, tiene las variables DB_HOST: db, DB_USER, DB_PASSWORD, DB_NAME y depends_on: db. db usa mariadb:11.4 con las variables MARIADB_* y guarda los datos en el volumen datos-db montado en /var/lib/mysql, declarado al final en volumes:. Compose crea una red donde app encuentra a db por su nombre; el 3306 no se publica porque solo lo usa la app. Se levanta con docker compose up -d --build.', k: ['Servicio app: build, puerto 3000, variables, depends_on', 'Servicio db: mariadb:11.4 y variables', 'Volumen datos-db en /var/lib/mysql declarado', 'Red de Compose: DB_HOST db', '3306 no publicado'] },
    { d: 2, p: '¿Qué diferencia hay entre docker compose down y docker compose down -v? Explícalo con el contador de visitas.', r: 'docker compose down para y borra los contenedores y la red, pero no los volúmenes: al hacer up -d, MariaDB encuentra sus datos y el contador sigue donde estaba (60). docker compose down -v borra también los volúmenes (parte2_datos-db): al volver a levantar se crea un volumen vacío, la base de datos empieza de cero y el contador vuelve a 1.', k: ['down conserva los volúmenes', 'El contador se mantiene', 'down -v borra los volúmenes', 'El contador vuelve a 1'] },
    { d: 1, p: 'Explica qué hace sudo apt update && sudo apt upgrade -y.', r: 'sudo ejecuta como administrador. apt update descarga la lista de paquetes de los repositorios; apt upgrade instala las versiones nuevas de los paquetes instalados; -y responde «sí» a la confirmación. && hace que la segunda orden solo se ejecute si la primera ha ido bien. El orden importa: sin update, se actualizaría según un catálogo desactualizado.', k: ['sudo: administrador', 'update: lista de paquetes', 'upgrade: instala versiones nuevas', '-y y &&'] },
    null, // quitada: no entra en el examen
    { d: 3, p: 'Compara las arquitecturas monolítica, por capas, microkernel e híbrida (idea, rendimiento, modularidad, seguridad y ejemplos).', r: 'Monolítica: todo en un espacio de direcciones en modo kernel; rendimiento alto, modularidad y seguridad bajas (MS-DOS, Unix temprano, núcleo de Linux). Por capas: niveles jerárquicos; rendimiento medio, modularidad alta, seguridad media (Windows NT, THE OS). Microkernel: solo procesos, memoria e IPC en kernel; rendimiento medio-bajo por la comunicación, modularidad muy alta, seguridad alta (QNX, MINIX, L4). Híbrida: mezcla de las anteriores; buen rendimiento y modularidad media-alta, diseño complejo (Windows desde NT, macOS).', k: ['Monolítica con ventaja e inconveniente', 'Por capas', 'Microkernel y por qué es más seguro', 'Híbrida', 'Un ejemplo de cada una'] },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { d: 2, p: 'Explica los estados de un proceso y compara los algoritmos de planificación.', r: 'Nuevo (creado, sin cargar), Listo (en memoria esperando CPU), Ejecutando, Bloqueado (espera un evento externo, como E/S) y Terminado; al acabar la E/S vuelve a Listo. FCFS: por orden de llegada, simple pero con efecto convoy. SJF: el más corto primero, menor espera media pero difícil predecir duraciones. Round Robin: cuantos cíclicos, evita el monopolio de la CPU. Prioridad: flexible con riesgo de inanición. Multinivel: combina algoritmos, adaptable pero compleja.', k: ['Los cinco estados', 'Transición Bloqueado → Listo', 'FCFS y efecto convoy', 'SJF y Round Robin', 'Prioridad e inanición'] },
    { d: 3, p: 'Explica la jerarquía de memoria y las técnicas de gestión de memoria, incluida la paginación.', r: 'De más rápida y cara a más lenta y barata: registros, cachés L1/L2/L3, RAM, SSD, HDD y cinta. Técnicas: partición fija (fragmentación interna), partición dinámica (fragmentación externa), paginación (marcos y páginas, sin fragmentación externa, sobrecarga de tablas), segmentación (código, datos, pila; protección; fragmentación externa) y memoria virtual (disco para simular más RAM). En la paginación, la tabla de páginas relaciona páginas lógicas con marcos físicos; si una página no está en RAM hay un page fault y se carga desde disco o swap.', k: ['Jerarquía en orden', 'Partición fija y dinámica con su fragmentación', 'Paginación y segmentación', 'Memoria virtual', 'Page fault'] },
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    { d: 2, p: 'Explica los tipos de software según su licencia y las licencias de Windows.', r: 'Libre: usar, estudiar, modificar y redistribuir (Linux, LibreOffice), con licencias copyleft como la GPL o permisivas como MIT y BSD. Código abierto: código accesible y modificable (base de Android, Chromium). Propietario: solo derecho de uso según el EULA (Windows, macOS). Freeware: gratuito y cerrado. Shareware: prueba gratuita y luego pago. Windows: OEM (ligada al equipo), Retail (transferible) y por volumen (empresas y centros); Windows Server se licencia por núcleos y licencias de acceso de cliente.', k: ['Libre y código abierto', 'Copyleft frente a permisiva', 'Propietario, freeware y shareware', 'OEM, Retail y por volumen', 'Windows Server'] },
    { d: 2, p: 'Explica las estrategias de asignación de bloques y compara exFAT, Btrfs y ZFS.', r: 'Contigua: bloques seguidos, eficiente en acceso secuencial pero fragmenta. Encadenada: cada bloque apunta al siguiente, no fragmenta pero lee despacio. Indexada: un índice guarda las direcciones, no fragmenta y permite acceso secuencial y aleatorio; es la más usada. exFAT: sin límite de 4 GB, para USB y SD, sin permisos ni journaling. Btrfs: snapshots, compresión, deduplicación y RAID, menos maduro que ext4. ZFS: integridad con checksums, snapshots y pools, pero necesita mucha RAM y no es nativo en Windows.', k: ['Contigua', 'Encadenada', 'Indexada (la más usada)', 'exFAT', 'Btrfs y ZFS'] },
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    { d: 2, p: 'Explica qué es WSL, las diferencias entre WSL 1 y WSL 2, sus requisitos y cómo se instala.', r: 'Permite ejecutar un entorno Linux completo en Windows sin VM tradicional ni dual boot, con rendimiento casi nativo. WSL 1 traduce las llamadas al sistema con el kernel de Windows, es ligero y no admite GUI; WSL 2 usa una VM ligera con kernel Linux real, rinde mejor en archivos y red, admite GUI e integra Docker Desktop. Requisitos: Windows 11 22000 o superior, x64 o ARM64 para WSL 2, virtualización activada y 1 GB de disco. Se instala con wsl --install en PowerShell como administrador y se comprueba con wsl --list --verbose.', k: ['Qué es WSL', 'WSL 1: traduce llamadas', 'WSL 2: VM con kernel real, GUI, Docker', 'Requisitos', 'wsl --install'] },
  ],
};

// Tarjetas para completar: lo que va entre [corchetes] es el hueco; con | se separan respuestas que también valen.
window.HUECOS = {
  'Sistemas Informáticos': [
    // Apartado 1: arquitectura
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    'En la arquitectura [monolítica] todo el SO se ejecuta en un único espacio de direcciones en modo kernel.',
    'En la arquitectura por capas, cada capa ofrece servicios a la de [arriba] y usa los de la de [abajo].',
    'Un [microkernel] solo ejecuta en modo kernel la gestión de procesos, la memoria y la [IPC].',
    'QNX, MINIX y L4 son ejemplos de arquitectura [microkernel].',
    'Windows desde NT y macOS tienen una arquitectura [híbrida].',
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    // Apartado 2: elementos
    'Un [proceso] es un programa en ejecución que necesita recursos.',
    'Un proceso en memoria esperando la CPU está en estado [Listo].',
    'Un proceso que espera a que termine una operación de E/S está en estado [Bloqueado].',
    'El algoritmo [FCFS] atiende por orden de llegada y sufre el efecto [convoy].',
    'Round Robin reparte la CPU en [cuantos] de tiempo cíclicos.',
    'La planificación por prioridad tiene riesgo de [inanición].',
    'SJF ejecuta primero el proceso más [corto].',
    'Los pipes son [unidireccionales] y las colas de mensajes, bidireccionales.',
    'Los [semáforos] sincronizan procesos y evitan condiciones de carrera.',
    'Los [sockets] comunican procesos de distintas máquinas.',
    'La partición fija de memoria provoca fragmentación [interna].',
    'La paginación divide la memoria física en [marcos] y la lógica en [páginas].',
    'Cuando una página no está en RAM se produce un [page fault|fallo de página].',
    'La segmentación divide la memoria en código, [datos] y [pila].',
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    // Apartado 3: licencias
    'El software [libre] permite usar, estudiar, modificar y redistribuir el programa.',
    'El software gratuito pero con código cerrado es [freeware].',
    'La GPL es una licencia [copyleft] y MIT y BSD son [permisivas].',
    'La licencia de Windows que viene preinstalada y queda ligada al equipo es la [OEM].',
    'La licencia [Retail] de Windows se compra suelta y se puede transferir.',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    // Apartado 4: sistemas de archivos
    'El [registro] es la unidad lógica de acceso y el [bloque], la unidad física mínima de transferencia.',
    'La asignación más usada es la [indexada].',
    'En la asignación [encadenada] cada bloque apunta al siguiente.',
    'FAT32 admite archivos de hasta [4 GB].',
    'En la práctica, una partición FAT32 llega a [32 GB].',
    'NTFS guarda los metadatos de todos los archivos en la [MFT].',
    'NTFS controla los permisos con [ACL] y cifra con [EFS].',
    'En ext4, un archivo puede ocupar hasta [16 TB] y una partición hasta [1 EB].',
    'ext4 se basa en [inodos] y usa extents.',
    'macOS solo puede [leer] NTFS, no escribir.',
    '[exFAT] no tiene el límite de 4 GB por archivo y funciona en Windows, macOS y Linux.',
    '[Btrfs] ofrece snapshots, compresión y deduplicación, pero es menos maduro que ext4.',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    'La partición EFI de un equipo UEFI va en [FAT32].',
    'Para un pendrive con vídeos de 8 GB que se usa en Windows, macOS y Linux se elige [exFAT].',
    // Apartado 5: particionado
    'MBR admite como máximo [4] particiones primarias y GPT, [128].',
    'MBR guarda la tabla en los primeros [512] bytes del disco.',
    'MBR admite discos de hasta [2 TB] y GPT, hasta [8 ZiB].',
    'Solo puede haber una partición [extendida] por disco, y solo en MBR.',
    'En Linux, las particiones lógicas se numeran desde el [5].',
    'GPT guarda una copia de la tabla al [final] del disco.',
    'GPT requiere firmware [UEFI] y MBR se usa con [BIOS].',
    'La partición reservada de Microsoft en discos GPT se llama [MSR] y ocupa [16 MB].',
    'En Windows se particiona con [diskpart] o el Administrador de discos.',
    'En Linux, las herramientas de particionado en consola son fdisk, gdisk y [parted].',
    // Apartado 6: instalación y actualizaciones
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    'Las actualizaciones más urgentes son las de [seguridad].',
    'En Ubuntu, primero se ejecuta apt [update] y después apt [upgrade].',
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    // Apartado 7: virtualización
    'El SO de la máquina virtual es el [invitado|guest] y el del equipo real, el [anfitrión|host].',
    'Al hipervisor también se le llama monitor de [máquina virtual|máquinas virtuales] (VMM).',
    'Un hipervisor de tipo [1] se ejecuta directamente sobre el hardware.',
    'VirtualBox y VMware Workstation son hipervisores de tipo [2].',
    'El modo de red por defecto de VirtualBox es [NAT].',
    'Con el adaptador [puente] la VM recibe su propia IP de la red física.',
    'La red [interna] comunica solo las máquinas virtuales entre sí.',
    'La red solo-[anfitrión] conecta el anfitrión con las VM, sin salida a la red externa.',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    // Apartado 8 y 9: contenedores y Docker
    'Los contenedores comparten el [kernel] del anfitrión.',
    'Un contenedor arranca en [segundos] y una máquina virtual, en minutos.',
    'Un contenedor es una instancia en ejecución de una [imagen].',
    'Con -p 8080:80, el puerto [8080] es del equipo y el [80], del contenedor.',
    'La red por defecto de Docker es [bridge].',
    'Los datos de un contenedor sin volumen son [volátiles]: se pierden al borrarlo.',
    'RUN se ejecuta al [construir] la imagen y CMD, al [arrancar|iniciar] el contenedor.',
    'Las imágenes se comparten subiéndolas a un [registro|registry].',
    'Para entornos críticos, en lugar de Docker Compose, el temario recomienda [Kubernetes] o Docker Swarm.',
    'docker compose [down] borra contenedores y red, pero conserva los volúmenes.',
    'Con docker compose down [-v] se borran también los volúmenes.',
    // Apartado 10: buenas prácticas
    'Un Dockerfile empieza siempre con [FROM].',
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: no entra en el examen
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: no entra en el examen
    // Apartado 11: WSL
    'WSL 1 traduce las llamadas al sistema y WSL 2 usa un [kernel] Linux real.',
    'WSL se instala con el comando [wsl --install].',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    // Prácticas
    'Un disco NVMe se llama en Linux /dev/[nvme0n1].',
    'En un dual boot se instala primero [Windows] y después Ubuntu.',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    'Al instalar Ubuntu junto a Windows, la partición EFI se usa sin [formatear|formatearla].',
    'Con 16 GB de RAM y sin hibernación, la guía de Ubuntu recomienda [4 GB] de swap.',
    'Con BIOS y disco GPT, GRUB necesita una partición [BIOS boot] de 1 MB.',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    'En VMware, lo equivalente a las Guest Additions son las [VMware Tools] (paquete open-vm-tools).',
    'El disco dinámico VDI de VirtualBox equivale en VMware a un disco [VMDK].',
    'Ubuntu Server usa el instalador [Subiquity], en modo texto.',
    'En LVM, la partición se convierte en volumen [físico], que forma un [grupo] de volúmenes donde se crean volúmenes lógicos.',
    'Un volumen lógico se amplía con [lvextend].',
    'En Ubuntu Server con LVM, la swap es el archivo [/swap.img].',
    'La red de Ubuntu Server se configura con [netplan] y se aplica con sudo netplan [apply].',
    'Si ip route no muestra una línea [default], falta la puerta de enlace.',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    'Para servir una web con nginx se copia la carpeta a [/usr/share/nginx/html].',
    'docker build -t mi-web:1.0 . construye la imagen mi-web con la etiqueta [1.0].',
    'En un compose.yaml, la app encuentra la base de datos por el nombre del [servicio].',
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
    null, // quitada: demasiado rebuscada (se deja el hueco para no mover el progreso)
  ],
};

// Resúmenes en PDF para leer desde Repaso (rutas relativas a la web)
window.RESUMENES = {
  'Sistemas Informáticos': [{ t: 'Resumen del examen del Tema 2', f: 'sistemas/Resumen_Examen_Sistemas_Tema2.pdf' }],
};
