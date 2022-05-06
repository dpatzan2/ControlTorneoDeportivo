const Equipos = require("../models/equipos.model");
const Ligas = require("../models/ligas.model");
const Usuarios = require("../models/usuarios.model");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const PdfkitConstruct = require("pdfkit-construct");

function listarEquiposLiga(req, res) {
  var idLiga;
  var UsuarioCreador;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Ligas.findById({ _id: idLiga }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "Este equipo no te pertenece" });

    Equipos.find({ Liga: idLiga }, (err, equipoEliminado) => {
      if (err) return res.status(500).send({ message: "Ocurrio un error" });
      if (!equipoEliminado)
        return res
          .status(500)
          .send({ message: "No se pudo eliminar el equipo" });

      return res.status(200).send({ Equipo: equipoEliminado });
    }).sort({
      pts: -1,
    });
  });
}

function listarEquiposLigaPDF(req, res) {
  var idLiga;
  var UsuarioCreador;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Ligas.findById({ _id: idLiga }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "Este equipo no te pertenece" });

    Equipos.find({ Liga: idLiga }, (err, equipoEliminado) => {
      if (err) return res.status(500).send({ message: "Ocurrio un error" });
      if (!equipoEliminado)
        return res
          .status(500)
          .send({ message: "No se pudo eliminar el equipo" });

      console.log("estoy a punto de llamarlo");
      geenerarPDF(equipoEliminado, equipoEncontrado);
    }).sort({
      pts: -1,
    });
  });
}
function geenerarPDF(equipoEliminado, equipoEncontrado) {
  var hoy = new Date();
  var fecha =
    hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();

  // Create a document
  const doc = new PdfkitConstruct({
    size: "A4",
    margins: { top: 20, left: 10, right: 10, bottom: 20 },
    bufferPages: true,
  });

  // set the header to render in every page
  doc.setDocumentHeader({}, () => {
    doc
      .lineJoin("miter")
      .rect(0, 0, doc.page.width, doc.header.options.heightNumber)
      .fill("#ededed");

    doc
      .fill("#115dc8")
      .fontSize(20)
      .text(equipoEncontrado.nombreLiga, doc.header.x, doc.header.y);
  });

  // set the footer to render in every page
  doc.setDocumentFooter({}, () => {
    doc
      .lineJoin("miter")
      .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber)
      .fill("#c2edbe");

    doc
      .fill("#7416c8")
      .fontSize(8)
      .text("Copyright 2022 © Creador ligas", doc.footer.x, doc.footer.y + 10);
  });

  let i;
  const invoiceTableTop = 300;

  doc.font("Helvetica-BoldOblique").fontSize(15).fillColor("#1F618D");
  filaRegistro(
    doc,
    invoiceTableTop,
    "Equipo",
    "Goles favor",
    "Goles contra",
    "Diferencia Goles",
    "Partidos Jugados",
    "Puntos"
  );
  separadorSubtitulos(doc, invoiceTableTop + 20);
  doc.font("Helvetica").fontSize(10).fillColor("black");

  if (equipoEliminado.length == 0) {
    for (i = 0; i < 1; i++) {
      const position = invoiceTableTop + (i + 1) * 30;
      filaRegistro(
        doc,
        position,
        "*NOTA: No existen equipos en la Liga",
        "",
        "",
        ""
      );

      separadorRegistros(doc, position + 30);
    }
  } else {
    for (i = 0; i < equipoEliminado.length; i++) {
      const item = equipoEliminado[i];
      const position = invoiceTableTop + (i + 1) * 50;

      filaRegistro(
        doc,
        position,
        item.nombreEquipo,
        item.golesFavor,
        item.golesContra,
        item.diferenciaGoles,
        item.cantidadJugados,
        item.pts
      );

      separadorRegistros(doc, position + 30);
    }
  }

  // set the footer to render in every page
  doc.render();
  doc.pipe(
    fs.createWriteStream(
      "pdfs/" + equipoEncontrado.nombreLiga + " " + fecha + ".pdf"
    )
  );
  doc.end();
}
function separadorRegistros(doc, y) {
  doc
    .strokeColor("#B2BABB")
    .lineWidth(0.5)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}
function filaRegistro(
  doc,
  y,
  nombreEquipo,
  golesFavor,
  golesContra,
  diferenciaGoles,
  cantidadJugados,
  pts
) {
  doc
    .fontSize(10)
    .text(nombreEquipo, 25, y)
    .text(golesFavor, 95, y)
    .text(golesContra, 160, y)
    .text(diferenciaGoles, 250, y)
    .text(cantidadJugados, 390, y)
    .text(pts, 506, y);
}

