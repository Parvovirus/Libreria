// Ver la información de un libro concreto con su autor/es
// Insertar un libro con su autor/es (si existe/n no se crea/n autor/es, pero si no, se deben insertar también). Sólo tenemos un formulario de inserción de libro.


const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const app = express();
const url = "mongodb://localhost:27017/";
var ObjectId = require('mongodb').ObjectId;

const mydb = "Ejercicio2AutoresLibros";
const coleccionAutores = "Autores";
const coleccionLibros = "Libros";




var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


//Formato
function formato(listaLibros) {
    var resultadoFinal = "";
    var listaAutores = "";

    //Saca la info de los libros
    // la documentación de mongo (libros)
    for (let i = 0; i < listaLibros.length; i++) {
        // Longitud del array autores del libro "i"   autores[ uno ]   o  autores  [ uno ,dos]
        var lon = listaLibros[i].id_autor.length;
        if (lon > 1) {
            for (let j = 0; j < listaLibros[i].id_autor.length; j++) {
                listaAutores += "<br>" + listaLibros[i].id_autor[j];
            }
            resultadoFinal +=
                    `<div class="container">
                        <p><b>Titulo: </b> <span>${listaLibros[i].titulo}</span></p>
                        <p><b>ISBN: </b><span>${listaLibros[i].ISBN}</span></p>
                        <p><b>Tipo: </b><span>${listaLibros[i].tipo}</span></p>
                        <p><b>Número de paginas: </b> <span>${listaLibros[i].num_pag}</span></p>
                        <p><b>ID del Autor: </b> <span> ${listaAutores}</span></p><br>
                    </div>`;
        } else {
            listaAutores = listaLibros[i].id_autor[0];

            resultadoFinal +=
                `<div class="container">
                    <p><b>Titulo: </b> <span>${listaLibros[i].titulo}</span></p>
                    <p><b>ISBN: </b><span>${listaLibros[i].ISBN}</span></p>
                    <p><b>Tipo: </b><span>${listaLibros[i].tipo}</span></p>
                    <p><b>Número de paginas: </b> <span>${listaLibros[i].num_pag}</span></p>
                    <p><b>ID del Autor: </b> <span> ${listaAutores}</span></p><br>
                </div>`;

        }
    }
    return resultadoFinal;
}


// Busca e imprime todos los libros
app.post('/lista', urlencodedParser, (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(mydb);
        dbo.collection(coleccionLibros).find({}).toArray(function (err, result) {
            if (err) throw err;
            var listaLibros = result;
            db.close();
            var resultadoFinal = formato(listaLibros);
            res.send(`<div class="container"><input class="btn btn-primary" type="button" value="Volver al inicio" onclick="location.href='http://localhost:3001/'"> </div>${resultadoFinal}<div class="container"><input class="btn btn-primary" type="button" value="Volver al inicio" onclick="location.href='http://localhost:3001/'"> </div>`);
        });
    });
});

//Busqueda del ISBN
app.post('/busqueda', urlencodedParser, (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(mydb);
        var query = { "ISBN": req.body.isbn };
        //  busqueda del libro por ISBN
        dbo.collection(coleccionLibros).find(query).toArray(function (err, result) {
            var resultadoBusqLibro = [];
            if (err) throw err;
            //cambia la variable para que no haya conflicto al pintar
            resultadoBusqLibro = result;
            //Nos devuelve los id de los autor
            var idAutor = { _id: ObjectId(result[0].id_autor[0]) };
            dbo.collection(coleccionAutores).find(idAutor).toArray(function (err, result2) {
                var resultadoBusqAutor = [];
                if (err) throw err;
                //Resultado del autor/es encontrado/s
                resultadoBusqAutor = result2;
                db.close();
                res.send(pintarLibro(resultadoBusqLibro) + "<br>" + pintarAutor(resultadoBusqAutor));
            });
        })
    });

});

//Formato para pintar el libro y el autor
function pintarAutor(resultadoBusqAutor) {
    var resultadoFinalAutor = "<h3>Información autor: </h3><br>";

    if (resultadoBusqAutor[0].nombre === undefined) {
        resultadoBusqAutor[0].nombre = "Sin rellenar";
    }

    if (resultadoBusqAutor[0].apellidos === undefined) {
        resultadoBusqAutor[0].apellidos = "Sin rellenar";
    }
    if (resultadoBusqAutor[0].tipo_libros === undefined) {
        resultadoBusqAutor[0].tipo_libros = "Sin rellenar";
    }
    if (resultadoBusqAutor[0].ano_nacimiento === undefined) {
        resultadoBusqAutor[0].ano_nacimiento = "Sin rellenar";
    }
    resultadoFinalAutor += '<b>Nombre:</b> ' + resultadoBusqAutor[0].nombre + '<br><b>Apellidos: </b>' + resultadoBusqAutor[0].apellidos + '<br><b>Tipo: </b>' + resultadoBusqAutor[0].tipo_libros + '<br><b>Año de nacimiento: </b>' + resultadoBusqAutor[0].ano_nacimiento + "<br><br>";

    return resultadoFinalAutor;
}

