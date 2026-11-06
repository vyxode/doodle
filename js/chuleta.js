// Chuleta de Programación (C#), sacada solo de los temas del primer trimestre:
// diapositivas 01a-01c y 02a-02d de Nacho Iborra y los PDF tema03-tema05 de Nacho Cabanes (Aules).
// t: título · d: explicación (`código` entre comillas invertidas) · c: ejemplo
window.CHULETA = [
  { tema: 'Tema 1 · Primeros pasos', fichas: [
    { t: 'Estructura de un programa', d: 'El fichero fuente acaba en `.cs`. Se escribe, se compila y se ejecuta. Cada instrucción acaba en `;`. C# es de formato libre, pero mejor sangrar bien. Con `using System;` al principio no hace falta escribir `System.` delante de `Console` y `Convert`.', c: `using System;

class Saludo
{
    static void Main()
    {
        Console.WriteLine("Hola");
    }
}` },
    { t: 'Write y WriteLine', d: '`Console.WriteLine` escribe y salta de línea; `Console.Write` escribe sin saltar. `Console.WriteLine();` deja una línea en blanco.', c: `Console.Write("Hola");
Console.Write("¿Qué tal?");      // Hola¿Qué tal?
Console.WriteLine("Hola");       // y salta de línea` },
    { t: 'Mostrar texto y variables: + y {0}', d: 'Se puede unir con `+` o usar huecos `{0}`, `{1}`, `{2}`… que se rellenan con las variables en ese orden (el número indica qué variable va en cada hueco).', c: `int num1 = 3, num2 = 5, num3 = 8;
Console.WriteLine("El valor es " + num1);
Console.WriteLine("Los valores son {0}, {1} y {2}", num1, num2, num3);
Console.WriteLine("{0}, {2} y {1}", num1, num2, num3);   // 3, 8 y 5` },
    { t: 'Operadores aritméticos y prioridad', d: '`+` suma, `-` resta o cambio de signo, `*` multiplicación, `/` división, `%` resto. Orden: 1) paréntesis, 2) cambio de signo, 3) `*` `/` `%`, 4) `+` `-`. Los del mismo nivel, de izquierda a derecha.', c: `3 + 4 * 5        // 23
(20 + 5) % 6     // 1
28 % 5           // 3 (resto)
20 / 3           // 6: entre enteros la división es entera` },
    { t: 'Variables: declarar y asignar', d: 'Se indica el tipo y el nombre. Se puede dar valor al declarar o después con `=`, declarar varias del mismo tipo separadas por comas y usar el valor de otra variable o el suyo propio.', c: `int numero = 3, otroNumero;
otroNumero = numero + 1;
numero = numero * 3;` },
    { t: 'Nombres de variables', d: 'Letras, números y `_`. Solo pueden empezar por letra o `_`. Distingue mayúsculas y minúsculas. Evita tildes y eñes. Válidos: `numero`, `_nombre_usuario`, `nombreUsuario`, `Valor1`. No válidos: `1numero`, `Año1`, `otro numero`.' },
    { t: 'Comentarios', d: '`//` comenta hasta el final de la línea; `/* … */` puede ocupar varias líneas. El compilador los ignora.', c: `/* Programa que calcula la
   suma de dos números */
// Declaramos las variables
int num1 = 3, num2 = 5;` },
    { t: 'Pedir datos al usuario', d: '`Console.ReadLine()` devuelve siempre texto: para usarlo como número hay que convertirlo, por ejemplo con `Convert.ToInt32`.', c: `Console.WriteLine("Escribe un número entero:");
int numero = Convert.ToInt32(Console.ReadLine());
Console.WriteLine("Has escrito {0}", numero);` },
    { t: 'Compilado, interpretado, máquina virtual', d: 'Compiladores (C, C++): generan un ejecutable en código máquina; más eficiente, pero depende de la plataforma. Intérpretes (Python, PHP, JavaScript): traducen al vuelo; independientes de la plataforma, menos eficientes y necesitan el código fuente. Máquinas virtuales (Java con la JVM, C# con .NET): traducen a un lenguaje intermedio; independientes de la plataforma si tiene la máquina virtual. Alto nivel = cercano al humano; bajo nivel (ensamblador) = cercano al ordenador.' },
    { t: 'Visual Studio y Geany', d: 'Visual Studio: proyecto «Aplicación de consola», marcar «No usar instrucciones de nivel superior» para que cree el `Main`; se edita `Program.cs` y se ejecuta con `F5` o `Ctrl + F5`. Geany: usa un compilador externo (`csc` de .NET o Mono); en Linux y Mac se ejecuta con `mono`.' },
  ] },
  { tema: 'Tema 2 · Estructuras de control', fichas: [
    { t: 'Operadores relacionales', d: '`>` `<` `>=` `<=` `==` (igual) `!=` (distinto). Devuelven verdadero o falso. Ojo: para comparar se usa `==`, no `=`.', c: `7 > 3     // true
8 <= 5    // false
9 != 9    // false` },
    { t: 'if / else', d: 'Si solo hay una instrucción se pueden quitar las llaves, pero es mejor ponerlas.', c: `if (n < 0)
{
    Console.WriteLine("Negativo");
}
else
{
    Console.WriteLine("Cero o positivo");
}` },
    { t: 'else if (varias condiciones)', d: 'Mejor alinear los `else if` que anidar bloques dentro de bloques (la «pirámide de la perdición»).', c: `if (n > 10)
    Console.WriteLine("Es mayor que 10");
else if (n > 5)
    Console.WriteLine("Es mayor que 5");
else
    Console.WriteLine("Es 5 o menos");` },
    { t: 'Operadores lógicos: && || !', d: '`&&` (Y): verdadero solo si las dos lo son. `||` (O): verdadero si alguna lo es. `!` invierte. Orden: paréntesis, `!`, `&&`, `||`. Cortocircuito: en `&&`, si la primera es falsa no se mira la segunda; en `||`, si la primera es verdadera tampoco.', c: `if (n >= 2 && n <= 10)
    Console.WriteLine("Está entre 2 y 10");
if (!(9 < 8))
    Console.WriteLine("Esto sí se ejecuta");` },
    { t: 'Operador condicional ?: (ternario)', d: '`condicion ? valorSiVerdadero : valorSiFalso`. Sirve para dar un valor según una condición.', c: `a = (b % 2 == 0) ? 0 : 1;
// Equivale a:
if (b % 2 == 0) a = 0;
else a = 1;` },
    { t: 'switch', d: 'Para varios valores concretos de una variable. Cada `case` acaba en `break`. `default` recoge el resto (no es obligatorio). Varios casos que hacen lo mismo se ponen seguidos y vacíos; también existe `goto case`.', c: `switch (numero)
{
    case 0:
    case 2:
    case 4:
        Console.WriteLine("Es par");
        break;
    case 1: goto case 3;
    case 3:
        Console.WriteLine("Es impar");
        break;
    default:
        Console.WriteLine("Otro");
        break;
}` },
    { t: 'while', d: 'Repite mientras se cumpla la condición. Puede no ejecutarse nunca.', c: `Console.WriteLine("Escribe un número:");
int numero = Convert.ToInt32(Console.ReadLine());
while (numero != 0)
{
    Console.WriteLine("Escribe un número:");
    numero = Convert.ToInt32(Console.ReadLine());
}` },
    { t: 'do … while', d: 'Comprueba la condición al final: se ejecuta al menos una vez. Típico para pedir algo «hasta que…». Ojo al `;` después del `while`.', c: `int numero;
do
{
    Console.WriteLine("Escribe un número:");
    numero = Convert.ToInt32(Console.ReadLine());
}
while (numero != 0);` },
    { t: 'for', d: '`for (inicio; condición; incremento)`. Si el contador se declara dentro del `for`, solo existe en el bucle. Se puede recorrer letras y usar comas para varios contadores.', c: `for (int i = 1; i <= 10; i++)
    Console.WriteLine(i);

for (char letra = 'a'; letra <= 'z'; letra++)
    Console.Write("{0} ", letra);

for (i = 0, j = 1; i <= 5 && j <= 30; i++, j += 2)
    Console.WriteLine("i vale {0} y j vale {1}", i, j);` },
    { t: '¿Qué bucle uso?', d: '`for` cuando sabes de antemano cuántas vueltas. `while` y `do…while` cuando no; `do…while` si va a haber al menos una vuelta. Un `for` se puede pasar a `while`: el contador fuera, la condición en el `while` y el incremento dentro.', c: `for (int n = 1; n <= 10; n++)
    Console.WriteLine(n);

int n = 1;
while (n <= 10)
{
    Console.WriteLine(n);
    n++;
}` },
    { t: 'Bucles anidados', d: 'Un bucle dentro de otro: por cada vuelta del de fuera, el de dentro da todas las suyas.', c: `for (int i = 1; i <= 5; i++)
    for (int j = 0; j <= 10; j++)
        Console.WriteLine("{0} x {1} = {2}", i, j, i * j);` },
    { t: 'Bucles infinitos', d: 'Su condición siempre se cumple. Se usan en programas que terminan por un evento externo (juegos, monitorización).', c: `while (1 == 1) { … }
for (;;) { … }` },
    { t: 'break, continue y goto', d: '`break` sale del bucle; `continue` salta a la siguiente vuelta; `goto` salta a una etiqueta. Los tres están desaconsejados (salvo `goto case` en un `switch`): mejor una condición bien puesta.', c: `// En vez de break: condición en el while
int n = 105;
while (n % 13 != 0)
{
    Console.WriteLine(n);
    n++;
}
// En vez de continue: un if
for (int n = 1; n <= 10; n++)
    if (n != 5) Console.WriteLine(n);` },
    { t: 'foreach', d: 'Recorre todos los elementos de una colección, por ejemplo cada letra de un texto.', c: `string nombre = Console.ReadLine();
foreach (char letra in nombre)
    Console.WriteLine(letra);` },
    { t: 'try / catch (excepciones)', d: 'El código que puede fallar va en `try`; el error se captura en `catch`. Puede haber un `catch` por tipo de error. `e.Message` da el mensaje. Lo que va después del `try-catch` se ejecuta falle o no.', c: `try
{
    int dividendo = Convert.ToInt32(Console.ReadLine());
    int divisor = Convert.ToInt32(Console.ReadLine());
    Console.WriteLine("La división es: {0}", dividendo / divisor);
}
catch (FormatException e)
{
    Console.WriteLine("Error al introducir los números");
    Console.WriteLine(e.Message);
}
catch (DivideByZeroException e)
{
    Console.WriteLine("Error de división por cero");
}
catch (Exception e)    // cualquier otro error
{
    Console.WriteLine(e.Message);
}` },
    { t: 'Depurador de Visual Studio', d: '`F11` ejecuta paso a paso (abajo se ven los valores de las variables). `F9` pone un punto de interrupción; con `F5` se llega hasta él y luego se sigue con `F11`.' },
  ] },
  { tema: 'Tema 3 · Tipos de datos básicos', fichas: [
    { t: 'Tipos enteros', d: '`sbyte` (1 byte, -128 a 127) · `byte` (1, 0 a 255) · `short` (2, -32768 a 32767) · `ushort` (2, 0 a 65535) · `int` (4, unos ±2.147 millones) · `uint` (4, 0 a 4.294 millones) · `long` (8, unos ±9·10¹⁸) · `ulong` (8). La «u» es sin signo.', c: `byte edad = 74;
ushort anyo = 2001;
long resultado = 10000000000;` },
    { t: 'Convertir texto a otros enteros', d: '`Convert.ToByte` / `ToSByte` (1 byte), `ToInt16` / `ToUInt16` (short), `ToInt32` / `ToUInt32` (int), `ToInt64` / `ToUInt64` (long).', c: `byte edad = Convert.ToByte("74");
ushort anyo = Convert.ToUInt16("2001");
long resultado = Convert.ToInt64(Console.ReadLine());` },
    { t: '++ y -- (pre y post)', d: '`a++` es `a = a + 1`. En una asignación: `b = a++` da a `b` el valor antiguo y luego incrementa; `b = ++a` incrementa primero.', c: `int a = 2;
int b = a++;    // b = 2, a = 3
int c = ++a;    // a = 4, c = 4` },
    { t: 'Operaciones abreviadas y asignación múltiple', d: '`a += b` es `a = a + b`; igual con `-=`, `*=`, `/=`, `%=` (y `<<=`, `&=`, `|=`). Se puede dar el mismo valor a varias variables a la vez.', c: `n *= 2;          // n = n * 2
n /= 3;          // n = n / 3
a = b = c = 4;` },
    { t: 'Operaciones con bits', d: '`~` complemento (not) · `&` and · `|` or · `^` xor · `<<` desplaza a la izquierda (multiplica por 2) · `>>` desplaza a la derecha (divide entre 2).', c: `int a = 67, b = 33;
Console.WriteLine(a & b);    // 1
Console.WriteLine(a | b);    // 99
Console.WriteLine(a ^ b);    // 98
Console.WriteLine(a << 1);   // 134` },
    { t: 'Números reales: float, double, decimal', d: '`float` (32 bits, unas 7 cifras), `double` (64 bits, 15-16 cifras), `decimal` (128 bits, 28-29 cifras). En el código el decimal se escribe con punto. Un `float` con decimales lleva el sufijo `f`.', c: `float f1 = 2.5f, f2 = 3.06f;
double d = 2.5;
float pi = (float) 3.141592654;` },
    { t: 'Trampa: la división entera', d: 'Si los dos operandos son enteros, el resultado es entero aunque se guarde en un `float` o `double`. Al menos uno tiene que ser real.', c: `int i1 = 2, i2 = 3;
float r = i1 / i2;          // 0
float f1 = 2, f2 = 3;
float r2 = f1 / f2;         // 0,6666667` },
    { t: 'No compares reales con ==', d: 'Por la precisión limitada, en vez de `1` puede salir `0.999999`. Mejor comprobar si está dentro de un margen.', c: `if ((x > 0.9999) && (x < 1.0001))
    Console.WriteLine("Vale 1");` },
    { t: 'Pedir números reales', d: '`Convert.ToDouble` (double), `Convert.ToSingle` (float), `Convert.ToDecimal` (decimal). Al teclear, en un Windows en español los decimales se escriben con coma (`23,6`); el punto se ignora.', c: `double radio = Convert.ToDouble(Console.ReadLine());
float n = Convert.ToSingle(Console.ReadLine());` },
    { t: 'Convertir entre tipos (typecast)', d: 'Con `Convert` o forzando el tipo entre paréntesis (más rápido, solo entre tipos parecidos, como números). Pasar un real a `int` con `(int)` se queda con la parte entera.', c: `double longitud = 14.738;
float simple = (float) longitud;
int entera = (int) longitud;            // 14
int x = Convert.ToInt32(y);` },
    { t: 'Formatear números: ToString', d: '`0`: cifra obligatoria (pone 0 si no hay). `#`: cifra opcional. `.`: dónde va la coma decimal. `N2`: dos decimales. Si pides menos decimales, redondea.', c: `double numero = 12.34;
numero.ToString("N1")     // 12,3
numero.ToString("0.000")  // 12,340
numero.ToString("#.###")  // 12,34
suma.ToString("0.00")     // siempre 2 decimales` },
    { t: 'Cambios de base (binario, hexadecimal)', d: 'A otra base: `Convert.ToString(n, base)` o `n.ToString("x")` / `"X"` para hexadecimal. Desde otra base: `Convert.ToInt32(texto, base)`. En el código: `0x` hexadecimal, `0b` binario (C# 7) y `_` como separador. Un número que empieza por 0 no es octal en C#.', c: `Convert.ToString(247, 16)          // "f7"
Convert.ToString(247, 2)           // "11110111"
Convert.ToInt32("1a", 16)          // 26
Convert.ToInt32("11001001", 2)     // 201
int n1 = 0x13;                     // 19
int cincoMillones = 5_000_000;` },
    { t: 'Funciones matemáticas (Math)', d: 'Van precedidas de `Math.`: `Sqrt(x)` raíz, `Pow(x, y)` potencia, `Abs(x)` valor absoluto, `Round(x, cifras)` redondear, `Floor(x)` entero inferior, `Ceiling(x)` entero superior, `Exp`, `Log`, `Log10`, `Sin`, `Cos`, `Tan`, `Asin`, `Acos`, `Atan`, `Atan2`… Constantes `Math.PI` y `Math.E`. Reciben `double`; los ángulos, en radianes (180° = PI).', c: `double x = Math.Sqrt(4);           // 2
double y = Math.Pow(2, 3);         // 8
double rad = 45 * Math.PI / 180.0;
Console.WriteLine(Math.Cos(rad));` },
    { t: 'char (un carácter)', d: 'Una sola letra, entre comillas simples. Para leerla: `Convert.ToChar`.', c: `char letra = 'a';
letra = Convert.ToChar(Console.ReadLine());
bool esCifra = (letra >= '0') && (letra <= '9');` },
    { t: 'Secuencias de escape y @', d: '`\\n` nueva línea · `\\t` tabulador · `\\"` comilla doble · `\\\'` comilla simple · `\\\\` barra invertida · `\\r` retorno de carro · `\\a` pitido · `\\b` retroceso · `\\0` nulo. Con `@` delante del texto no hace falta duplicar las barras; las comillas se duplican.', c: `Console.WriteLine("Comillas: \\", barra \\\\");
string ruta = @"c:\\datos\\ejemplos";
string orden = @"copy ""documento"" f:";` },
    { t: 'string (texto) básico', d: 'Comillas dobles. `ReadLine` no necesita conversión. Se comparan con `==` y `!=`.', c: `string frase = Console.ReadLine();
if (frase == "Hola!")
    Console.WriteLine("Hola a ti también!");` },
    { t: 'bool', d: 'Vale `true` o `false`. Se le puede asignar directamente el resultado de una comparación. Ayuda a escribir condiciones claras (y es la alternativa natural a los `break`).', c: `bool partidaTerminada = vidas == 0;
bool esVocal = (letra == 'a') || (letra == 'e') || (letra == 'i')
    || (letra == 'o') || (letra == 'u');
if (partidaTerminada) …` },
    { t: 'const (constantes)', d: 'Un valor que no puede cambiar. Por convenio, en mayúsculas.', c: `const double PI = 3.1415926535;
const int MAXIMO = 5;` },
    { t: 'enum (enumeraciones)', d: 'Constantes enteras consecutivas: la primera vale 0 y las demás van sumando 1 (puedes dar valor a cualquiera). Se declaran fuera de `Main` y se usan con el nombre delante.', c: `enum diasSemana { LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO };
// dentro de Main:
Console.WriteLine((int) diasSemana.MIERCOLES);   // 2

enum dias { LUNES = 1, MARTES, JUEVES = 6, VIERNES }   // 1, 2, 6, 7` },
    { t: 'var (tipo implícito)', d: 'El compilador deduce el tipo. `GetType()` dice qué tipo es. Ojo: en los ejercicios de clase no se permite usar `var` salvo que se diga expresamente.', c: `var n = 5;              // int
var pi = 3.1416;        // double
Console.WriteLine(n.GetType());` },
  ] },
  { tema: 'Tema 4 · Arrays, structs y cadenas', fichas: [
    { t: 'Arrays: declarar y acceder', d: 'Todos los elementos del mismo tipo. Se numeran desde 0: un array de 4 va de `[0]` a `[3]`. Con `new` los valores empiezan a 0 (o texto vacío).', c: `int[] datos = new int[4];
datos[0] = 15;
int[] numeros = {200, 150, 100, -50, 300};
int[] otros = new int[5] {200, 150, 100, -50, 300};` },
    { t: 'Recorrer un array: for y Length', d: '`.Length` es el tamaño. Se recorre de 0 a `Length - 1` (`i < Length`).', c: `int suma = 0;
for (int i = 0; i < numeros.Length; i++)
{
    Console.Write("Dato {0}: ", i + 1);
    numeros[i] = Convert.ToInt32(Console.ReadLine());
    suma += numeros[i];
}` },
    { t: 'Buscar un dato', d: 'Se parte de que NO está y solo se cambia si aparece. Error típico: poner un `else encontrado = false` dentro del bucle (solo diría si está en la última posición). Para saber cuántas veces aparece, usa un contador.', c: `bool encontrado = false;
for (int i = 0; i < cantidad; i++)
    if (datos[i] == 15)
        encontrado = true;

int veces = 0;
for (int i = 0; i < cantidad; i++)
    if (datos[i] == 12) veces++;` },
    { t: 'Máximo y mínimo', d: 'El valor provisional es el PRIMER dato, no 0 (con 0 falla si todos son negativos).', c: `int maximo = datos[0];
for (int i = 1; i < cantidad; i++)
    if (datos[i] > maximo)
        maximo = datos[i];` },
    { t: 'Añadir, insertar y borrar (array sobredimensionado)', d: 'Se reserva más espacio del que se usa y se lleva un contador `cantidad`. Para insertar se desplaza hacia la derecha empezando por el final; para borrar, hacia la izquierda. Usa una constante para la capacidad.', c: `// Añadir al final
if (cantidad < capacidad)
{
    datos[cantidad] = 6;
    cantidad++;
}
// Insertar en una posición
for (int i = cantidad; i > posicion; i--)
    datos[i] = datos[i - 1];
datos[posicion] = 30;
cantidad++;
// Borrar una posición
for (int i = posicion; i < cantidad - 1; i++)
    datos[i] = datos[i + 1];
cantidad--;` },
    { t: 'Arrays de dos dimensiones [,]', d: 'Rectangulares: `[filas, columnas]`. `GetLength(0)` son las filas y `GetLength(1)` las columnas.', c: `int[,] notas = new int[2, 2];
notas[0, 1] = 2;
int[,] m = {
    {1, 2, 3},
    {4, 5, 6}
};
for (int i = 0; i < m.GetLength(0); i++)
{
    for (int j = 0; j < m.GetLength(1); j++)
        Console.Write("{0} ", m[i, j]);
    Console.WriteLine();
}` },
    { t: 'Arrays de arrays [][]', d: 'Cada fila es un array y puede tener distinto tamaño. Se usa `.Length` en cada nivel.', c: `int[][] notas = new int[3][];
notas[0] = new int[10];
notas[1] = new int[15];
notas[2] = new int[12];
for (int i = 0; i < notas.Length; i++)
    for (int j = 0; j < notas[i].Length; j++)
        notas[i][j] = i + j;` },
    { t: 'struct (registros)', d: 'Agrupa datos de distinto tipo (campos). Se declara fuera de `Main`, con `public` delante de cada campo. Se accede con un punto. Puede ir dentro de un array y un campo puede ser otro struct (anidado).', c: `struct tipoPersona
{
    public string nombre;
    public int edad;
    public float nota;
}
// dentro de Main:
tipoPersona[] personas = new tipoPersona[100];
personas[0].nombre = "Juan";
personas[0].edad = 20;
personas[0].nota = 7.5f;` },
    { t: 'Menú con do-while y switch', d: 'El patrón del ejemplo completo del tema: un array sobredimensionado de structs, un contador y un menú que se repite hasta elegir «Salir».', c: `int opcion;
do
{
    Console.WriteLine("1.- Añadir");
    Console.WriteLine("2.- Mostrar todos");
    Console.WriteLine("5.- Salir");
    opcion = Convert.ToInt32(Console.ReadLine());
    switch (opcion)
    {
        case 1:
            if (numeroFichas < 1000)
            {
                fichas[numeroFichas].nombre = Console.ReadLine();
                numeroFichas++;
            }
            else Console.WriteLine("Máximo alcanzado");
            break;
        case 2:
            for (int i = 0; i < numeroFichas; i++)
                Console.WriteLine(fichas[i].nombre);
            break;
        case 5: Console.WriteLine("Fin"); break;
        default: Console.WriteLine("Opción desconocida"); break;
    }
}
while (opcion != 5);` },
    { t: 'Cadenas: letras y longitud', d: '`texto[i]` da la letra de la posición `i` (desde 0), pero no se puede cambiar (`texto[0] = \'a\'` no vale). `.Length` es el número de letras.', c: `string saludo = "Hola";
Console.WriteLine(saludo[2]);          // l
for (int i = 0; i < saludo.Length; i++)
    Console.WriteLine(saludo[i]);` },
    { t: 'Substring', d: '`Substring(inicio, cantidad)` devuelve un trozo. Sin el segundo número, hasta el final.', c: `"Hola".Substring(1, 3)     // "ola"
frase.Substring(0, 4)      // las 4 primeras letras
frase.Substring(5)         // desde la posición 5 al final` },
    { t: 'Buscar en cadenas: IndexOf, LastIndexOf, Contains', d: '`IndexOf` da la posición (o -1 si no está); admite desde dónde buscar y cuántas letras mirar. `LastIndexOf` busca la última aparición. `Contains` solo dice si está.', c: `if (nombre.IndexOf("Juan") >= 0) …
nombre.IndexOf("Juan", 5)       // buscando desde la posición 5
ejemplo.LastIndexOf("a")
if (nombre.Contains("Juan")) …` },
    { t: 'ToUpper, ToLower, Insert, Remove, Replace', d: 'Las cadenas no se modifican: estos métodos devuelven una cadena nueva. `Replace` cambia todas las apariciones.', c: `nombre.ToUpper()                 // MAYÚSCULAS
nombre.ToLower()                 // minúsculas
nombre.Insert(0, "Don ")         // inserta en la posición 0
nombreCompleto.Remove(0, 6)      // quita 6 letras desde la 0
nombre.Replace("Pepe", "Jose")` },
    { t: 'Split y String.Join', d: '`Split` parte en un array de cadenas por un separador (o varios en un `char[]`; sin parámetros, por espacios). `String.Join` hace lo contrario.', c: `string[] partes = "uno dos tres".Split(' ');
char[] delimitadores = {',', '.'};
string[] otras = "uno,dos.tres".Split(delimitadores);
string[] palabras = frase.Split();
Console.WriteLine(String.Join("-", partes));   // uno-dos-tres` },
    { t: 'Comparar cadenas: CompareTo', d: 'El `>` no sirve con cadenas. `a.CompareTo(b)` da mayor que 0 si `a` va después en el diccionario, menor que 0 si va antes y 0 si son iguales. Distingue mayúsculas (las mayúsculas cuentan como «mayores»). Para ignorarlas: `String.Compare(a, b, true)`.', c: `if (frase.CompareTo("hola") > 0)
    Console.WriteLine("Va después de hola");
if (String.Compare(frase, "hola", true) == 0)
    Console.WriteLine("Es hola (mays o mins)");` },
    { t: 'StringBuilder y cadenas repetidas', d: '`StringBuilder` sí se puede cambiar letra a letra (necesita `using System.Text;`). `new String(letra, veces)` repite un carácter.', c: `using System.Text;
…
StringBuilder cadena = new StringBuilder("Hola");
cadena[0] = 'M';
string normal = cadena.ToString();       // "Mola"

string asteriscos = new String('*', 10);` },
    { t: 'foreach con arrays y cadenas', d: '`foreach (tipo variable in conjunto)`: recorre todos los elementos sin saber la posición. También vale para arrays de dos dimensiones.', c: `int[] diasMes = {31, 28, 31};
foreach (int dias in diasMes)
    Console.WriteLine(dias);
foreach (char letra in "Hola")
    Console.Write("{0}-", letra);` },
    { t: 'Ordenar: burbuja', d: 'Compara cada pareja y la intercambia si está desordenada. Hace unas n² comparaciones.', c: `for (int i = 0; i < n - 1; i++)
    for (int j = i + 1; j < n; j++)
        if (datos[i] > datos[j])
        {
            int temporal = datos[i];
            datos[i] = datos[j];
            datos[j] = temporal;
        }` },
    { t: 'Ordenar: selección directa', d: 'En cada pasada busca el menor y lo intercambia al final de la pasada.', c: `for (int i = 0; i < n - 1; i++)
{
    int menor = i;
    for (int j = i + 1; j < n; j++)
        if (datos[j] < datos[menor])
            menor = j;
    if (i != menor)
    {
        int temporal = datos[i];
        datos[i] = datos[menor];
        datos[menor] = temporal;
    }
}` },
    { t: 'Ordenar: inserción directa', d: 'Compara cada elemento con los anteriores (ya ordenados) y lo desplaza hasta su sitio.', c: `for (int i = 1; i < n; i++)
{
    int j = i - 1;
    while ((j >= 0) && (datos[j] > datos[j + 1]))
    {
        int temporal = datos[j];
        datos[j] = datos[j + 1];
        datos[j + 1] = temporal;
        j--;
    }
}` },
    { t: 'Array.Sort', d: 'Ordena un array de una vez. En clase se piden también los métodos a mano. Para cadenas en un método a mano, compara con `CompareTo`.', c: `int[] datos = {5, 3, 14, 20, 8, 9, 1};
Array.Sort(datos);` },
    { t: 'Búsqueda binaria', d: 'Solo con datos ordenados: mira el centro y sigue por la mitad donde puede estar. Con 1.000 datos, 10 comparaciones o menos. En el ejemplo del tema los datos se generan al azar con `Random`.', c: `Random r = new Random();
datos[i] = r.Next(1, 2000);       // número al azar entre 1 y 1999

int inferior = 0, superior = n - 1;
bool terminado = false;
while (!terminado)
{
    int medio = inferior + (superior - inferior) / 2;
    if (datos[medio] == buscado)
    { Console.WriteLine("Encontrado"); terminado = true; }
    else if (inferior == superior - 1)
    { Console.WriteLine("No encontrado"); terminado = true; }
    if (datos[medio] < buscado) inferior = medio;
    else superior = medio;
}` },
  ] },
  { tema: 'Tema 5 · Funciones', fichas: [
    { t: 'Crear y llamar una función', d: 'Va dentro de la `class`, junto a `Main`, con `static`. `void` = no devuelve nada. Convenio: nombre con verbo y empezando en mayúscula. En C# da igual si está antes o después de `Main`.', c: `class Ejemplo
{
    static void Saludar()
    {
        Console.WriteLine("Bienvenido");
    }

    static void Main()
    {
        Saludar();
    }
}` },
    { t: 'Parámetros', d: 'Entre paréntesis, separados por comas, cada uno con su tipo (aunque sean del mismo tipo).', c: `static void EscribirSuma(int a, int b)
{
    Console.Write(a + b);
}
// llamada:
EscribirSuma(4, 7);
EscribirNumeroReal(2.3f);     // si espera un float, el sufijo f` },
    { t: 'Devolver un valor: return', d: 'En vez de `void` se pone el tipo que devuelve. En cuanto llega a un `return`, sale de la función (lo de después es «código inalcanzable»). Mejor un solo `return` en funciones largas.', c: `static int Cuadrado(int n)
{
    return n * n;
}

static float Mayor(float n1, float n2)
{
    float mayor = n1;
    if (n2 > n1) mayor = n2;
    return mayor;
}
// uso:
int resultado = Cuadrado(5);` },
    { t: 'Variables locales y globales', d: 'Las declaradas dentro de una función solo existen en ella (locales). Las globales van fuera de las funciones, con `static`. Mejor que todo sean locales y pasar datos con parámetros y `return`. Dos locales con el mismo nombre en funciones distintas son variables distintas. Ojo: `base` es palabra reservada.', c: `static int contador = 0;       // global

static int Potencia(int nBase, int nExponente)
{
    int temporal = 1;           // local
    for (int i = 1; i <= nExponente; i++)
        temporal *= nBase;
    return temporal;
}` },
    { t: 'Paso por valor y por referencia (ref)', d: 'Por defecto la función recibe una COPIA: si la cambia, fuera no se nota. Con `ref` (en la declaración y en la llamada) los cambios se conservan. Sirve para «devolver» varios datos.', c: `static void Duplicar(ref int x)
{
    x = x * 2;
}
// uso:
int n = 5;
Duplicar(ref n);       // ahora n vale 10` },
    { t: 'Parámetros de salida (out)', d: 'Como `ref`, pero la variable no necesita valor antes de la llamada; la función tiene que darle valor. En C# reciente se puede declarar en la propia llamada.', c: `static void DosPrimeras(string cadena, out char l1, out char l2)
{
    l1 = cadena[0];
    l2 = cadena[1];
}
// uso:
char letra1, letra2;
DosPrimeras("Nacho", out letra1, out letra2);
DosPrimeras("Nacho", out char a, out char b);   // VS 2017 o posterior` },
    { t: 'TryParse (pedir números sin try-catch)', d: 'Devuelve `true` si el texto era un número válido y deja el valor en la variable `out`. Encaja bien en un `do-while`.', c: `int a;
if (Int32.TryParse(Console.ReadLine(), out a))
    Console.WriteLine("Su valor es {0}", a);
else
    Console.WriteLine("No es un número válido");` },
    { t: 'Recursividad', d: 'Una función que se llama a sí misma con un caso más sencillo. Imprescindible el caso base para que termine.', c: `static long Factorial(int n)
{
    if (n == 1)          // caso base
        return 1;
    return n * Factorial(n - 1);
}` },
    { t: 'Main con parámetros y código de salida', d: '`string[] args` recibe lo que se escribe tras el nombre del programa en la línea de comandos. `Environment.Exit(código)` termina el programa (0 = sin errores). También se puede declarar `static int Main` y devolver el código con `return`.', c: `static int Main(string[] args)
{
    for (int i = 0; i < args.Length; i++)
        Console.WriteLine("Parámetro {0}: {1}", i, args[i]);
    if (args.Length == 0)
        return 1;
    return 0;
}` },
    { t: 'Parámetros por defecto y con nombre', d: 'Un parámetro con valor por defecto se puede omitir en la llamada (tienen que ir los últimos). Con nombre se pueden pasar en otro orden.', c: `static string Linea(int veces, char letra = '*')
{
    return new string(letra, veces);
}
Linea(12)                       // ************
Linea(10, '-')
Linea(letra: '=', veces: 8)` },
  ] },
];