function separadorSubtitulos(doc, y) {
  doc.strokeColor("#17202A").lineWidth(2).moveTo(15, y).lineTo(580, y).stroke();
}

function crearEquipo(req, res) {
  var parametros = req.body;
  var idLiga;
  var UsuarioCreador;
  var equipoModel = new Equipos();

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Ligas.findById({ _id: idLiga }, (err, ligaEncontradas) => {
    if (!ligaEncontradas)
      return res.status(500).send({ message: "No se encontro ninguna liga" });

    Usuarios.findOne(
      { _id: ligaEncontradas.UsuarioCreador },
      (err, usuarioEncontrado) => {
        console.log(usuarioEncontrado);
        UsuarioCreador = usuarioEncontrado._id;

        if (req.user.rol == "Usuario" && usuarioEncontrado._id != req.user.sub)
          return res.status(500).send({ message: "esta liga no te pertenece" });

        Equipos.find({ Liga: idLiga }, (err, ligaEncontradas) => {
          if (!ligaEncontradas)
            return res.status(500).send({ message: "La liga no se encontro" });

          if (ligaEncontradas.length >= 10)
            return res
              .status(500)
              .send({ message: "La liga ya cuenta con 10 equipos" });

          if (parametros.nombreEquipo) {
            equipoModel.nombreEquipo = parametros.nombreEquipo;
            equipoModel.golesFavor = 0;
            equipoModel.golesContra = 0;
            equipoModel.diferenciaGoles = 0;
            equipoModel.cantidadJugados = 0;
            equipoModel.pts = 0;
            equipoModel.Liga = idLiga;
            equipoModel.UsuarioCreador = UsuarioCreador;

            Equipos.findOne(
              {
                nombreEquipo: parametros.nombreEquipo,
                Liga: req.params.idLiga,
              },
              (err, nombreEncontrado) => {
                if (nombreEncontrado == null) {
                  equipoModel.save((err, equipoGuardado) => {
                    if (err)
                      return res
                        .status(500)
                        .send({ message: "Error en la peticion" });
                    if (!equipoGuardado)
                      return res
                        .status(404)
                        .send({ message: "No se encontraron equipos" });

                    return res.status(200).send({ equipo: equipoGuardado });
                  });
                } else {
                  return res
                    .status(500)
                    .send({
                      message:
                        "Este equipo ya se encuentra registrado en la liga",
                    });
                }
              }
            );
          } else {
            return res
              .status(500)
              .send({ message: "Debe asignarle un nombre al equipo" });
          }
        });
      }
    );
  });
}

function editarEquipo(req, res) {
  var parametros = req.body;
  var idLiga;
  var UsuarioCreador;
  var idEquipo = req.params.idEquipo;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Equipos.findById({ _id: idEquipo }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "Este equipo no te pertenece" });

    Equipos.findOne(
      { nombreEquipo: parametros.nombreEquipo, Liga: idLiga },
      (err, equipoEncontrado) => {
        if (equipoEncontrado == null) {
          Equipos.findByIdAndUpdate(
            { _id: idEquipo, UsuarioCreador: UsuarioCreador },
            parametros,
            { new: true },
            (err, equipoActualizado) => {
              if (err)
                return res.status(500).send({ message: "Ocurrio un error" });
              if (!equipoActualizado)
                return res
                  .status(500)
                  .send({ message: "No se pudo actualizar el equipo" });

              return res.status(200).send({ Equipo: equipoActualizado });
            }
          );
        } else {
          return res.status(500).send({ message: "Este equipo ya existe" });
        }
      }
    );
  });
}

function eliminarEquipos(req, res) {
  var idLiga;
  var UsuarioCreador;
  var idEquipo = req.params.idEquipo;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Equipos.findById({ _id: idEquipo }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "Este equipo no te pertenece" });

    Equipos.findByIdAndDelete(
      { _id: idEquipo, UsuarioCreador: UsuarioCreador },
      { new: true },
      (err, equipoEliminado) => {
        if (err) return res.status(500).send({ message: "Ocurrio un error" });
        if (!equipoEliminado)
          return res
            .status(500)
            .send({ message: "No se pudo eliminar el equipo" });

        return res.status(200).send({ Equipo: equipoEliminado });
      }
    );
  });
}

module.exports = {
  listarEquiposLiga,
  crearEquipo,
  editarEquipo,
  eliminarEquipos,
  listarEquiposLigaPDF,
};
