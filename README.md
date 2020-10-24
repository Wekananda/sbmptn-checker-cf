# SBMPTN Checker using Firebase Cloud Function

An exploration journal for Firebase (a Google Developer Product) by **I Gusti Agung Vivekananda**

## Latar Belakang

Saya membuat projek ini pada dasarnya karena gabut dan ingin mengecek pengumuman SBMPTN bersama-sama, dan supaya lebih suprise hasilnya langsung muncul serentak.

## Bagaimana cara kerjanya?

Setelah data id SBMPTN dan tanggal lahir siswa disimpan dalam firestore dan sudah melewati jam countdown. Cloud function akan langsung ketrigger untuk melakukan get data ke semua mirror pengumuman SBMPTN lalu menyimpan hasilnya kembali di firestore.
