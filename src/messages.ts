export = {

    regionals: [
        "🇦","🇧","🇨","🇩","🇪","🇫","🇬","🇭","🇮","🇯","🇰","🇱","🇲","🇳","🇴","🇵","🇶","🇷","🇸","🇹","🇺","🇻","🇼","🇽","🇾","🇿"
    ],

    reactions: [
        "💯", "😊", "❤", "✅", "🔥", "👌", "🤣", "⭐", "👍", "😎", "😍", "🤘", "👀", "🤙", "💪", "🤑", "🤔", "🤗", "😄",
    ],

    rejections: [
        "Naa",
        "No quiero",
        "NO",
        "Ni ganas bro",
        "Soy tu esclavo?",
        "Te creés crack?",
        "Nop.",
        "Dato",
        "Contame otro chiste",
        "Nope",
        "Nej",
        "No molestes"
    ],

    games: [
        "`connect4`: Cuatro en línea",
    ],

    old: [
        "**__Momo 2.0:__**",
        "",
        "__Reforma económica:__",
        " - Los usuarios con pocas cartas tienen ligeramente más chances de rollear un carta propia, así aumentando su valor y ganando plata por las reacciones de otras personas",
        " - Los usuarios con pocas cartas reciben más ingresos pasivos",
        " - Podés revisar tus ingresos con `inc`",
        "",
        "__Mercado:__",
        " - `give` y `pay` (nuevo) ahora se escriben mencionando a la persona primero",
        " - `wait` ahora se puede usar para ver los tiempos restantes de otra persona",
        " - Se implementó el sistema de subastas: Revisá las cartas con `auc list`, poné en subasta con `auc`, ofrecé con `offer` y reclamá con `claim`",
        "",
        "__Personalización:__",
        " - Podés cambiar tu nombre principal con `name` y tu descripción con `desc`",
        " - Podés renombrar tus cartas con `rename` y ponerles una descripción con `lore`",
        "",
        "__Otros:__",
        " - Usa `link` para ver el último pack seleccionado en el navegador",
        " - Ahora hay límite de tiempo para poder comprar o reaccionar a cartas",
        " - `config` ahora contiene muchas más variables que pueden ser modificadas",
        " - Ahora existe `top pack`",
        " - Se van a implementar juegos y apuestas, entre otras cosas",
        " - Ahora las minúsculas y mayúsculas son totalmente intercambiables",
    ],

    new: [
        "**__Momo 2.1:__**",
        "",
        " ⭐ Modo de adición rápida: `<pack> +` inicia la adición rápida de imágenes y gifs",
        " ⭐ Comando `move`: se pueden mover cartas entre packs",
        " - Comando `fix`: reordena cartas y colecciones en caso de que haya un problema",
        " ⭐ Ajustes a la economía para favorecer un crecimiento estable y lento",
        " - Los gifs ahora valen 2.5 lo que valen las imágenes nórmales y son más raras de obtener",
        " - Los ingresos pasivos son ahora muy igualitarios, pero se frenan cuando no comprás por cierto tiempo",
        " - Nuevo reglamento: Los personajes tienen que tener 5, 10 o 15 cartas dependiendo de su importancia",
        " - Los packs generales no pueden tener más de 50 cartas",
        " - Arreglos de bugs",
        " - Varias adiciones más y cambios planeados!",
        "",
        "",
        "",
        "**__Momo 2.2:__**",
        "",
        " ⭐ Website funcional! Usá `link` para verlo",
        " ⭐ Rarezas añadidas! (Común, Rara, Épica, Legendaria)",
        " - Nuevo comando: `clear`",
        " ⭐ Categorías! Separan los packs para más orden - `cat`",
        " - Rolls automáticos!",
        " - Comando `odds` añadido",
        "",
        "",
        "",
        "**__Momo 2.3:__**",
        "",
        " ⭐ Comando `img` para cambiar tu foto de perfil",
        " ⭐ Comando `replace` para reemplazar cartas con links rotos",
        " ⭐ Comando `top col` para ver tus mejores cartas",
        " ⭐ Comando `song` para ponerte una canción de perfil",
        " - Comandos `mute`, `unmute`, `join`, `leave` para controlar el audio del bot",
        " - `col (<usuario>) <categoría>` para ver todas las cartas de una determinada rareza",
        " ⭐ `top inv (<usuario>)` para ver tus cartas con más inversiones",
        " - Inversiones automáticas al azar cada 12 horas"
    ],

    help: {
        
        user: [
            "**__Ayuda sobre usuarios:__**",
            "",
            "`user (<usuario>)` muestra los datos de un usuario (default = los tuyos)",
            "`name <nombre>` cambia tu nombre principal (no es el que los demás van a usar)",
            "`desc <descripción>` cambia tu descripción",
            "`img <link>` cambia tu imagen de perfil",
            "`img reset` reestablece tu imagen de perfil",
            "`song <link>` establece tu canción de perfil (link de Youtube)",

            "`col (<usuario>)` muestra datos sobre toda la colección de un usuario (default = la tuya)",
            "`col (<usuario>) <pack>` muestra las cartas pertenecientes a un pack de un usuario (default = las tuyas)",
            "`col (<usuario>) <rareza>` muestra las cartas de una determinada rareza de un usuario)",
            "`top col (<usuario>)` muestra las cartas más valiosas de un usuario",
            "`top inv (<usuario>)` muestra las cartas con más inversiones de un usuario",
            "`top user` muestra los usuarios con más plata",

            "`bal (<usuario>)` muestra el balance de un usuario (default = el tuyo)",
            "`inc` muestra tus ingresos pasivos",
            "`rolls`, `reacts`, `buys` y `invs` `(<usuario>)` muestran las acciones disponibles del usuario (default = las tuyas)",
            "`wait (<usuario>)` muestra los minutos restantes para obtener más acciones",
            "`pay <usuario> <plata>` le da plata a un usuario",

            "`id` muestra tu ID y los nombres asociados al mismo",
            "`id <nombre>` asocia un nombre a tu ID",
            "`id - <nombre>` elimina el nombre",
            "`id list` muestra todos los IDs y los nombres asociados a cada uno",
        ],

        card: [
            "**__Ayuda sobre cartas:__**",
            "",
            "`card <pack> <número>` muestra una carta específica de una pack",
            "",
            "`roll` muestra una carta al azar que se puede comprar si no es de nadie",
            "`inv <pack> <número>` invierte plata en la carta y aumenta su multiplicador (cuesta lo que vale la carta)",
            "`sell <pack> <número>` vende una carta por la mitad de su valor",
            "`give <usuario> <pack> <número>` le da esa carta a otro usuario",
            "`rename <pack> <número> <nombre>` renombra la carta (tiene que ser tuya)",
            "`lore <pack> <número> <descripción>` le pone una descripción a la carta",
            "`replace <pack> <número> <link>` reemplaza la imagen de una carta - no cambia rareza o tipo",
            "`top cards` muestra las 20 cartas más valiosas",
            "`move` <pack> <número> <pack>` mueve una carta de un pack a otro",
            "`odds` muestra las probabilidades de que salgan cartas según sus rarezas",

            "`pack <pack>` muestra las cartas de un pack",
            "`link (<pack>)` muestra el último pack seleccionado en el navegador",
            "`pack list` muestra una lista de todos los packs",
            "`top pack` muestra la lista de los 10 packs con valor promedio de carta más alto"
        ],

        all: [
            "__**Ayuda general:**__",
            "",
            "`< >` indica un **parámetro** de una lista o dado por el usuario",
            "`( )` indica un parámetro **opcional**",
            "",
            "`new` muestra las adiciones más **nuevas**",
            "`old` muestra actualizaciones viejas",
            "",
            "`help card` muestra los comandos relacionados a **cartas**",
            "`help user` muestra los comandos relacionados a **usuarios**",
            "`help cmd` muestra los comandos relacionados a comandos **personalizados**",
            "`help bot` muestra los comandos relacionados al **bot**",
            "",
            "`h` es equivalente a `help`",
            "`c` es equivalente a `card`",
            "`u` es equivalente a `user`",
            "`p` es equivalente a `pack`",
            "`w` es equivalente a `wait`",
        ],

        cmd: [
            "**__Ayuda sobre comandos personalizados:__**",
            "",
            "`+ <cmd>` agrega un comando personalizado",
            "`- <cmd>` elimina un comando personalizado",
            "",
            "`<cmd> list` muestra todos las opciones del comando",
            "`<cmd> <número>` muestra una opción específica del comando",
            "`<cmd>` muestra una opción al azar del comando",
            "`<cmd> + <opción>` agrega una opción al comando",
            "`<pack> +` inicia la adición rápida de imágenes y gifs",
            "`<cmd> - <número de opción>` remueve una opción específica del comando",
            "`<cmd> -` remueve la última opción del comando",
        ],

        game: [
            "**__Ayuda sobre juegos:__**",
            "`game <juego>` inicia una partida del juego seleccionado",
            "`game list` muestra todos los juegos disponibles",
        ],

        bot: [
            "**__Ayuda sobre el bot:__**",
            "",
            "`save` guarda todos los datos permanentemente",
            "`exit (nosave)` apaga el bot y guarda los datos a menos que se escriba 'nosave'",
            "`config` muestra la configuración actual",
            "`fix` reordena cartas y colecciones en caso de que haya un problema",
            "`mute` y `unmute` mutea y desmutea al bot",
            "`join` y `leave` hacen que el bot se una o se vaya del chat de voz",
        ],

    },

}