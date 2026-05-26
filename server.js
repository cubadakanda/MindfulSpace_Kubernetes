const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Ambil nama Pod dari env HOSTNAME yang di-set K8s. Kalau di lokal, pakai os.hostname()
const POD_NAME = process.env.HOSTNAME || os.hostname() || 'local-pod-dev';

// Middleware untuk file statis di folder public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware custom untuk mencetak log setiap request masuk ke terminal
app.use((req, res, next) => {
  // Abaikan log health check agar terminal tidak penuh oleh probe Kubernetes tiap 10 detik
  if (req.url !== '/health') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Request diterima`);
  }
  next();
});

// Database sederhana berupa array untuk kutipan afirmasi (SDG 3 & 4)
const quotes = [
  "Napas dulu yuk. Kuliah memang melelahkan, tapi kesehatan mentalmu jauh lebih berharga.",
  "Belajar itu maraton, bukan sprint. Jangan lupa istirahat hari ini ya!",
  "Kegagalan hari ini adalah bahan bakar untuk kesuksesan hari esok. Kamu sudah berusaha hebat!",
  "Fokus pada progres belajarmu sendiri, tidak perlu membandingkan dirimu dengan orang lain.",
  "Layar laptopmu bisa ditutup sementara, tetapi kedamaian pikiranmu harus selalu dijaga.",
  "Satu langkah kecil setiap hari akan membawamu ke garis finish. Keep going, mahasiswa tangguh!",
  "Stres itu wajar, tetapi jangan biarkan stres menghentikan mimpi-mimpi besarmu.",
  "Pendidikan yang berkualitas dimulai dari pikiran yang sehat dan tenang."
];

// Endpoint /api/quote untuk ambil kutipan acak dan nama Pod
app.get('/api/quote', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  console.log(`[${new Date().toLocaleTimeString()}] API Quote dipanggil -> Mengirimkan kutipan afirmasi.`);
  res.json({
    quote: quotes[randomIndex],
    podName: POD_NAME
  });
});

// Endpoint /stress untuk simulasi beban berat (HPA trigger)
// Melakukan perhitungan Math.sqrt sebanyak 80.000.000 kali sesuai spek wajib
app.get('/stress', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] API Stress dipanggil -> Memulai kalkulasi 80 juta akar kuadrat...`);
  const start = Date.now();
  let temp = 0;
  
  // Perulangan matematika sangat berat untuk menaikkan utilisasi CPU
  for (let i = 0; i < 80000000; i++) {
    temp += Math.sqrt(i);
  }
  
  const end = Date.now();
  const timeTaken = (end - start) / 1000;
  
  console.log(`[${new Date().toLocaleTimeString()}] API Stress selesai -> Durasi: ${timeTaken.toFixed(3)} detik.`);
  
  res.json({
    message: "Stress test selesai!",
    durationSeconds: timeTaken,
    result: temp,
    podName: POD_NAME
  });
});

// Endpoint /health untuk Liveness Probe Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    podName: POD_NAME
  });
});

app.listen(PORT, () => {
  console.log(`====================================================================`);
  console.log(`    __  ___ _             __  ___        __  ___                   `);
  console.log(`   /  |/  /(_)___   ____ /  |/  / __ __ /  |/  / ___  ___ _ ____ _ ___ `);
  console.log(`  / /|_/ // // _ \\ /  _ // /|_/ // // // /|_/ // _ \\/ _ \`// __// // _ \\`);
  console.log(` /_/  /_//_//_//_//____//_/  /_/ \\_,_//_/  /_/ \\___/\\_,_/ \\__/ \\_,/ \\___/`);
  console.log(`                                                                     `);
  console.log(`                -- MindfulSpace: Academic Wellbeing --             `);
  console.log(`              Tugas Evaluasi 3 Praktikum Komputasi Awan            `);
  console.log(`====================================================================`);
  console.log(`[INFO] Status Server : RUNNING (Active)`);
  console.log(`[INFO] Port Aplikasi : ${PORT}`);
  console.log(`[INFO] Developer     : Parisan Apro (NIM: 152023141)`);
  console.log(`[INFO] Mode Cluster  : Minikube 2-Node Cluster`);
  console.log(`[INFO] Pod Hostname  : ${POD_NAME}`);
  console.log(`[INFO] OS Platform   : ${process.platform} (${process.arch})`);
  console.log(`[INFO] Node Version  : ${process.version}`);
  console.log(`--------------------------------------------------------------------`);
  console.log(`[API] Endpoint Terdaftar:`);
  console.log(`  -> GET /              : Melayani Dashboard Frontend (Stateless)`);
  console.log(`  -> GET /health        : Liveness Probe (K8s Health Check)`);
  console.log(`  -> GET /api/quote     : Afirmasi Acak & Pod Name (Load Balancing)`);
  console.log(`  -> GET /stress        : 80 Juta Iterasi Matematika (HPA Trigger)`);
  console.log(`====================================================================`);
  console.log(`[${new Date().toLocaleTimeString()}] [SYSTEM] Menunggu request dari browser...`);
});
