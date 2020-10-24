const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

function hashString(t) {
  var e = 0,
    a = t.length,
    n = 0;
  if (a > 0) for (; n < a; ) e = ((e << 5) - e + t.charCodeAt(n++)) | 0;
  return e;
}

function getPath(t) {
  let e = hashString(t),
    a = (e >> 8) & 255;
  return (
    (path =
      (255 & e).toString().padStart(3, "0") +
      "/" +
      a.toString().padStart(3, "0")),
    path
  );
}
exports.checkPeserta = functions.firestore
  .document("/peserta/{uid}")
  .onUpdate((change, context) => {
    const data = change.after.data();
    const previousValue = change.before.data();
    const mirrorLink = [
      "sbmptn.ipb.ac.id",
      "sbmptn.ui.ac.id",
      "sbmptn.itb.ac.id",
      //   "sbmptn.ugm.ac.id",
      //   "sbmptn.its.ac.id",
      //   "sbmptn.undip.ac.id",
      //   "sbmptn.unair.ac.id",
      //   "sbmptn.unand.ac.id",
      //   "sbmptn.unsri.ac.id",
      //   "sbmptn.unhas.ac.id",
      //   "sbmptn.untan.ac.id",
      //   "sbmptn.unsyiah.ac.id",
    ];
    let statusKelulusan = false;
    if (data.start && !previousValue.start) {
      //   db.doc(`peserta/${context.params.uid}`).set(
      //     {
      //       status: "Data dari Mirror 0",
      //       isGetted: true,
      //       confirmTimestamp: FieldValue.serverTimestamp(),
      //       lulus: false,
      //       isLoading: false,
      //     },
      //     { merge: true }
      //   );
      console.log("Peserta " + previousValue.nama + "Sedang diproses");
      mirrorLink.forEach((mirror) => {
        //get data every mirror
        //response.data
        if (!statusKelulusan) {
          console.log(
            "https://" +
              mirror +
              "/data/data/" +
              getPath(previousValue.noPeserta + previousValue.tanggalLahir) +
              "/" +
              previousValue.noPeserta +
              previousValue.tanggalLahir +
              ".dwg"
          );
          db.doc(`peserta/${context.params.uid}`).set(
            {
              status: "Sedang mengambil data dari mirror " + mirror,
              isLoading: true,
            },
            { merge: true }
          );
          axios
            .get(
              "https://" +
                mirror +
                "/data/data/" +
                getPath(previousValue.noPeserta + previousValue.tanggalLahir) +
                "/" +
                previousValue.noPeserta +
                previousValue.tanggalLahir +
                ".dwg"
            )
            .then((response) => {
              if (response.data.ac) {
                db.doc(`peserta/${context.params.uid}`).set(
                  {
                    status: "Data dari Mirror " + mirror,
                    isGetted: true,
                    confirmTimestamp: FieldValue.serverTimestamp(),
                    lulus: true,
                    isLoading: false,
                    ptnLulus: response.data.npt,
                    jurusanLulus: response.data.nps,
                    alamat:
                      "https://" +
                      mirror +
                      "/data/data/" +
                      getPath(
                        previousValue.noPeserta + previousValue.tanggalLahir
                      ) +
                      "/" +
                      previousValue.noPeserta +
                      previousValue.tanggalLahir +
                      ".dwg",
                    gambar:
                      "/data/qrimg/" +
                      getPath(
                        previousValue.noPeserta + previousValue.tanggalLahir
                      ) +
                      "/" +
                      previousValue.noPeserta +
                      previousValue.tanggalLahir +
                      ".png",
                  },
                  { merge: true }
                );
                console.log(
                  "Peserta " +
                    previousValue.nama +
                    " Lulus " +
                    " Data dari mirror " +
                    mirror
                );
                // return true;
              } else {
                db.doc(`peserta/${context.params.uid}`).set(
                  {
                    status: "Data dari Mirror " + mirror,
                    isGetted: true,
                    confirmTimestamp: FieldValue.serverTimestamp(),
                    lulus: false,
                    isLoading: false,
                  },
                  { merge: true }
                );
                console.log(
                  "Peserta " +
                    previousValue.nama +
                    " Tidak Lulus " +
                    " Data dari mirror " +
                    mirror
                );
              }
              statusKelulusan = true;
              console.log(
                "Data berhasil didapatkan untuk " + previousValue.nama,
                response.data
              );
              return true;
            })
            .catch((error) => {
              db.doc(`peserta/${context.params.uid}`).set(
                {
                  isError: true,
                  error: error.message,
                  alamatUrl:
                    "https://" +
                    mirror +
                    "/data/data/" +
                    getPath(
                      previousValue.noPeserta + previousValue.tanggalLahir
                    ) +
                    "/" +
                    previousValue.noPeserta +
                    previousValue.tanggalLahir +
                    ".dwg",
                },
                { merge: true }
              );
              console.log("Terjadi Error saat get API" + error);
            });
        }
      });
      console.log(
        "Operasi get data selesai dijalankan untuk peserta ",
        previousValue.nama
      );
      return true;
    } else {
      return console.log("Fungsi tidak memenuhi syarat untuk dijalankan");
    }
  });
