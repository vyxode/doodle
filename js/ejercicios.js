// Catálogo de ejercicios de C#, tema a tema: una selección de los ejercicios de los apuntes (en su orden) y luego los del banco del examen,
// sin repetidos (uno o dos por tipo de ejercicio). Enunciados propios; las pruebas están en js/pruebas.js.
// «siempre»: salen también en Repaso para cada lector.
window.EJERCICIOS = [
 {
  "modulo": "Programación",
  "lenguaje": "csharp",
  "siempre": true,
  "ejercicios": [
   {
    "id": "prog-01c_05",
    "n": "1.1",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C#",
    "texto": "Suma con formato: Guarda 23 y 42 en dos variables enteras num1 y num2, calcula su suma en otra variable llamada suma y muestra «La suma de X e Y es Z» usando marcadores {0}, {1} y {2}."
   },
   {
    "id": "prog-01c_07",
    "n": "1.2",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C#",
    "texto": "Cociente y resto: Pide dos números enteros n1 y n2 y muestra el cociente de la división entera de n1 entre n2 y su resto. Ejemplo: con 17 y 5 salen 3 y 2."
   },
   {
    "id": "prog-01c_08",
    "n": "1.3",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C#",
    "texto": "Metros a millas: Pide una cantidad de metros y di cuántas millas son (1 milla = 1609 metros, división entera). Ejemplo: 4827 metros son 3 millas."
   },
   {
    "id": "prog-01c_10",
    "n": "1.4",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C#",
    "texto": "Tabla de multiplicar: Pide un número entero y muestra su tabla de multiplicar del 1 al 10 con el formato «3 x 1 = 3», usando {0}, {1} y {2}."
   },
   {
    "id": "banco-1.1",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C# · Banco del examen",
    "n": "1.5",
    "texto": "Conversor de segundos: pide una cantidad total de segundos (entero) y muestra a cuántas horas, minutos y segundos equivale, usando divisiones enteras y restos."
   },
   {
    "id": "banco-1.2",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C# · Banco del examen",
    "n": "1.6",
    "texto": "Precio con IVA y descuento: pide el precio base de un producto y un porcentaje de descuento. Aplica el descuento, súmale un 21 % de IVA y muestra el precio final en una sola línea usando marcadores de posición ({0})."
   },
   {
    "id": "banco-1.3",
    "tema": "Tema 1 · Toma de contacto con C#",
    "grupo": "Tema 1 · Toma de contacto con C# · Banco del examen",
    "n": "1.7",
    "texto": "Evaluación de expresiones: sin ejecutarlo, piensa qué mostrará 15 + 20 / 3 * 2 - 10 % 4 según la precedencia de operadores de C#. Después compruébalo con un programa que lo escriba."
   },
   {
    "id": "prog-02a_04",
    "n": "2.1",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "División segura: Pide dos números y muestra la división del primero entre el segundo. Si el segundo es 0, muestra «No se puede dividir por cero»."
   },
   {
    "id": "prog-02a_07",
    "n": "2.2",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Múltiplo de 2 y no de 3: Pide un número y di si es múltiplo de 2 pero no de 3. Si no lo es, dilo también (el mensaje debe contener «no»)."
   },
   {
    "id": "prog-02a_08",
    "n": "2.3",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Mayor de tres: Pide tres números y muestra cuál es el mayor de los tres."
   },
   {
    "id": "prog-02a_09",
    "n": "2.4",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "¿Cuántos positivos?: Pide dos enteros y responde «Los dos números son positivos», «Uno de los números es positivo» o «Ninguno de los números es positivo»."
   },
   {
    "id": "prog-02a_10",
    "n": "2.5",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Menor con ? :: Pide dos números y, con el operador condicional (? :), muestra el menor."
   },
   {
    "id": "prog-02a_11",
    "n": "2.6",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Mes con switch: Pide un número de mes (1 a 12) y, con switch, muestra su nombre («Marzo» para el 3). Si no está entre 1 y 12, muestra «Mes incorrecto»."
   },
   {
    "id": "prog-02a_13",
    "n": "2.7",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Tipo de carácter: Pide un carácter y di si es una letra de la A a la Z (mayúscula), un dígito del 0 al 9 u otra cosa."
   },
   {
    "id": "prog-02b_07",
    "n": "2.8",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Múltiplos de 3 y 7: Muestra los números del 100 al 200 que son múltiplos de 3 y de 7 a la vez (y solo esos)."
   },
   {
    "id": "prog-02b_08",
    "n": "2.9",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Tabla validada: Pide un número del 1 al 10 (vuelve a pedirlo mientras no lo esté) y muestra su tabla de multiplicar."
   },
   {
    "id": "prog-02c_09",
    "n": "2.10",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Contar letras a: Pide un texto y cuenta cuántas «a» minúsculas tiene."
   },
   {
    "id": "prog-02c_08",
    "n": "2.11",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Saltar múltiplos de 10: Muestra los números del 2 al 106 saltándote los múltiplos de 10, usando continue."
   },
   {
    "id": "prog-02c_11b",
    "n": "2.12",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Adivina el número: Juego: el usuario adivina un número del 1 al 100 fijado en el código. Tras cada intento dile si se ha pasado o se ha quedado corto. Tiene como máximo 6 intentos."
   },
   {
    "id": "prog-02c_02",
    "n": "2.13",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Secuencia 1 12 123: Con bucles anidados, muestra estas cinco líneas: 1, 12, 123, 1234, 12345 (una debajo de otra)."
   },
   {
    "id": "prog-02c_05",
    "n": "2.14",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Triángulo creciente: Pide una altura y dibuja un triángulo de asteriscos creciente: una línea con 1 asterisco, la siguiente con 2… hasta la altura."
   },
   {
    "id": "prog-02c_06",
    "n": "2.15",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Triángulo a la derecha: Como el anterior, pero con el triángulo alineado a la derecha (rellena con espacios a la izquierda)."
   },
   {
    "id": "ampl-2.5.7",
    "n": "2.16",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Rectángulo hueco: Pide un ancho y un alto y dibuja un rectángulo hueco de asteriscos (solo el borde)."
   },
   {
    "id": "prog-02c_07",
    "n": "2.17",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Máximo común divisor: Pide dos números y calcula su máximo común divisor. Pista: empieza en el menor y ve bajando hasta encontrar uno que divida a los dos."
   },
   {
    "id": "ampl-2.2.10.2",
    "n": "2.18",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Mínimo común múltiplo: Pide dos números y calcula su mínimo común múltiplo (el menor número que es múltiplo de los dos)."
   },
   {
    "id": "prog-02c_12",
    "n": "2.19",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "¿Es primo?: Pide un número y di si es primo o no (solo divisible por 1 y por sí mismo)."
   },
   {
    "id": "ampl-2.5.6",
    "n": "2.20",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Potencia sin Math.Pow: Pide una base y un exponente (enteros, exponente ≥ 0) y calcula la potencia con multiplicaciones sucesivas, sin Math.Pow."
   },
   {
    "id": "ampl-2.5.9",
    "n": "2.21",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Desglose de billetes: Pide una cantidad de euros (entera) y desglósala en el mínimo número de billetes y monedas de 100, 50, 20, 10, 5, 2 y 1."
   },
   {
    "id": "prog-02d_01b",
    "n": "2.22",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control",
    "texto": "Edad y año con try-catch: Pide la edad y el año de nacimiento con try-catch: si alguno no es un número válido, muestra un aviso, pero pide siempre los dos datos."
   },
   {
    "id": "banco-2.1",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control · Banco del examen",
    "n": "2.23",
    "texto": "Validador de contraseña con intentos: pide un nombre y, con un bucle, una clave numérica (por ejemplo 4589, o una aleatoria con Random rd = new Random(); rd.Next(0, 10)). Hay 5 intentos como máximo: si se fallan todos, muestra «Cuenta de {Nombre} Bloqueada»; si se acierta, «Estás iniciando sesión en la cuenta de {Nombre}». Puedes concatenar con +."
   },
   {
    "id": "banco-2.2",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control · Banco del examen",
    "n": "2.24",
    "texto": "Calculadora por menú: pide dos números enteros y muestra un menú con las opciones de texto «Sumar», «Restar», «Multiplicar» y «Dividir». Controla con excepciones la lectura de los números para que las operaciones se puedan hacer correctamente."
   },
   {
    "id": "banco-2.3",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control · Banco del examen",
    "n": "2.25",
    "texto": "Descomposición en factores primos: pide un entero positivo y muestra su descomposición en factores primos (por ejemplo, 60 → 2 * 2 * 3 * 5)."
   },
   {
    "id": "banco-2.4",
    "tema": "Tema 2 · Estructuras de control",
    "grupo": "Tema 2 · Estructuras de control · Banco del examen",
    "n": "2.26",
    "texto": "Lectura segura con excepciones: pide enteros sin parar hasta que se escriba 0 y calcula la suma total. Si se escribe texto o un número demasiado grande, el programa no se cierra: captura la excepción, avisa por consola y sigue pidiendo."
   },
   {
    "id": "prog-3.1.3.2",
    "n": "3.1",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "++a y a++: Calcula a mano y luego comprueba con un programa: a=5; b=++a; c=a++; b=b*5; a=a*2; Muestra a, b y c."
   },
   {
    "id": "prog-3.2.1.1",
    "n": "3.2",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "División entera y real: Muestra el resultado de dividir 3 entre 4, primero con enteros y después con números reales."
   },
   {
    "id": "prog-3.2.3.3",
    "n": "3.3",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Ecuación de segundo grado: Pide A, B y C y resuelve la ecuación Ax² + Bx + C = 0 mostrando sus dos soluciones (Math.Sqrt)."
   },
   {
    "id": "prog-3.2.3.4",
    "n": "3.4",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Interés compuesto: Interés compuesto: resultado = E · (1 + I)ⁿ. Calcula en cuánto se convierten 1000 euros en 10 años al 3 % anual (Math.Pow)."
   },
   {
    "id": "prog-3.2.3.7",
    "n": "3.5",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Aproximar π: Aproxima π con π/4 = 1/1 − 1/3 + 1/5 − 1/7 + … El usuario indica cuántos términos y se muestra el valor de π tras cada término."
   },
   {
    "id": "prog-3.2.5.3",
    "n": "3.6",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Rectángulo con decimales: Pide el ancho y el alto de un rectángulo y muestra su perímetro, su área y su diagonal (Pitágoras) con una cifra decimal."
   },
   {
    "id": "prog-3.2.6.1",
    "n": "3.7",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Binario y hexadecimal: Pide números en base 10 y muestra cada uno en binario y en hexadecimal (Convert.ToString). Repite hasta que se introduzca 0."
   },
   {
    "id": "prog-3.2.6.2",
    "n": "3.8",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Color RGB en hexadecimal: Pide las cantidades de rojo, verde y azul (0 a 255) y muestra el color en hexadecimal con dos cifras por componente, por ejemplo FFA000."
   },
   {
    "id": "prog-3.2.7.4",
    "n": "3.9",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Seno, coseno y tangente: Pide un ángulo en grados y muestra su seno, coseno y tangente (pásalo antes a radianes: 180 grados = π radianes)."
   },
   {
    "id": "prog-3.3.1.2",
    "n": "3.10",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Letras alternas: Pide una letra minúscula y muestra letras alternas desde ella hasta la «z» (una sí y una no). Con «a» sale «acegikmoqsuwy»."
   },
   {
    "id": "prog-3.3.2.1",
    "n": "3.11",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Cuatro letras al revés: Pide cuatro letras de una en una y muéstralas juntas en orden inverso y entre comillas dobles. Con a, l, o, h sale \"hola\"."
   },
   {
    "id": "prog-3.4.2",
    "n": "3.12",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Contraseña repetida: Pide un nombre y una contraseña dos veces. Si las dos contraseñas no coinciden, avisa y vuelve a pedirlas hasta que coincidan."
   },
   {
    "id": "prog-3.5.4",
    "n": "3.13",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Booleano ambosPares: Pide dos números y guarda en un bool llamado ambosPares si los dos son pares. Hazlo primero con el operador condicional y después asignando la comparación directamente. Muestra el booleano."
   },
   {
    "id": "prog-3.6.2",
    "n": "3.14",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos",
    "texto": "Enumeración de meses: Crea una enumeración con los meses del año, de ENERO (valor 1) a DICIEMBRE (valor 12), y muestra el valor numérico de OCTUBRE."
   },
   {
    "id": "banco-3.1",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos · Banco del examen",
    "n": "3.15",
    "texto": "Formateo y geometría: pide el radio de una esfera (puede ser decimal) y calcula su volumen, V = 4/3 · π · r³. Muestra el resultado exacto, después con 2 decimales (\"0.00\") y por último truncado a entero."
   },
   {
    "id": "banco-3.2",
    "tema": "Tema 3 · Tipos de datos básicos",
    "grupo": "Tema 3 · Tipos de datos básicos · Banco del examen",
    "n": "3.16",
    "texto": "Analizador de caracteres con booleanos: pide un carácter y declara tres variables esMayuscula, esDigito y esVocal, dándoles su valor directamente con comparaciones lógicas (sin if). Muestra el valor de los tres booleanos."
   },
   {
    "id": "prog-4.1.3.3",
    "n": "4.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Por encima de la media: Pide 10 números reales (double), calcula su media y muestra los que están por encima de ella."
   },
   {
    "id": "prog-4.1.3.5",
    "n": "4.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Días hasta fin de año: Con un array con los días de cada mes (año no bisiesto), pide un día y un mes y di cuántos días quedan hasta final de año."
   },
   {
    "id": "prog-4.1.3.7",
    "n": "4.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Lista de nombres: Reserva espacio para 100 nombres. Pide nombres hasta que se pulse Intro sin escribir nada y luego muéstralos todos."
   },
   {
    "id": "prog-4.2.1",
    "n": "4.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Mayor de cada bloque: Pide dos bloques de 10 enteros guardados en un array de dos dimensiones y muestra el mayor de cada bloque."
   },
   {
    "id": "prog-4.2.3",
    "n": "4.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Array escalonado: Pregunta el tamaño de dos bloques de enteros (pueden ser distintos), crea un array escalonado (int[][]), pide los datos y muestra el mayor de cada bloque."
   },
   {
    "id": "prog-4.3.2.1",
    "n": "4.6",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Canciones con struct: Struct Cancion con artista, título, duración en segundos y tamaño en KB. Array de hasta 100 canciones con menú: añadir, ver los títulos y buscar las que contengan un texto en el artista o en el título."
   },
   {
    "id": "prog-4.3.3.1",
    "n": "4.7",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Struct anidado: Amplía el anterior: la duración pasa a ser un struct anidado con minutos y segundos."
   },
   {
    "id": "prog-4.4.3.2",
    "n": "4.8",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Frase al revés: Pide una frase y muéstrala al revés, de la última letra a la primera."
   },
   {
    "id": "prog-4.4.4.2",
    "n": "4.9",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Nombre en triángulo: Pide tu nombre y muéstralo como un triángulo creciente con Substring: J, Ju, Jua, Juan."
   },
   {
    "id": "prog-4.4.6.2",
    "n": "4.10",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Quitar espacios repetidos: Pide una frase y quita los espacios repetidos: entre palabra y palabra solo debe quedar uno."
   },
   {
    "id": "prog-4.4.7.2",
    "n": "4.11",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Suma con Split: Pide varios números separados por espacios en una sola línea y muestra su suma."
   },
   {
    "id": "prog-4.4.8.1",
    "n": "4.12",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Comparar frases: Pide dos frases y muestra cuál iría después en un diccionario (CompareTo)."
   },
   {
    "id": "prog-4.4.9.1",
    "n": "4.13",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Vocales a o: Pide un texto y cambia todas sus vocales por «o». Ejemplo: murcielago → morcoologo."
   },
   {
    "id": "prog-4.4.9.3",
    "n": "4.14",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Ahorcado: Ahorcado: un jugador escribe la palabra, se muestra oculta con guiones (----) y el otro va diciendo letras; tras cada letra se muestra cómo va (h---, ho--…)."
   },
   {
    "id": "prog-4.6.3",
    "n": "4.15",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Agenda de 50 personas: Datos de hasta 50 personas (nombre, dirección, teléfono, edad) en un array de structs. Pide personas hasta que el nombre se deje vacío; luego un menú: ver todos los nombres, ver los de una edad y ver los que empiezan por una inicial."
   },
   {
    "id": "prog-4.7.6",
    "n": "4.16",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas",
    "texto": "Insertar y ordenar: Pide números hasta que se escriba «fin». Tras cada uno, añádelo al array, ordénalo con Array.Sort y muestra todos en una línea separados por espacios."
   },
   {
    "id": "banco-4.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas · Banco del examen",
    "n": "4.17",
    "texto": "División de arrays: genera un array de 12 enteros aleatorios entre 1 y 50. A partir de él crea dos arrays nuevos, uno solo con los pares y otro solo con los impares, del tamaño justo para los que hayan salido, y ordénalos de menor a mayor con Array.Sort."
   },
   {
    "id": "banco-4.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas · Banco del examen",
    "n": "4.18",
    "texto": "Cifrado César: pide una frase y un desplazamiento N. Desplaza cada letra minúscula N posiciones en el abecedario (después de la z se vuelve a la a); los espacios y signos se quedan igual. Ejemplo: «hola» con N = 5 → «mtqf»."
   },
   {
    "id": "banco-4.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas · Banco del examen",
    "n": "4.19",
    "texto": "Invertir el orden de las palabras: pide una frase con varios espacios entre palabras y muéstralas en orden inverso, separadas por un único guion y sin espacios repetidos. Ejemplo: \"  hola  que tal \" → \"tal-que-hola\"."
   },
   {
    "id": "banco-4.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas · Banco del examen",
    "n": "4.20",
    "texto": "Detector de palíndromos: pide una frase, pásala a minúsculas, quítale todos los espacios y comprueba recorriendo sus posiciones si se lee igual de izquierda a derecha que de derecha a izquierda."
   },
   {
    "id": "banco-4.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "Tema 4 · Arrays, estructuras y cadenas · Banco del examen",
    "n": "4.21",
    "texto": "Matriz y máximos por fila: declara un array bidimensional de enteros de 3 × 4, rellénalo con aleatorios entre 10 y 99, muéstralo en filas y columnas e indica el mayor de cada fila."
   },
   {
    "id": "prog-5.3.3",
    "n": "5.1",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "DibujarRectanguloHueco: Función DibujarRectanguloHueco(ancho, alto, letra) que dibuje solo el borde de un rectángulo con esa letra. En Main, pide los datos y llámala."
   },
   {
    "id": "prog-5.3.5",
    "n": "5.2",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "EscribirRepetido: Función EscribirRepetido(caracter, veces) que escriba el carácter varias veces en la misma línea, y DibujarRectangulo(ancho, alto) que se apoye en ella."
   },
   {
    "id": "prog-5.4.3",
    "n": "5.3",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Signo: Función Signo que reciba un float y devuelva -1 si es negativo, 1 si es positivo y 0 si es cero."
   },
   {
    "id": "prog-5.5.1",
    "n": "5.4",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "PedirEntero: Función PedirEntero(texto, minimo, maximo) que pida un número y lo repita mientras no esté en el rango; devuelve el valor válido."
   },
   {
    "id": "prog-5.5.3",
    "n": "5.5",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "EsPrimo: Función EsPrimo que reciba un entero y devuelva true si es primo y false si no."
   },
   {
    "id": "prog-5.5.4",
    "n": "5.6",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "ContarLetra: Función ContarLetra(cadena, letra) que devuelva cuántas veces aparece la letra en la cadena. ContarLetra(\"Barcelona\", 'a') devuelve 2."
   },
   {
    "id": "prog-5.5.7",
    "n": "5.7",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Agenda en funciones: Rehaz la agenda de 50 personas del tema 4 separando cada opción en su función: PedirDatos, MostrarTodos, MostrarPorEdad y MostrarPorInicial. Los datos compartidos, static fuera de Main."
   },
   {
    "id": "prog-5.7.2.1",
    "n": "5.8",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Intercambiar: Función Intercambiar(ref int a, ref int b) que intercambie los dos valores. Pruébala en Main."
   },
   {
    "id": "prog-5.7.2.3",
    "n": "5.9",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "MaxMinArray: Función MaxMinArray(double[] datos, ref double max, ref double min) que deje en max y min el mayor y el menor del array."
   },
   {
    "id": "prog-5.7.3.1",
    "n": "5.10",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Iniciales con out: Función Iniciales(string nombre, out char a, out char b) que, para «Nacho Cabanes», devuelva N y C (primera letra y la que va tras el primer espacio)."
   },
   {
    "id": "prog-5.7.4.1",
    "n": "5.11",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Edad con TryParse: Pide la edad tantas veces como haga falta hasta que se escriba un número válido, usando int.TryParse."
   },
   {
    "id": "ampl-5.9.1",
    "n": "5.12",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Potencia recursiva: Función recursiva Potencia(baseNum, exponente) para enteros (exponente ≥ 0). Piensa el caso base."
   },
   {
    "id": "prog-5.9.3",
    "n": "5.13",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Fibonacci recursivo: Función recursiva que calcule el término n de Fibonacci (los dos primeros valen 1). Pide n y muestra el resultado."
   },
   {
    "id": "prog-5.9.4",
    "n": "5.14",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "SumaVector recursiva: Función recursiva SumaVector(int[] v, int desde, int hasta) que sume los elementos del array entre esas dos posiciones."
   },
   {
    "id": "prog-5.9.6",
    "n": "5.15",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "Invertir recursivo: Función recursiva Invertir(cadena) que devuelva la cadena al revés: «Hola» → «aloH»."
   },
   {
    "id": "prog-5.9.8",
    "n": "5.16",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones",
    "texto": "MCD de Euclides: Pide dos números y calcula su máximo común divisor con el algoritmo de Euclides de forma recursiva: mcd(m, n) = mcd(n, m % n), y mcd(m, 0) = m."
   },
   {
    "id": "banco-5.1",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.17",
    "texto": "Ordenar tres valores: crea la función OrdenarTres, que reciba tres enteros por referencia y los deje ordenados (el primero el menor, el segundo el intermedio y el tercero el mayor). Muestra los valores en Main antes y después de llamarla."
   },
   {
    "id": "banco-5.2",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.18",
    "texto": "Estadísticas de un array: crea tres funciones que reciban un array de enteros y devuelvan el máximo (ObtenerMaximo), el mínimo (ObtenerMinimo) y la media con decimales (CalcularMedia). Úsalas para mostrar un resumen."
   },
   {
    "id": "banco-5.3",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.19",
    "texto": "Marco de texto: crea la función MostrarCajaTexto, que reciba un texto, un carácter para el borde y un margen lateral (en espacios), y escriba el texto dentro de un recuadro hecho con ese carácter. Ejemplo: «HOLA», '*' y margen 2."
   },
   {
    "id": "banco-5.4",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.20",
    "texto": "Gestión de inventario: define el struct Producto con codigo (string), nombre (string) y precio (double) y crea un array para 50 productos. Haz un menú con una función para cada opción: añadir un producto (comprobando que hay hueco), buscar productos cuyo nombre contenga un texto (sin distinguir mayúsculas) y borrar uno por su posición desplazando el resto a la izquierda."
   },
   {
    "id": "banco-5.5",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.21",
    "texto": "Suma de cifras (recursividad): crea la función recursiva SumarCifras, que reciba un entero positivo y devuelva la suma de sus dígitos (425 → 11). Sin bucles y sin pasar el número a texto."
   },
   {
    "id": "banco-5.6",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.22",
    "texto": "Contar apariciones (recursividad): crea la función recursiva ContarApariciones, que reciba un array de enteros, el número buscado y la posición desde la que empezar, y devuelva cuántas veces aparece. Sin bucles."
   },
   {
    "id": "banco-5.7",
    "tema": "Tema 5 · Funciones",
    "grupo": "Tema 5 · Funciones · Banco del examen",
    "n": "5.23",
    "texto": "Palíndromo recursivo: crea la función recursiva EsPalindromoRecursivo, que reciba una cadena (sin espacios y en minúsculas) y devuelva true si se lee igual en los dos sentidos. Sin bucles ni arrays auxiliares."
   }
  ]
 }
];
