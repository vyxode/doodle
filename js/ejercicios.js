// Catálogo de ejercicios. Añade temas o módulos nuevos aquí (o desde la app con "Nuevo ejercicio").
// lenguaje "csharp" muestra el editor con el simulador.
window.EJERCICIOS = [
 // Banco de ejercicios para preparar el examen (temas 1 a 5). «siempre»: sale también cuando los temas se leen de Aules
 {
  "modulo": "Programación",
  "lenguaje": "csharp",
  "siempre": true,
  "ejercicios": [
   {
    "id": "banco-1.1",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 1: Toma de contacto con C#",
    "n": "1.1",
    "texto": "Conversor de segundos: pide una cantidad total de segundos (entero) y muestra a cuántas horas, minutos y segundos equivale, usando divisiones enteras y restos."
   },
   {
    "id": "banco-1.2",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 1: Toma de contacto con C#",
    "n": "1.2",
    "texto": "Precio con IVA y descuento: pide el precio base de un producto y un porcentaje de descuento. Aplica el descuento, súmale un 21 % de IVA y muestra el precio final en una sola línea usando marcadores de posición ({0})."
   },
   {
    "id": "banco-1.3",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 1: Toma de contacto con C#",
    "n": "1.3",
    "texto": "Evaluación de expresiones: sin ejecutarlo, piensa qué mostrará 15 + 20 / 3 * 2 - 10 % 4 según la precedencia de operadores de C#. Después compruébalo con un programa que lo escriba."
   },
   {
    "id": "banco-2.1",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 2: Estructuras de control",
    "n": "2.1",
    "texto": "Validador de contraseña con intentos: pide un nombre y, con un bucle, una clave numérica (por ejemplo 4589, o una aleatoria con Random rd = new Random(); rd.Next(0, 10)). Hay 5 intentos como máximo: si se fallan todos, muestra «Cuenta de {Nombre} Bloqueada»; si se acierta, «Estás iniciando sesión en la cuenta de {Nombre}». Puedes concatenar con +."
   },
   {
    "id": "banco-2.2",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 2: Estructuras de control",
    "n": "2.2",
    "texto": "Calculadora por menú: pide dos números enteros y muestra un menú con las opciones de texto «Sumar», «Restar», «Multiplicar» y «Dividir». Controla con excepciones la lectura de los números para que las operaciones se puedan hacer correctamente."
   },
   {
    "id": "banco-2.3",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 2: Estructuras de control",
    "n": "2.3",
    "texto": "Descomposición en factores primos: pide un entero positivo y muestra su descomposición en factores primos (por ejemplo, 60 → 2 * 2 * 3 * 5)."
   },
   {
    "id": "banco-2.4",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 2: Estructuras de control",
    "n": "2.4",
    "texto": "Lectura segura con excepciones: pide enteros sin parar hasta que se escriba 0 y calcula la suma total. Si se escribe texto o un número demasiado grande, el programa no se cierra: captura la excepción, avisa por consola y sigue pidiendo."
   },
   {
    "id": "banco-3.1",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 3: Tipos de datos básicos",
    "n": "3.1",
    "texto": "Formateo y geometría: pide el radio de una esfera (puede ser decimal) y calcula su volumen, V = 4/3 · π · r³. Muestra el resultado exacto, después con 2 decimales (\"0.00\") y por último truncado a entero."
   },
   {
    "id": "banco-3.2",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 3: Tipos de datos básicos",
    "n": "3.2",
    "texto": "Analizador de caracteres con booleanos: pide un carácter y declara tres variables esMayuscula, esDigito y esVocal, dándoles su valor directamente con comparaciones lógicas (sin if). Muestra el valor de los tres booleanos."
   },
   {
    "id": "banco-4.1",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 4: Arrays, estructuras y cadenas",
    "n": "4.1",
    "texto": "División de arrays: genera un array de 12 enteros aleatorios entre 1 y 50. A partir de él crea dos arrays nuevos, uno solo con los pares y otro solo con los impares, del tamaño justo para los que hayan salido, y ordénalos de menor a mayor con Array.Sort."
   },
   {
    "id": "banco-4.2",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 4: Arrays, estructuras y cadenas",
    "n": "4.2",
    "texto": "Cifrado César: pide una frase y un desplazamiento N. Desplaza cada letra minúscula N posiciones en el abecedario (después de la z se vuelve a la a); los espacios y signos se quedan igual. Ejemplo: «hola» con N = 5 → «mtqf»."
   },
   {
    "id": "banco-4.3",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 4: Arrays, estructuras y cadenas",
    "n": "4.3",
    "texto": "Invertir el orden de las palabras: pide una frase con varios espacios entre palabras y muéstralas en orden inverso, separadas por un único guion y sin espacios repetidos. Ejemplo: \"  hola  que tal \" → \"tal-que-hola\"."
   },
   {
    "id": "banco-4.4",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 4: Arrays, estructuras y cadenas",
    "n": "4.4",
    "texto": "Detector de palíndromos: pide una frase, pásala a minúsculas, quítale todos los espacios y comprueba recorriendo sus posiciones si se lee igual de izquierda a derecha que de derecha a izquierda."
   },
   {
    "id": "banco-4.5",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 4: Arrays, estructuras y cadenas",
    "n": "4.5",
    "texto": "Matriz y máximos por fila: declara un array bidimensional de enteros de 3 × 4, rellénalo con aleatorios entre 10 y 99, muéstralo en filas y columnas e indica el mayor de cada fila."
   },
   {
    "id": "banco-5.1",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.1",
    "texto": "Ordenar tres valores: crea la función OrdenarTres, que reciba tres enteros por referencia y los deje ordenados (el primero el menor, el segundo el intermedio y el tercero el mayor). Muestra los valores en Main antes y después de llamarla."
   },
   {
    "id": "banco-5.2",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.2",
    "texto": "Estadísticas de un array: crea tres funciones que reciban un array de enteros y devuelvan el máximo (ObtenerMaximo), el mínimo (ObtenerMinimo) y la media con decimales (CalcularMedia). Úsalas para mostrar un resumen."
   },
   {
    "id": "banco-5.3",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.3",
    "texto": "Marco de texto: crea la función MostrarCajaTexto, que reciba un texto, un carácter para el borde y un margen lateral (en espacios), y escriba el texto dentro de un recuadro hecho con ese carácter. Ejemplo: «HOLA», '*' y margen 2."
   },
   {
    "id": "banco-5.4",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.4",
    "texto": "Gestión de inventario: define el struct Producto con codigo (string), nombre (string) y precio (double) y crea un array para 50 productos. Haz un menú con una función para cada opción: añadir un producto (comprobando que hay hueco), buscar productos cuyo nombre contenga un texto (sin distinguir mayúsculas) y borrar uno por su posición desplazando el resto a la izquierda."
   },
   {
    "id": "banco-5.5",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.5",
    "texto": "Suma de cifras (recursividad): crea la función recursiva SumarCifras, que reciba un entero positivo y devuelva la suma de sus dígitos (425 → 11). Sin bucles y sin pasar el número a texto."
   },
   {
    "id": "banco-5.6",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.6",
    "texto": "Contar apariciones (recursividad): crea la función recursiva ContarApariciones, que reciba un array de enteros, el número buscado y la posición desde la que empezar, y devuelva cuántas veces aparece. Sin bucles."
   },
   {
    "id": "banco-5.7",
    "tema": "Banco de ejercicios para el examen",
    "grupo": "Tema 5: Introducción a las funciones",
    "n": "5.7",
    "texto": "Palíndromo recursivo: crea la función recursiva EsPalindromoRecursivo, que reciba una cadena (sin espacios y en minúsculas) y devuelva true si se lee igual en los dos sentidos. Sin bucles ni arrays auxiliares."
   }
  ]
 },
 {
  "modulo": "Programación",
  "lenguaje": "csharp",
  "ejercicios": [
   {
    "id": "prog-4.1.1.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.1 Definición de un array y acceso a los datos",
    "n": "4.1.1.1",
    "texto": "Un programa que pida al usuario 4 números, los memorice (utilizando un array), calcule su media aritmética y después muestre en pantalla la media y los datos tecleados."
   },
   {
    "id": "prog-4.1.1.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.1 Definición de un array y acceso a los datos",
    "n": "4.1.1.2",
    "texto": "Un programa que pida al usuario 5 números reales (pista: necesitarás un array de \"float\") y luego los muestre en el orden contrario al que se introdujeron."
   },
   {
    "id": "prog-4.1.2.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.2 Valor inicial de un array",
    "n": "4.1.2.1",
    "texto": "Un programa que almacene en una tabla el número de días que tiene cada mes (supondremos que es un año no bisiesto), pida al usuario que le indique un mes (1=enero, 12=diciembre) y muestre en pantalla el número de días que tiene ese mes."
   },
   {
    "id": "prog-4.1.3.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.1",
    "texto": "Crea un programa que pida al usuario 6 números enteros cortos y luego los muestre en orden inverso (pista: usa un array para almacenarlos y \"for\" para mostrarlos)."
   },
   {
    "id": "prog-4.1.3.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.2",
    "texto": "Crea un programa que pregunte al usuario cuántos números enteros va a introducir (por ejemplo, 10), le pida todos esos números, los guarde en un array y finalmente calcule y muestre la media de esos números."
   },
   {
    "id": "prog-4.1.3.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.3",
    "texto": "Un programa que pida al usuario 10 reales de doble precisión, calcule su media y luego muestre los que están por encima de la media."
   },
   {
    "id": "prog-4.1.3.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.4",
    "texto": "Un programa que almacene en una tabla el número de días que tiene cada mes (de un año no bisiesto), pida al usuario que le indique un mes (ej. 2 para febrero) y un día (ej. el día 15) y diga qué número de día es dentro del año (por ejemplo, el 15 de febrero sería el día número 46, el 31 de diciembre sería el día 365)."
   },
   {
    "id": "prog-4.1.3.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.5",
    "texto": "A partir del ejercicio anterior, crea otro que pida al usuario que le indique la fecha, formada por día (1 al 31) y el mes (1=enero, 12=diciembre), y como respuesta muestre en pantalla el número de días que quedan hasta final de año."
   },
   {
    "id": "prog-4.1.3.6",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.6",
    "texto": "Un programa que pida 10 nombres y los memorice (pista: esta vez se trata de un array de \"string\"). Después deberá pedir que se teclee un nombre y dirá si se encuentra o no entre los 10 que se han tecleado antes. Volverá a pedir otro nombre y a decir si se encuentra entre ellos, y así sucesivamente hasta que se teclee \"fin\". En el siguiente apartado verás detalles de cómo hacer ese tipo de búsquedas."
   },
   {
    "id": "prog-4.1.3.7",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.7",
    "texto": "Un programa que prepare espacio para guardar un máximo de 100 nombres. El usuario deberá ir introduciendo un nombre cada vez, hasta que se pulse Intro sin teclear nada, momento en el que dejarán de pedirse más nombres y se mostrará en pantalla la lista de los nombres que se han introducido."
   },
   {
    "id": "prog-4.1.3.8",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.8",
    "texto": "Un programa que reserve espacio para un vector de 3 componentes, pida al usuario valores para dichas componentes (por ejemplo [2, -5, 7]) y muestre su módulo (la raíz cuadrada de la suma de sus componentes al cuadrado; por ejemplo, para [2, -5, 7] el resultado sería la raíz cuadrada de 78, aproximadamente 8,83)."
   },
   {
    "id": "prog-4.1.3.9",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.9",
    "texto": "Un programa que reserve espacio para dos vectores de 3 componentes, pida al usuario sus valores y calcule la suma de ambos vectores (su primera componente será x1+y1, la segunda será x2+y2 y así sucesivamente)."
   },
   {
    "id": "prog-4.1.3.10",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.10",
    "texto": "Un programa que reserve espacio para dos vectores de 3 componentes, pida al usuario sus valores y calcule su producto escalar (x1·y1+ x2·y2 + z1·z2)."
   },
   {
    "id": "prog-4.1.3.11",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.3 Recorriendo los elementos de una tabla",
    "n": "4.1.3.11",
    "texto": "Un programa que pida al usuario 4 números enteros y calcule (y muestre) cuál es el mayor de ellos. Nota: para calcular el mayor valor de un array, hay que comparar cada uno de los valores que tiene almacenados el array con el que hasta ese momento es el máximo provisional. El valor inicial de este máximo provisional no debería ser cero (porque el resultado sería incorrecto si todos los números son negativos), sino el primer elemento del array. Si no lo consigues, en el próximo apartado tienes más detalles sobre cómo resolver este problema."
   },
   {
    "id": "prog-4.1.4.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.4 Operaciones habituales con arrays: buscar, máximo, añadir, insertar, borrar",
    "n": "4.1.4.1",
    "texto": "Crea una variante del ejemplo 04_01_04a que pida al usuario el dato a buscar, avise si ese dato no aparece, y que diga cuántas veces se ha encontrado en caso contrario."
   },
   {
    "id": "prog-4.1.4.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.4 Operaciones habituales con arrays: buscar, máximo, añadir, insertar, borrar",
    "n": "4.1.4.2",
    "texto": "Crea una variante del ejemplo 04_01_04a que añada un dato introducido por el usuario al final de los datos existentes."
   },
   {
    "id": "prog-4.1.4.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.4 Operaciones habituales con arrays: buscar, máximo, añadir, insertar, borrar",
    "n": "4.1.4.3",
    "texto": "Crea una variante del ejemplo 04_01_04a que inserte un dato introducido por el usuario en la posición que elija el usuario. Debe avisar si la posición escogida es incorrecta (porque esté más allá del final de los datos)."
   },
   {
    "id": "prog-4.1.4.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.4 Operaciones habituales con arrays: buscar, máximo, añadir, insertar, borrar",
    "n": "4.1.4.4",
    "texto": "Crea una variante del ejemplo 04_01_04a que borre el dato que se encuentre en la posición que escoja el usuario. Debe avisar si la posición seleccionada no es válida."
   },
   {
    "id": "prog-4.1.4.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.4 Operaciones habituales con arrays: buscar, máximo, añadir, insertar, borrar",
    "n": "4.1.4.5",
    "texto": "Crea un programa que prepare espacio para un máximo de 10 nombres. Deberá mostrar al usuario un menú que le permita realizar las siguientes operaciones:\n• Añadir un dato al final de los ya existentes.\n• Insertar un dato en una cierta posición (como ya se ha comentado, los que queden detrás deberán desplazarse \"hacia el final\" para dejarle hueco); por ejemplo, si el array contiene \"hola\", \"adiós\" y se pide insertar \"bien\" en la segunda posición, el array pasará a contener \"hola\", \"bien\", \"adiós\".\n• Borrar el dato que hay en una cierta posición (como se ha visto, lo que estaban detrás deberán desplazarse \"hacia el principio\" para que no haya huecos); por ejemplo, si el array contiene \"hola\", \"bien\", \"adiós\" y se pide borrar el dato de la segunda posición, el array pasará a contener \"hola\", \"adiós\"\n• Mostrar los datos que contiene el array.\n• Salir del programa."
   },
   {
    "id": "prog-4.1.5.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.5 Constantes y tamaño del array",
    "n": "4.1.5.1",
    "texto": "Crea un programa que contenga un array con los nombres de los meses del año. El usuario podrá elegir entre verlos en orden natural (de Enero a Diciembre) o en orden inverso (de Diciembre a Enero). Usa constantes para el valor máximo del array en ambos recorridos."
   },
   {
    "id": "prog-4.1.5.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.1 Conceptos básicos sobre arrays o tablas · 4.1.5 Constantes y tamaño del array",
    "n": "4.1.5.2",
    "texto": "Crea una nueva versión del ejercicio 4.1.5.1, usando \".Length\" en vez de una constante."
   },
   {
    "id": "prog-4.2.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales",
    "n": "4.2.1",
    "texto": "Un programa que pida al usuario dos bloques de 10 números enteros (usando un array de dos dimensiones). Después deberá mostrar el mayor dato que se ha introducido en cada uno de ellos."
   },
   {
    "id": "prog-4.2.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales",
    "n": "4.2.2",
    "texto": "Un programa que pida al usuario dos bloques de 6 cadenas de texto. Después pedirá al usuario una nueva cadena y comprobará si aparece en alguno de los dos bloques de información anteriores."
   },
   {
    "id": "prog-4.2.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales",
    "n": "4.2.3",
    "texto": "Un programa que pregunte al usuario el tamaño que tendrán dos bloques de números enteros (por ejemplo, uno de 10 elementos y otro de 12). Luego pedirá los datos para ambos bloques de datos. Finalmente deberá mostrar el mayor dato que se ha introducido en cada uno de ellos."
   },
   {
    "id": "prog-4.2.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales · Si has estudiado álgebra matricial:",
    "n": "4.2.4",
    "texto": "Un programa que calcule el determinante de una matriz de 2x2."
   },
   {
    "id": "prog-4.2.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales · Si has estudiado álgebra matricial:",
    "n": "4.2.5",
    "texto": "Un programa que calcule el determinante de una matriz de 3x3."
   },
   {
    "id": "prog-4.2.6",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales · Si has estudiado álgebra matricial:",
    "n": "4.2.6",
    "texto": "Un programa que calcule si las filas de una matriz de 4x4 son linealmente dependientes."
   },
   {
    "id": "prog-4.2.7",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.2 Arrays bidimensionales · Si has estudiado álgebra matricial:",
    "n": "4.2.7",
    "texto": "Un programa que use matrices para resolver un sistema de ecuaciones lineales (por ejemplo, de 3 ecuaciones con 3 incógnitas) mediante el método de Gauss."
   },
   {
    "id": "prog-4.3.1.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.3 Estructuras o registros · 4.3.1 Definición y acceso a los datos",
    "n": "4.3.1.1",
    "texto": "Crea un \"struct\" que almacene datos de una canción en formato MP3: Artista, Título, Duración (en segundos), Tamaño del fichero (en KB). Un programa debe pedir los datos de una canción al usuario, almacenarlos en dicho \"struct\" y después mostrarlos en pantalla."
   },
   {
    "id": "prog-4.3.2.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.3 Estructuras o registros · 4.3.2 Arrays de structs",
    "n": "4.3.2.1",
    "texto": "Amplia el programa del ejercicio 4.3.1.1, para que almacene datos de hasta 100 canciones. Deberá tener un menú que permita al usuario realizar las opciones: añadir una nueva canción, mostrar el título de todas las canciones, buscar la canción que contenga un cierto texto (en el artista o en el título). Recuerda que el array estará sobredimensionado, así que deberás llevar un contador de la cantidad de datos que hay almacenados hasta el momento."
   },
   {
    "id": "prog-4.3.2.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.3 Estructuras o registros · 4.3.2 Arrays de structs",
    "n": "4.3.2.2",
    "texto": "Crea un programa que permita guardar datos de \"imágenes\" (ficheros de ordenador que contengan fotografías o cualquier otro tipo de información gráfica). De cada imagen se debe guardar: nombre (texto), ancho en píxeles (por ejemplo 2000), alto en píxeles (por ejemplo, 3000), tamaño en Kb (por ejemplo 145,6). El programa debe ser capaz de almacenar hasta 700 imágenes (deberá avisar cuando su capacidad esté llena). Debe permitir las opciones: añadir una ficha nueva, ver todas las fichas (número y nombre de cada imagen), buscar la ficha que tenga un cierto nombre (mostrando entonces todos sus datos)."
   },
   {
    "id": "prog-4.3.3.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.3 Estructuras o registros · 4.3.3 structs anidados",
    "n": "4.3.3.1",
    "texto": "Amplia el programa 4.3.2.1, para que el campo \"duración\" se almacene como minutos y segundos, usando un \"struct\" anidado que contenga a su vez estos dos campos."
   },
   {
    "id": "prog-4.4.1.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.1 Definición. Lectura desde teclado",
    "n": "4.4.1.1",
    "texto": "Crea un programa que te pida tu nombre y lo escriba 5 veces."
   },
   {
    "id": "prog-4.4.1.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.1 Definición. Lectura desde teclado",
    "n": "4.4.1.2",
    "texto": "Crea un programa que pida al usuario su nombre. Si se llama como tú (por ejemplo, \"Nacho\"), responderá \"Bienvenido, jefe\". En caso contrario, le saludará por su nombre."
   },
   {
    "id": "prog-4.4.1.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.1 Definición. Lectura desde teclado",
    "n": "4.4.1.3",
    "texto": "Un programa que pida tu nombre, tu día de nacimiento y tu mes de nacimiento y lo junte todo en una cadena, separando el nombre de la fecha por una coma, y el día y el mes por una barra inclinada, así: \"Juan, nacido el 31/12\"."
   },
   {
    "id": "prog-4.4.1.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.1 Definición. Lectura desde teclado",
    "n": "4.4.1.4",
    "texto": "Crea un programa que pida al usuario dos números enteros y después una operación que realizar con ellos. La operación podrá ser \"suma\", \"resta\", multiplicación\" y \"división\", que también se podrán escribir de forma abreviado con los operadores matemáticos \"+\", \"-\", \"*\" y \"/\". Para multiplicar también se podrá usar una \"x\", minúscula o mayúscula. A continuación se mostrará el resultado de esa operación (por ejemplo, si los números son 3 y 6 y la operación es \"suma\", el resultado sería 9). La operación debes tomarla como una cadena de texto y analizarla con un \"switch\"."
   },
   {
    "id": "prog-4.4.2.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.2 Cómo acceder a las letras que forman una cadena",
    "n": "4.4.2.1",
    "texto": "Crea un programa que pregunte al usuario su nombre y le responda cuál es su inicial."
   },
   {
    "id": "prog-4.4.3.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.3 Longitud de la cadena",
    "n": "4.4.3.1",
    "texto": "Un programa que te pida tu nombre y lo muestre en pantalla separando cada letra de la siguiente con un espacio. Por ejemplo, si tu nombre es \"Juan\", debería aparecer en pantalla \"J u a n\"."
   },
   {
    "id": "prog-4.4.3.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.3 Longitud de la cadena",
    "n": "4.4.3.2",
    "texto": "Un programa que pida una frase al usuario y la muestre en orden inverso (de la última letra a la primera)."
   },
   {
    "id": "prog-4.4.3.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.3 Longitud de la cadena",
    "n": "4.4.3.3",
    "texto": "Un programa que pida al usuario una frase, después una letra y finalmente diga si aparece esa letra como parte de esa frase o no."
   },
   {
    "id": "prog-4.4.3.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.3 Longitud de la cadena",
    "n": "4.4.3.4",
    "texto": "Un programa capaz de sumar dos números enteros muy grandes (por ejemplo, de 50 cifras), que se deberán pedir como cadena de texto y analizar letra a letra (pista: tendrás que pensar cómo sumas dos números a mano: qué ocurre si al suma cifra a cifra obtienes un número mayor que 10 y cómo tratar el caso de que los dos números no tengan la misma longitud)."
   },
   {
    "id": "prog-4.4.3.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.3 Longitud de la cadena",
    "n": "4.4.3.5",
    "texto": "Un programa capaz de multiplicar dos números enteros muy grandes (por ejemplo, de 50 cifras), que se deberán pedir como cadena de texto y analizar letra a letra (pista: nuevamente, deberás pensar cómo lo haces en papel: multiplicar cifra a cifra, desplazar cuando terminas una cifra... te ayudará también haber hecho el ejercicio anterior para poder sumar dos números grandes)."
   },
   {
    "id": "prog-4.4.4.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.4 Extraer una subcadena",
    "n": "4.4.4.1",
    "texto": "Un programa que te pida tu nombre y lo muestre en pantalla separando cada letra de la siguiente con un espacio, similar al 4.4.3.1, pero esta vez usando \"Substring\". Por ejemplo, si tu nombre es \"Juan\", debería aparecer en pantalla \"J u a n\"."
   },
   {
    "id": "prog-4.4.4.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.4 Extraer una subcadena",
    "n": "4.4.4.2",
    "texto": "Un programa que te pida tu nombre y lo muestre en pantalla como un triángulo creciente. Por ejemplo, si tu nombre es \"Juan\", debería aparecer en pantalla:",
    "ejemplo": "J\nJu\nJua\nJuan"
   },
   {
    "id": "prog-4.4.4.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.4 Extraer una subcadena",
    "n": "4.4.4.3",
    "texto": "Un programa que te pida tu nombre y lo muestre en pantalla como un triángulo creciente desde la derecha. Por ejemplo, si tu nombre es \"Juan\", debería aparecer en pantalla:",
    "ejemplo": "   n\n  an\n uan\nJuan"
   },
   {
    "id": "prog-4.4.5.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.5 Buscar en una cadena",
    "n": "4.4.5.1",
    "texto": "Un programa que pida al usuario 10 frases, las guarde en un array, y luego le pregunte textos de forma repetitiva, e indique si cada uno de esos textos aparece como parte de alguno de los elementos del array. Terminará cuando el texto introducido sea \"fin\"."
   },
   {
    "id": "prog-4.4.5.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.5 Buscar en una cadena",
    "n": "4.4.5.2",
    "texto": "Crea una versión del ejercicio 4.4.5.1 en la que, en caso de que alguno de los textos aparezca como subcadena, se informe además de si se encuentra exactamente al principio."
   },
   {
    "id": "prog-4.4.6.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.6 Otras manipulaciones de cadenas",
    "n": "4.4.6.1",
    "texto": "Una variante del ejercicio 4.4.5.1 (buscar textos en un array de frases), que no distinga entre mayúsculas y minúsculas a la hora de buscar."
   },
   {
    "id": "prog-4.4.6.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.6 Otras manipulaciones de cadenas",
    "n": "4.4.6.2",
    "texto": "Un programa que pida al usuario una frase y elimine todos los espacios redundantes que contenga (debe quedar sólo un espacio entre cada palabra y la siguiente)."
   },
   {
    "id": "prog-4.4.7.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.7 Descomponer una cadena en fragmentos",
    "n": "4.4.7.1",
    "texto": "Un programa que pida al usuario una frase y muestre sus palabras en orden inverso."
   },
   {
    "id": "prog-4.4.7.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.7 Descomponer una cadena en fragmentos",
    "n": "4.4.7.2",
    "texto": "Un programa que pida al usuario varios números separados por espacios y muestre su suma."
   },
   {
    "id": "prog-4.4.8.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.8 Comparación de cadenas",
    "n": "4.4.8.1",
    "texto": "Un programa que pida al usuario dos frases y diga cuál sería la \"mayor\" de ellas (la que aparecería en último lugar en un diccionario)."
   },
   {
    "id": "prog-4.4.8.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.8 Comparación de cadenas",
    "n": "4.4.8.2",
    "texto": "Un programa que pida al usuario cinco frases, las guarde en un array y muestre la \"mayor\" de ellas."
   },
   {
    "id": "prog-4.4.9.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.9 Una cadena modificable: StringBuilder",
    "n": "4.4.9.1",
    "texto": "Prepara un programa que pida una cadena al usuario y la modifique, de modo que todas las vocales se conviertan en \"o\"."
   },
   {
    "id": "prog-4.4.9.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.9 Una cadena modificable: StringBuilder",
    "n": "4.4.9.2",
    "texto": "Un programa que pida una cadena al usuario y la modifique, de modo que las letras de las posiciones impares (primera, tercera, etc.) estén en minúsculas y las de las posiciones pares estén en mayúsculas, mostrando el resultado en pantalla. Por ejemplo, a partir de un nombre como \"Nacho\", la cadena resultante sería \"nAcHo\"."
   },
   {
    "id": "prog-4.4.9.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.9 Una cadena modificable: StringBuilder",
    "n": "4.4.9.3",
    "texto": "Crea un juego del ahorcado, en el que un primer usuario introduzca la palabra a adivinar, se muestre ésta oculta con guiones (-----) y el programa acepte las letras que introduzca el segundo usuario, cambiando los guiones por letras correctas cada vez que acierte (por ejemplo, a---a-t-). La partida terminará cuando se acierte la palabra por completo o el usuario agote sus 8 intentos."
   },
   {
    "id": "prog-4.4.10.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.4 Cadenas de caracteres · 4.4.10 Cadenas repetitivas",
    "n": "4.4.10.1",
    "texto": "Crea un programa que pida al usuario una frase y la muestre subrayada, usando para ello una cadena formada por tantos guiones como letras tuviera la frase inicial."
   },
   {
    "id": "prog-4.5.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.5 Recorriendo arrays y cadenas con \"foreach\"",
    "n": "4.5.1",
    "texto": "Un programa que pida tu nombre y lo muestre con un espacio entre cada par de letras, usando \"foreach\"."
   },
   {
    "id": "prog-4.5.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.5 Recorriendo arrays y cadenas con \"foreach\"",
    "n": "4.5.2",
    "texto": "Un programa que pida al usuario una frase y la descomponga en subcadenas separadas por espacios, usando \"Split\". Luego debe mostrar cada subcadena en una línea nueva, usando \"foreach\"."
   },
   {
    "id": "prog-4.5.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.5 Recorriendo arrays y cadenas con \"foreach\"",
    "n": "4.5.3",
    "texto": "Un programa que pida al usuario varios números separados por espacios y muestre su suma (como el del ejercicio 4.4.7.2), empleando \"foreach\"."
   },
   {
    "id": "prog-4.6.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.1",
    "texto": "Un programa que pida el nombre, el apellido y la edad de una persona, los almacene en un \"struct\" y luego muestre los tres datos en una misma línea, separados por comas."
   },
   {
    "id": "prog-4.6.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.2",
    "texto": "Un programa que pida datos de 8 personas: nombre, día de nacimiento, mes de nacimiento, y año de nacimiento (que se deben almacenar en un array de structs). Después deberá repetir lo siguiente: preguntar un número de mes y mostrar en pantalla los datos de las personas que cumplan los años durante ese mes. Terminará de repetirse cuando se teclee 0 como número de mes."
   },
   {
    "id": "prog-4.6.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.3",
    "texto": "Un programa que sea capaz de almacenar los datos de 50 personas: nombre, dirección, teléfono, edad (usando una tabla de structs). Deberá ir pidiendo los datos uno por uno, hasta que un nombre se introduzca vacío (se pulse Intro sin teclear nada). Entonces deberá aparecer un menú que permita:\n• Mostrar la lista de todos los nombres.\n• Mostrar las personas de una cierta edad.\n• Mostrar las personas cuya inicial sea la que el usuario indique.\n• Salir del programa\n(lógicamente, este menú debe repetirse hasta que se escoja la opción de \"salir\")."
   },
   {
    "id": "prog-4.6.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.4",
    "texto": "Mejora la base de datos de ficheros (ejemplo 04_06a) para que no permita introducir tamaños incorrectos (números negativos) ni nombres de fichero vacíos."
   },
   {
    "id": "prog-4.6.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.5",
    "texto": "Amplía la base de datos de ficheros (ejemplo 04_06a) para que incluya una opción de búsqueda parcial, en la que el usuario indique parte del nombre y se muestre todos los ficheros que contienen ese fragmento (usando \"Contains\" o \"IndexOf\"). Esta búsqueda no debe distinguir mayúsculas y minúsculas (con la ayuda de ToUpper o ToLower, por ejemplo)."
   },
   {
    "id": "prog-4.6.6",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.6",
    "texto": "Amplía el ejercicio anterior (4.6.5) para añadir la posibilidad de que la búsqueda sea incremental: el usuario irá indicando letra a letra el texto que quiere buscar, y se mostrará todos los datos que lo contienen (por ejemplo, primero los que contienen \"j\", luego \"ju\", después \"jua\" y finalmente \"juan\")."
   },
   {
    "id": "prog-4.6.7",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.7",
    "texto": "Amplía la base de datos de ficheros (ejemplo 04_06a) para que se pueda borrar un cierto dato (habrá que \"mover hacia atrás\" todos los datos que había después de ese, y disminuir el contador de la cantidad de datos que tenemos)."
   },
   {
    "id": "prog-4.6.8",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.8",
    "texto": "Mejora la base de datos de ficheros (ejemplo 04_06a) para que se pueda modificar un cierto dato a partir de su número (por ejemplo, el dato número 3). En esa modificación, se deberá permitir al usuario pulsar Intro sin teclear nada, para indicar que no desea modificar un cierto dato, en vez de reemplazarlo por una cadena vacía."
   },
   {
    "id": "prog-4.6.9",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.6 Ejemplo completo",
    "n": "4.6.9",
    "texto": "Amplía la base de datos de ficheros (ejemplo 04_06a) para que se permita ordenar los datos por nombre. Para ello, deberás buscar información sobre algún método de ordenación sencillo, como el \"método de burbuja\" (en el siguiente apartado tienes algunos), y aplicarlo a este caso concreto."
   },
   {
    "id": "prog-4.7.1",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.7 Ordenaciones simples",
    "n": "4.7.1",
    "texto": "Un programa que pida al usuario 6 números en coma flotante y los muestre ordenados de menor a mayor. Escoge el método de ordenación que prefieras."
   },
   {
    "id": "prog-4.7.2",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.7 Ordenaciones simples",
    "n": "4.7.2",
    "texto": "Un programa que pida al usuario 5 nombres y los muestre ordenados alfabéticamente (recuerda que para comparar cadenas no podrás usar el símbolo \">\", sino \"CompareTo\")."
   },
   {
    "id": "prog-4.7.3",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.7 Ordenaciones simples",
    "n": "4.7.3",
    "texto": "Un programa que pida al usuario varios números, los vaya añadiendo a un array, mantenga el array ordenado continuamente y muestre el contenido tras añadir cada nuevo dato (todos los datos se mostrarán en la misma línea, separados por espacios en blanco). Terminará cuando el usuario teclee \"fin\" en vez de un numero."
   },
   {
    "id": "prog-4.7.4",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.7 Ordenaciones simples",
    "n": "4.7.4",
    "texto": "Amplía el ejercicio anterior, para añadir una segunda fase en la que el usuario pueda \"preguntar\" si un cierto valor está en el array. Como el array está ordenado, la búsqueda no se hará hasta el final de los datos, sino hasta que se encuentre el dato buscado o un dato mayor que él."
   },
   {
    "id": "prog-4.7.5",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.7 Ordenaciones simples",
    "n": "4.7.5",
    "texto": "Realiza una variante del ejercicio 4.7.4, que en vez de hacer una búsqueda lineal (desde el principio), use \"búsqueda binaria\": se comenzará a comparar con el punto medio del array; si nuestro dato es menor, se vuelve a probar en el punto medio de la mitad inferior del array, y así sucesivamente."
   },
   {
    "id": "prog-4.7.6",
    "tema": "Tema 4 · Arrays, estructuras y cadenas",
    "grupo": "4.7 Ordenaciones simples",
    "n": "4.7.6",
    "texto": "Crea una variante del ejercicio 4.7.3, pero usando esta vez Array.Sort para ordenar: un programa que pida al usuario varios números, los vaya añadiendo a un array, mantenga el array ordenado continuamente y muestre el resultado tras añadir cada nuevo dato (todos los datos se mostrarán en la misma línea, separados por espacios en blanco). Terminará cuando el usuario teclee \"fin\"."
   }
  ]
 }
];