function pintarLibro(resultadoBusqLibro) {
    var resultadoFinalLibro = "<h3>Información libro: </h3><br>";
    if (resultadoBusqLibro[0].titulo === undefined) {
        resultadoBusqLibro[0].titulo = "Sin rellenar";
    }
    if (resultadoBusqLibro[0].tipo === undefined) {
        resultadoBusqLibro[0].tipo = "Sin rellenar";
    }
    if (resultadoBusqLibro[0].num_pags === undefined) {
        resultadoBusqLibro[0].num_pags = "Sin rellenar";
    }
    resultadoFinalLibro += '<b>Título:</b> ' + resultadoBusqLibro[0].titulo + '<br><b>ISBN: </b>' + resultadoBusqLibro[0].ISBN + '<br><b>Tipo: </b>' + resultadoBusqLibro[0].tipo + '<br><b>Número de páginas: </b>' + resultadoBusqLibro[0].num_pags;
    return resultadoFinalLibro;
}

//! ACCIÓN DE INSERTAR : HAY QUE VERIFICAR SI EXISTE EL LIBRO Y AUTORES

app.post('/insertar', urlencodedParser, (req, res) => {
    var respuestaInsercion = "";
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(mydb);
        // ! BUSCAMOS SI EL LIBRO EXISTE EN LA BD DE LIBROS
        dbo.collection(coleccionLibros).find({ "ISBN": req.body.isbn }).toArray(function (err, result) {
            if (err) throw err;

            if (result[0] === undefined) {  // ! <-- ENTRAMOS AQUÍ SI EL LIBRO NO EXISTE EN LA BD
                console.log("El libro no existe en la base de datos");
                //  ! BUSCAMOS SI EXISTE EL AUTOR EN LA BD DE AUTORES.
                dbo.collection(coleccionAutores).find({ "apellidos": req.body.apellidos }).toArray(function (err, result) {
                    if (err) throw err;

                    if (result[0] === undefined) { //! <-- ENTRAMOS AQUÍ SI EL AUTOR NO EXISTE EN LA BD
                        console.log("El autor no existe en la base de datos");
                        var idAutorIntroducido = ObjectId(); // ! <-- GENERAMOS UNA ID PARA EL AUTOR

                        // ! CREAMOS LA QUERY CON LA INFO DEL AUTOR
                        const autorIntroducido = { "_id": idAutorIntroducido, "nombre": req.body.nombre, "apellidos": req.body.apellidos, "tipo_libros": req.body.tipo_libros, "ano_nacimiento": req.body.ano_nacimiento }

                        // ! INSERTAMOS AUTOR:

                        dbo.collection(coleccionAutores).insertOne(autorIntroducido, function (err, res) {
                            if (err) throw err;

                            //! CREAMOS LA QUERY CON LA INFO DEL LIBRO

                            const libroIntroducido = { "titulo": req.body.titulo, "ISBN": req.body.isbn, "tipo": req.body.tipo, "num_pag": req.body.num_pag, "id_autor": [idAutorIntroducido.toString()] }

                            //! INSERTAMOS LIBRO

                            dbo.collection(coleccionLibros).insertOne(libroIntroducido, function (err, res) {
                                if (err) throw err;
                                // ! RESPUESTA QUE APARECE EN HTML (SEND);
                                var respuesta = `El Libro con ISBN: ${req.body.isbn} y el <b>Autor: ${req.body.apellidos} han sido insertados en la base de datos`;
                                db.close();
                                console.log(respuesta)

                            });
                        });
                    } else {
                        //! ENTRAMOS SI EL AUTOR EXISTE PERO EL LIBRO NO:
                        //! CREAMOS LA QUERY CON LA INFO DEL LIBRO
                        const libroIntroducidoAutorExt = { "titulo": req.body.titulo, "ISBN": req.body.isbn, "tipo": req.body.tipo, "num_pag": req.body.num_pag, "id_autor": [result[0]._id.toString()] }

                        //! INSERTAMOS LIBRO:

                        dbo.collection(coleccionLibros).insertOne(libroIntroducidoAutorExt, function (err, res) {
                            if (err) throw err;
                            // ! RESPUESTA QUE APARECE EN HTML (SEND);
                            var respuesta = `El Libro con ISBN: ${req.body.isbn} ha sido insertado. El Autor: ${req.body.apellidos} ya estaba en la base de datos`;
                            db.close();
                            console.log(respuesta);
                        });
                    }
                });
            } else { //! <-- ENTRAMOS AQUÍ SI EL LIBRO YA EXISTE EN LA BASE DE DATOS
                // ! RESPUESTA QUE APARECE EN HTML (SEND);
                respuestaInsercion = ` Este libro ya existe en la base de datos: ${result[0].ISBN}`;
                db.close();
                console.log(respuestaInsercion);
            }
        });
    });
    res.sendFile(__dirname + '/index.html')
});

app.listen(3001);


