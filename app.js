// ================================================================
//  MISAGI S.A.C. · Sistema RRHH v3
//  Módulos: Dashboard BI · Alertas · Personal · Conductores
// ================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDHTEYO32CRIcojgNBQytgKdxsliQVLJPc",
  authDomain:        "misagi-rrhh.firebaseapp.com",
  projectId:         "misagi-rrhh",
  storageBucket:     "misagi-rrhh.firebasestorage.app",
  messagingSenderId: "275896317609",
  appId:             "1:275896317609:web:6451460c1217a35cfbdbb8",
};
const COLLECTION = "personal_misagi";
const app    = initializeApp(firebaseConfig);
const db     = getFirestore(app);
const colRef = collection(db, COLLECTION);
const conductaRef = collection(db, "conducta_misagi");

// ── Datos iniciales (auto-carga si la coleccion esta vacia) ──
const SEED_DATA = [
  {
    "nombres_completos": "Amachi Reyes, MAX J.",
    "dni": "75944310",
    "fecha_nacimiento": "1997-11-02",
    "edad": 28,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "H75944310",
    "direccion": "Cerro Colorado",
    "email": "maxamachireyes02@gmail.com",
    "celular": "954 886 653",
    "cargo": "GERENTE GENERAL",
    "categoria": "Administrativo",
    "departamento": "GERENCIA",
    "tiempo_laborando": "1AÑOS 1MESES7DIAS",
    "fecha_ingreso": "2025-05-02",
    "empresa": "MISAGI SAC",
    "periodo_vacaciones": "2026-05-02",
    "tipo_contrato": "Sin contrato",
    "sueldo_base": 7000.0,
    "bono": 0.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 7000.0,
    "regimen_pensionario": "HABITAT",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Arapa Choquehuanca, LUIS MIGUEL",
    "dni": "46557013",
    "fecha_nacimiento": "1990-10-03",
    "edad": 35,
    "estado_civil": "SEPARADO",
    "n_hijos": 2,
    "licencia": "46557013",
    "direccion": "Km 14, Zona 2, comité Yura",
    "email": "luismiguelarapach@gmail.com",
    "celular": "926 336 976",
    "contacto_familiar": "965 208 116",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "1AÑOS 7MESES8DIAS",
    "fecha_ingreso": "2024-11-01",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2025-07-31",
    "renovacion_contrato": "2026-07-31",
    "periodo_vacaciones": "2025-11-01",
    "dias_vacaciones": 14,
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 2000.0,
    "bono": 2000.0,
    "asignacion_familiar": 113.0,
    "sueldo_final": 4113.0,
    "regimen_pensionario": "PRIMA",
    "cuspp": "631471LACPQ4",
    "fecha_emo": "2024-11-12",
    "tipo_sangre": "O+",
    "peso": 72.0,
    "estatura": 1.65,
    "apto_empo": "APTO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Bartra Juarez, MATEO MARTIN",
    "dni": "75896549",
    "fecha_nacimiento": "2003-11-05",
    "edad": 22,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "H75896549",
    "direccion": "ASOC.URB.VILLA SAN JOSÉ MZ.D LT.03",
    "email": "mateobartra@gmail.com",
    "celular": "917 850 516",
    "contacto_familiar": "958899610",
    "cargo": "COORD. OPERACIONES",
    "categoria": "Administrativo",
    "departamento": "OPERACIONES",
    "tiempo_laborando": "1AÑOS 3MESES23DIAS",
    "fecha_ingreso": "2025-02-17",
    "empresa": "MISAGI CARGO",
    "fecha_salida": "2025-11-02",
    "renovacion_contrato": "2026-10-31",
    "periodo_vacaciones": "2026-05-02",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1200.0,
    "bono": 800.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 2000.0,
    "regimen_pensionario": "ONP",
    "cuspp": "*",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Cama Galarza, JOSE VALENTIN",
    "dni": "43170573",
    "fecha_nacimiento": "1985-09-24",
    "edad": 40,
    "estado_civil": "DIVORCIADO",
    "n_hijos": 3,
    "direccion": "Villa Industrial E-3, Caylloma",
    "email": "camajose481gmail.com",
    "celular": "917915859",
    "contacto_familiar": "953157391",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "#NUM!",
    "fecha_ingreso": "2026-04-01",
    "empresa": "MISAGI CARGO",
    "renovacion_contrato": "2026-06-30",
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 3000.0,
    "bono": 1000.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 4000.0,
    "regimen_pensionario": "PROFUTURO",
    "cuspp": "613121JCGAA7",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Farfan Ayamamani, VICTOR VICENTE",
    "dni": "43178559",
    "fecha_nacimiento": "1985-07-19",
    "edad": 40,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "H43178559",
    "direccion": "P.J. San Luis La Cano Calle Principal S/N",
    "email": "farfanvictor86@gmail.com",
    "celular": "951397850",
    "contacto_familiar": "988 117 004",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "0AÑOS 7MESES8DIAS",
    "fecha_ingreso": "2025-11-01",
    "empresa": "MISAGI CARGO",
    "renovacion_contrato": "2026-07-31",
    "periodo_vacaciones": "2026-11-01",
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 2500.0,
    "bono": 1200.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 3700.0,
    "regimen_pensionario": "PRIMA",
    "cuspp": "312451VFAFM7",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Flores Aragon, WILISMAN",
    "dni": "74927463",
    "fecha_nacimiento": "1994-10-20",
    "edad": 31,
    "estado_civil": "SOLTERO",
    "n_hijos": 1,
    "licencia": "0",
    "direccion": "A.H. Bella Esperanza Mz. Q, Lt. 4",
    "email": "wilisman.1flores@gmail.com",
    "celular": "921 793 948",
    "contacto_familiar": "974 723 648 - 928445356",
    "cargo": "CONTADOR",
    "categoria": "Administrativo",
    "departamento": "CONTABILIDAD",
    "tiempo_laborando": "1AÑOS 9MESES8DIAS",
    "fecha_ingreso": "2024-09-01",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2025-08-31",
    "renovacion_contrato": "2026-08-31",
    "periodo_vacaciones": "2025-09-01",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1887.0,
    "bono": 0.0,
    "asignacion_familiar": 113.0,
    "sueldo_final": 2000.0,
    "regimen_pensionario": "ONP",
    "cuspp": "*",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Huamani Quispe, SHIRLEY MARLY",
    "dni": "75277582",
    "fecha_nacimiento": "1999-07-18",
    "edad": 26,
    "estado_civil": "SOLTERA",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Asoc. Carlos Baca Flor M-N L/12 - Cerro Colorado, Arequipa",
    "email": "cieloshima18@gmail.com",
    "celular": "959 983 236",
    "contacto_familiar": "No se tiene",
    "cargo": "COORD. OPERACIONES",
    "categoria": "Administrativo",
    "departamento": "OPERACIONES",
    "tiempo_laborando": "1AÑOS 7MESES25DIAS",
    "fecha_ingreso": "2024-10-15",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2025-04-15",
    "renovacion_contrato": "2027-05-02",
    "periodo_vacaciones": "2025-11-01",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1800.0,
    "bono": 0.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 1800.0,
    "regimen_pensionario": "INTEGRA",
    "cuspp": "663570SHQMS0",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Kana Huallpa, RENE ELMER",
    "dni": "46743191",
    "fecha_nacimiento": "1990-08-15",
    "edad": 35,
    "estado_civil": "CASADO",
    "n_hijos": 2,
    "licencia": "H46743191",
    "direccion": "Asoc. Jose Abelardo Quiñones Lt9 - Yura, Arequipa",
    "email": "kana2715@hotmail.com",
    "celular": "986 552 872",
    "contacto_familiar": "992 985 643",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "2AÑOS 5MESES8DIAS",
    "fecha_ingreso": "2024-01-01",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2024-06-01",
    "renovacion_contrato": "2026-12-02",
    "periodo_vacaciones": "2025-01-15",
    "dias_vacaciones": 5,
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 2500.0,
    "bono": 1500.0,
    "asignacion_familiar": 113.0,
    "sueldo_final": 4113.0,
    "regimen_pensionario": "INTEGRA",
    "cuspp": "630981RKHAL8",
    "fecha_emo": "2024-11-12",
    "apto_empo": "APTO CON RESTRINCCIONES",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Mamani López, YURY FRANCHEST",
    "dni": "44306843",
    "fecha_nacimiento": "1987-01-17",
    "edad": 39,
    "estado_civil": "CASADO",
    "n_hijos": 3,
    "licencia": "H44306843",
    "direccion": "Asoc. Virgen Copacabana mz. 15, q16, Cerro Colorado, Arequipa - ref. a dos cuadras del colegio nacional ruta del sillar",
    "email": "Yfmamanilopez@gmail.com",
    "celular": "901 457 250",
    "contacto_familiar": "961 336 597",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "1AÑOS 11MESES8DIAS",
    "fecha_ingreso": "2024-07-01",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2025-10-01",
    "renovacion_contrato": "2026-09-30",
    "periodo_vacaciones": "2025-07-01",
    "dias_vacaciones": 15,
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 2500.0,
    "bono": 1500.0,
    "asignacion_familiar": 113.0,
    "sueldo_final": 4113.0,
    "regimen_pensionario": "PROFUTURO",
    "cuspp": "617921YMLAE9",
    "fecha_emo": "2024-09-11",
    "apto_empo": "APTO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Mamani Parqui, MAYDA JULIA",
    "dni": "76242021",
    "fecha_nacimiento": "2002-04-29",
    "edad": 24,
    "estado_civil": "SOLTERA",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Ciudad de Dios Mz. Alt. 22 Zn. 1 CTE29 - YURA",
    "email": "mayda.mp29@gmail.com",
    "celular": "959 276 731",
    "contacto_familiar": "951505742",
    "cargo": "ASIST. SSOMA",
    "categoria": "Administrativo",
    "departamento": "SSOMA",
    "tiempo_laborando": "0AÑOS 7MESES19DIAS",
    "fecha_ingreso": "2025-10-21",
    "empresa": "MISAGI CARGO",
    "fecha_salida": "2026-01-21",
    "renovacion_contrato": "2026-06-30",
    "periodo_vacaciones": "2026-01-02",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1200.0,
    "bono": 0.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 1200.0,
    "regimen_pensionario": "PROFUTURO",
    "cuspp": "673730MMPAQ3",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Merma Condori, ROSA LUZ",
    "dni": "74364653",
    "fecha_nacimiento": "2002-12-01",
    "edad": 23,
    "estado_civil": "SOLTERA",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Paucarpata",
    "email": "rosaluzmermacondori@gmail.com",
    "celular": "987 972 316",
    "contacto_familiar": "993234287 - 927028488",
    "cargo": "ASIST. CONTABILIDAD",
    "categoria": "Administrativo",
    "departamento": "CONTABILIDAD",
    "tiempo_laborando": "1AÑOS 2MESES8DIAS",
    "fecha_ingreso": "2025-04-01",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2025-06-30",
    "renovacion_contrato": "2027-01-01",
    "periodo_vacaciones": "2026-04-01",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1200.0,
    "bono": 600.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 1800.0,
    "regimen_pensionario": "INTEGRA",
    "cuspp": "675890RMCMD8",
    "apto_empo": "NO PASO EMPO",
    "observaciones": "SALIO EL 06 DE NOVIEMBRE POR SUBSIDIO DE MATERNIDAD E INGRESA LUNES 16 DE FEBRERO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Quispe Yanque, SANDRA MILAGROS",
    "dni": "70472267",
    "fecha_nacimiento": "2000-02-08",
    "edad": 26,
    "estado_civil": "SOLTERA",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Cl. Sebastian Ugarte 106B - San Juan de Dios - HUNTER",
    "email": "qsandramilagros@gmail.com",
    "celular": "951 795 722",
    "contacto_familiar": "974652308",
    "cargo": "AUX. IMAGEN INSTITUCIONAL",
    "categoria": "Administrativo",
    "departamento": "MARKETING",
    "tiempo_laborando": "1AÑOS 5MESES8DIAS",
    "fecha_ingreso": "2025-01-01",
    "empresa": "MISAGI SAC",
    "fecha_salida": "2025-05-31",
    "renovacion_contrato": "2026-09-28",
    "periodo_vacaciones": "2026-03-01",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1200.0,
    "bono": 0.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 1200.0,
    "regimen_pensionario": "INTEGRA",
    "cuspp": "665620SQYSQ7",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Quispe Acosta, ROGER ALEXANDER",
    "dni": "72650147",
    "fecha_nacimiento": "2002-03-14",
    "edad": 24,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Asoc. De comerciantes sudamericano Mz. G., Lt. 08",
    "email": "rogeer984.1114@gmail.com",
    "celular": "974 536 117",
    "cargo": "ASISTENTE DE CONTROL DE TRÁFICO",
    "categoria": "Administrativo",
    "departamento": "OPERACIONES",
    "tiempo_laborando": "0AÑOS 6MESES18DIAS",
    "fecha_ingreso": "2025-11-22",
    "empresa": "MISAGI CARGO",
    "renovacion_contrato": "2027-06-01",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 800.0,
    "bono": 1800.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 2600.0,
    "regimen_pensionario": "PRIMA",
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Supo Cutipa, JAVIER",
    "dni": "42035112",
    "fecha_nacimiento": "1981-12-03",
    "edad": 44,
    "estado_civil": "CASADO",
    "n_hijos": 2,
    "direccion": "Camineros Empleados Mz. H lT 16",
    "email": "supojavier802@gmail.com",
    "celular": "973701362",
    "contacto_familiar": "930283153",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "#NUM!",
    "fecha_ingreso": "2026-04-17",
    "empresa": "MISAGI CARGO",
    "renovacion_contrato": "2026-07-31",
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 2500.0,
    "bono": 0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 2500.0,
    "regimen_pensionario": "INTEGRA",
    "cuspp": "599211JSCOI6",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Ccora Flores, IVAN ELMER",
    "dni": "46415700",
    "fecha_nacimiento": "1990-04-01",
    "edad": 36,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "H46415700",
    "direccion": "Calle Comunidad Agua y Milagro Comunid. Campesina Agua y Milagro",
    "email": "ivanelmerccoraflores@gmail.com",
    "celular": "927 675 288",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "#NUM!",
    "fecha_ingreso": "2026-06-01",
    "empresa": "MISAGI CARGO",
    "renovacion_contrato": "2026-11-01",
    "tipo_contrato": "Contrato por servicio especifico",
    "bono": 0,
    "asignacion_familiar": 0,
    "regimen_pensionario": "INTEGRA",
    "cuspp": "629621ICFRR0",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Cordova Mandujano, MAURO CLODOALDO",
    "dni": "42636108",
    "fecha_nacimiento": "1983-11-24",
    "edad": 42,
    "estado_civil": "CASADO",
    "n_hijos": 5,
    "licencia": "K4236108",
    "direccion": "PLAZA PRINCIPAL S/N ANEXO SOCORRO",
    "email": "mauroclodoaldoc@gmail.com",
    "celular": "935289438",
    "contacto_familiar": "917452113",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "#NUM!",
    "fecha_ingreso": "2026-06-03",
    "empresa": "MISAGI CARGO",
    "renovacion_contrato": "2026-12-03",
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 2500.0,
    "bono": 1500.0,
    "asignacion_familiar": 0,
    "sueldo_final": 4000.0,
    "regimen_pensionario": "ONP",
    "cuspp": "*",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Flores Mmani, RONAL",
    "dni": "46797023",
    "fecha_nacimiento": "1991-08-06",
    "edad": 34,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "U46797023",
    "direccion": "Jr. San Francisco 206 - Puno",
    "email": "ronaldflores.rf10@gmail.com",
    "celular": "974411172",
    "cargo": "CONDUCTOR SEMITRAILER",
    "categoria": "Conductor",
    "departamento": "OPERACIONES & LOG",
    "tiempo_laborando": "#NUM!",
    "fecha_ingreso": "2026-06-01",
    "empresa": "MISAGI CARGO",
    "tipo_contrato": "Contrato por servicio especifico",
    "sueldo_base": 3000.0,
    "bono": 1800.0,
    "asignacion_familiar": 0,
    "regimen_pensionario": "*",
    "cuspp": "*",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Quispe Mamani, FRAN LUIS",
    "dni": "70292535",
    "fecha_nacimiento": "1997-07-10",
    "edad": 28,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Consorcio Zona 0, Mz. G, Lt.27",
    "email": "franluis.qm.19@gmail.com",
    "celular": "998 223 384",
    "contacto_familiar": "950 878 703",
    "cargo": "SEGURIDAD",
    "categoria": "Administrativo",
    "departamento": "SEGURIDAD",
    "tiempo_laborando": "126AÑOS 5MESES9DIAS",
    "empresa": "MISAGI SAC",
    "periodo_vacaciones": "2027-01-02",
    "tipo_contrato": "Sin contrato",
    "sueldo_base": 1500.0,
    "bono": 0.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 1500.0,
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  },
  {
    "nombres_completos": "Salinas Cerdán, CARLO MARCELO",
    "dni": "73378547",
    "fecha_nacimiento": "2003-03-09",
    "edad": 23,
    "estado_civil": "SOLTERO",
    "n_hijos": 0,
    "licencia": "0",
    "direccion": "Urb. La libertad Calle JM Cuadros DPTO 01 C LT 111",
    "email": "c4sal1n4s@gmail.com",
    "celular": "989 308 823",
    "cargo": "ASIST. MANTENIMIENTO",
    "categoria": "Mantenimiento",
    "departamento": "MANTENIMIENTO",
    "tiempo_laborando": "0AÑOS 8MESES8DIAS",
    "fecha_ingreso": "2025-10-01",
    "empresa": "MISAGI CARGO",
    "fecha_salida": "2026-01-31",
    "renovacion_contrato": "2026-06-30",
    "tipo_contrato": "Contrato por necesidad de mercado",
    "sueldo_base": 1200.0,
    "bono": 0.0,
    "asignacion_familiar": 0.0,
    "sueldo_final": 1200.0,
    "apto_empo": "NO PASO EMPO",
    "estado": "Activo"
  }
];


// ── State ─────────────────────────────────────────────────────
const state = {
  all: [], alerts: [],
  search:"", categoria:"", empresa:"",
  alertSev:"", alertTipo:"",
  conducta:[], condEmpFilter:"", condTipoFilter:"", boleta:null,
  loading:true, error:null, selected:null, view:"dashboard"
};
let charts = {};
let deleteId = null;

// ── Helpers ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (v,f='—') => v ? esc(v) : f;
const money = v => v ? 'S/ ' + Number(v).toLocaleString('es-PE',{minimumFractionDigits:2}) : '—';
const moneyShort = v => v ? 'S/ ' + Number(v).toLocaleString('es-PE',{maximumFractionDigits:0}) : '—';
const initials = n => { const p=String(n||'').replace(',',' ').trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'?'; };
const fmtDate = iso => { if(!iso) return '—'; const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; };

const TODAY = new Date(); TODAY.setHours(0,0,0,0);
function daysTo(iso) {
  if(!iso) return null;
  const d = new Date(iso+'T00:00:00');
  return Math.round((d - TODAY) / 86400000);
}
function daysToBirthday(iso) {
  if(!iso) return null;
  const [,m,d] = iso.split('-').map(Number);
  let next = new Date(TODAY.getFullYear(), m-1, d);
  if(next < TODAY) next = new Date(TODAY.getFullYear()+1, m-1, d);
  return Math.round((next - TODAY) / 86400000);
}

const CAT = {
  Conductor:      { pill:'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  Administrativo: { pill:'bg-navy-50 text-navy-700 ring-1 ring-navy-200' },
  Mantenimiento:  { pill:'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
};
const pill = (txt,cls) => `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}">${esc(txt)}</span>`;

let toastTimer;
function toast(msg, err=false) {
  const box=$("toast"); $("toastMsg").textContent=msg;
  box.firstElementChild.classList.toggle('bg-rose-700',err);
  box.firstElementChild.classList.toggle('bg-slate-900',!err);
  box.classList.remove('hidden'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>box.classList.add('hidden'),2800);
}

// ── Firestore CRUD ────────────────────────────────────────────
// ID determinista por colaborador: evita duplicados aunque 2 dispositivos
// hagan la carga inicial al mismo tiempo (setDoc sobre el mismo ID es idempotente)
const seedId = p => 'emp_' + (p.dni || String(p.nombres_completos).toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,40));

async function fetchAll() {
  state.loading=true; renderAll();
  try {
    let snap;
    try { snap = await getDocs(query(colRef, orderBy('nombres_completos'))); }
    catch { snap = await getDocs(colRef); }

    if (snap.empty) {
      // AUTO-SEED idempotente: setDoc con ID determinista → imposible duplicar
      toast('Primera carga: registrando ' + SEED_DATA.length + ' colaboradores…');
      for (const p of SEED_DATA) {
        const id = seedId(p);
        await setDoc(doc(db, COLLECTION, id), { ...p, _created: serverTimestamp() });
        state.all.push({ id, ...p });
      }
      state.all.sort((a,b)=>String(a.nombres_completos).localeCompare(b.nombres_completos));
      toast('✓ ' + SEED_DATA.length + ' colaboradores cargados');
    } else {
      state.all = snap.docs.map(d=>({id:d.id,...d.data()}));
      // AUTO-DEDUPE: limpia duplicados creados por versiones anteriores.
      // Agrupa por DNI (o nombre); conserva el doc editado más recientemente
      // (o el más antiguo si ninguno fue editado) y elimina el resto.
      const groups = {};
      for (const p of state.all) {
        const k = p.dni || String(p.nombres_completos||'').toLowerCase().trim();
        (groups[k] = groups[k] || []).push(p);
      }
      const toDelete = [];
      const keep = [];
      for (const k in groups) {
        const g = groups[k];
        if (g.length === 1) { keep.push(g[0]); continue; }
        g.sort((a,b)=>{
          const au=a._updated?.seconds||0, bu=b._updated?.seconds||0;
          if(au!==bu) return bu-au;                       // editado más reciente primero
          const ac=a._created?.seconds||0, bc=b._created?.seconds||0;
          return ac-bc;                                    // si no, el más antiguo
        });
        keep.push(g[0]);
        toDelete.push(...g.slice(1));
      }
      if (toDelete.length) {
        toast('Limpiando ' + toDelete.length + ' registros duplicados…');
        for (const d_ of toDelete) { try { await deleteDoc(doc(db, COLLECTION, d_.id)); } catch(_){} }
        state.all = keep;
        toast('✓ Duplicados eliminados (' + toDelete.length + ')');
      }
      state.all.sort((a,b)=>String(a.nombres_completos||'').localeCompare(String(b.nombres_completos||'')));
    }
    state.error=null;
    await fetchConducta();
  } catch(e) {
    state.error = e.code==='permission-denied' ? 'Sin permisos. Revisa reglas Firestore.' : 'Error: '+e.message;
  } finally {
    state.loading=false;
    computeAlerts();
    renderAll();
  }
}
async function saveDoc(id,data) {
  if(id){ await updateDoc(doc(db,COLLECTION,id),{...data,_updated:serverTimestamp()}); const i=state.all.findIndex(x=>x.id===id); if(i!==-1) state.all[i]={id,...data}; }
  else { const r=await addDoc(colRef,{...data,_created:serverTimestamp()}); state.all.push({id:r.id,...data}); }
  computeAlerts();
}
async function removeDoc(id) {
  await deleteDoc(doc(db,COLLECTION,id));
  state.all=state.all.filter(x=>x.id!==id);
  if(state.selected===id){state.selected=null;$("detailPanel").classList.add('hidden');}
  computeAlerts();
}

// ════════════════════════════════════════════════════════════════
//  MOTOR DE ALERTAS
// ════════════════════════════════════════════════════════════════
function computeAlerts() {
  const alerts=[];
  const add=(p,tipo,sev,titulo,detalle,dias=null)=>alerts.push({
    id:p.id, dni:p.dni, nombre:p.nombres_completos, cargo:p.cargo, categoria:p.categoria,
    tipo, sev, titulo, detalle, dias
  });

  for(const p of state.all) {
    if(String(p.estado).toLowerCase()!=='activo') continue;

    // ── 1. CONTRATOS ──
    if(p.tipo_contrato==='Sin contrato') {
      add(p,'Contrato','rojo','Sin contrato firmado','Regularizar situación contractual de inmediato');
    } else if(p.renovacion_contrato) {
      const d=daysTo(p.renovacion_contrato);
      if(d!==null){
        if(d<0)        add(p,'Contrato','rojo','Contrato vencido',`Venció el ${fmtDate(p.renovacion_contrato)} (hace ${-d} días)`,d);
        else if(d<=15) add(p,'Contrato','rojo','Contrato por vencer',`Vence el ${fmtDate(p.renovacion_contrato)} — en ${d} días`,d);
        else if(d<=45) add(p,'Contrato','amarillo','Renovación próxima',`Vence el ${fmtDate(p.renovacion_contrato)} — en ${d} días`,d);
        else           add(p,'Contrato','verde','Contrato vigente',`Próxima renovación: ${fmtDate(p.renovacion_contrato)}`,d);
      }
    } else if(p.tipo_contrato) {
      add(p,'Datos','amarillo','Falta fecha de renovación','Registrar fecha de renovación del contrato');
    }

    // ── 2. EMO ──
    const emo=(p.apto_empo||'').toUpperCase();
    if(emo.includes('NO PASO') || emo.includes('NO REALIZADO')) {
      add(p,'EMO','rojo','EMO pendiente','Programar examen médico ocupacional');
    } else if(emo.includes('RESTRI')) {
      add(p,'EMO','amarillo','Apto con restricciones','Verificar restricciones aplicables al puesto');
    } else if(emo==='APTO') {
      if(p.fecha_vcto_emo){
        const d=daysTo(p.fecha_vcto_emo);
        if(d<0)        add(p,'EMO','rojo','EMO vencido',`Venció el ${fmtDate(p.fecha_vcto_emo)}`,d);
        else if(d<=30) add(p,'EMO','amarillo','EMO por vencer',`Vence en ${d} días`,d);
        else           add(p,'EMO','verde','EMO vigente',`Vence: ${fmtDate(p.fecha_vcto_emo)}`,d);
      } else {
        add(p,'EMO','verde','EMO apto','Resultado: APTO');
      }
    } else if(!emo) {
      add(p,'Datos','amarillo','Sin registro EMO','Registrar resultado del examen médico');
    }

    // ── 3. LICENCIAS (solo conductores) ──
    if(p.categoria==='Conductor') {
      if(!p.licencia) {
        add(p,'Licencia','rojo','Conductor sin licencia registrada','Registrar número de brevete');
      } else if(p.licencia_vcto) {
        const d=daysTo(p.licencia_vcto);
        if(d<0)        add(p,'Licencia','rojo','Licencia vencida',`Venció el ${fmtDate(p.licencia_vcto)}`,d);
        else if(d<=30) add(p,'Licencia','rojo','Licencia por vencer',`Vence en ${d} días`,d);
        else if(d<=60) add(p,'Licencia','amarillo','Renovar licencia pronto',`Vence en ${d} días`,d);
        else           add(p,'Licencia','verde','Licencia vigente',`Vence: ${fmtDate(p.licencia_vcto)}`,d);
      } else {
        add(p,'Datos','amarillo','Falta vcto. de licencia',`Brevete ${p.licencia} sin fecha de vencimiento registrada`);
      }
    }

    // ── 4. VACACIONES ──
    if(p.periodo_vacaciones) {
      const d=daysTo(p.periodo_vacaciones);
      if(d!==null && d<-180)      add(p,'Vacaciones','rojo','Vacaciones acumuladas',`Período venció hace ${Math.round(-d/30)} meses sin goce registrado`,d);
      else if(d!==null && d<0)    add(p,'Vacaciones','amarillo','Vacaciones pendientes',`Período cumplido el ${fmtDate(p.periodo_vacaciones)}`,d);
      else if(d!==null && d<=60)  add(p,'Vacaciones','amarillo','Próximo período vacacional',`Cumple período en ${d} días`,d);
    }

    // ── 5. CUMPLEAÑOS ──
    const db_=daysToBirthday(p.fecha_nacimiento);
    if(db_!==null && db_<=30) {
      const sev = db_<=7 ? 'amarillo' : 'verde';
      add(p,'Cumpleaños',sev, db_===0?'¡Cumpleaños HOY! 🎂':`Cumpleaños en ${db_} días`, `Nació el ${fmtDate(p.fecha_nacimiento)}`, db_);
    }

    // ── 6. DATOS FALTANTES ──
    const faltantes=[];
    if(!p.dni) faltantes.push('DNI');
    if(!p.celular) faltantes.push('celular');
    if(!p.contacto_familiar) faltantes.push('contacto de emergencia');
    if(p.regimen_pensionario && p.regimen_pensionario!=='ONP' && !p.cuspp) faltantes.push('CUSPP');
    if(faltantes.length) add(p,'Datos','amarillo','Datos incompletos','Falta: '+faltantes.join(', '));
  }

  // sort: rojo > amarillo > verde, luego por días asc
  const sevOrder={rojo:0,amarillo:1,verde:2};
  alerts.sort((a,b)=> sevOrder[a.sev]-sevOrder[b.sev] || (a.dias??999)-(b.dias??999));
  state.alerts=alerts;

  // badge
  const rojas=alerts.filter(a=>a.sev==='rojo').length;
  const badge=$("alertBadge");
  if(rojas>0){ badge.textContent=rojas; badge.classList.remove('hidden'); badge.classList.add('inline-grid'); }
  else badge.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════════
//  RENDER: ALERTAS
// ════════════════════════════════════════════════════════════════
const SEV_STYLE = {
  rojo:     { border:'border-rose-200', bg:'bg-rose-50', icon:'🔴', text:'text-rose-700', chip:'bg-rose-100 text-rose-700' },
  amarillo: { border:'border-amber-200', bg:'bg-amber-50', icon:'🟡', text:'text-amber-700', chip:'bg-amber-100 text-amber-700' },
  verde:    { border:'border-emerald-200', bg:'bg-emerald-50', icon:'🟢', text:'text-emerald-700', chip:'bg-emerald-100 text-emerald-700' },
};

function renderAlerts() {
  const list=$("alertList");
  let rows=state.alerts;
  if(state.alertSev) rows=rows.filter(a=>a.sev===state.alertSev);
  if(state.alertTipo) rows=rows.filter(a=>a.tipo===state.alertTipo);
  $("alertCount").textContent=`${rows.length} alertas`;
  if(!rows.length){ list.innerHTML='<p class="col-span-full text-center text-sm text-slate-400 py-10">No hay alertas con estos filtros 🎉</p>'; return; }
  list.innerHTML=rows.map(a=>{
    const s=SEV_STYLE[a.sev];
    return `<div class="alert-card rounded-xl border ${s.border} bg-white p-4 cursor-pointer" data-goto="${a.id}">
      <div class="flex items-start justify-between gap-2 mb-2">
        <span class="text-lg leading-none">${s.icon}</span>
        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${s.chip}">${esc(a.tipo)}</span>
      </div>
      <p class="text-sm font-semibold ${s.text}">${esc(a.titulo)}</p>
      <p class="text-[12px] text-slate-500 mt-0.5 leading-snug">${esc(a.detalle)}</p>
      <div class="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
        <div class="h-6 w-6 rounded-full bg-navy-900 text-white grid place-items-center text-[9px] font-semibold shrink-0">${esc(initials(a.nombre))}</div>
        <div class="min-w-0">
          <p class="text-[12px] font-medium text-slate-700 truncate">${esc(a.nombre)}</p>
          <p class="text-[10px] text-slate-400 truncate">${esc(a.cargo||'')}</p>
        </div>
      </div>
    </div>`;
  }).join('');
  // click → ir a personal con detalle abierto
  list.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>{
    const p=state.all.find(x=>x.id===el.dataset.goto);
    if(p){ switchView('personal'); renderDetail(p); renderTable(); }
  }));
}

// ════════════════════════════════════════════════════════════════
//  RENDER: DASHBOARD (Chart.js)
// ════════════════════════════════════════════════════════════════
const NAVY='#1d3a5f', NAVY_L='#3a69a8', AMBER='#d97706', EMERALD='#059669', ROSE='#e11d48', SLATE='#94a3b8';

function destroyChart(k){ if(charts[k]){charts[k].destroy();delete charts[k];} }

function renderDashboard() {
  const a=state.all.filter(p=>String(p.estado).toLowerCase()==='activo');

  // KPIs
  $("kpiTotal").textContent=a.length;
  const sac=a.filter(p=>p.empresa==='MISAGI SAC').length;
  $("kpiTotalSub").textContent=`${sac} SAC · ${a.length-sac} CARGO`;
  const planilla=a.reduce((s,p)=>s+(p.sueldo_final||0),0);
  $("kpiPlanilla").textContent=moneyShort(planilla);
  $("kpiPlanillaSub").textContent='suma de sueldos finales';
  $("kpiCriticas").textContent=state.alerts.filter(x=>x.sev==='rojo').length;
  const evaluados=a.filter(p=>p.apto_empo);
  const aptos=evaluados.filter(p=>(p.apto_empo||'').toUpperCase().startsWith('APTO'));
  $("kpiEmo").textContent=evaluados.length?`${aptos.length}/${evaluados.length}`:'—';

  if(typeof Chart==='undefined') return;
  Chart.defaults.font.family="'Inter',sans-serif";
  Chart.defaults.font.size=11;
  Chart.defaults.color='#64748b';

  // Categoría doughnut
  const cats=['Conductor','Administrativo','Mantenimiento'];
  const catData=cats.map(c=>a.filter(p=>p.categoria===c).length);
  destroyChart('cat');
  charts.cat=new Chart($("chartCategoria"),{
    type:'doughnut',
    data:{labels:cats,datasets:[{data:catData,backgroundColor:[AMBER,NAVY,EMERALD],borderWidth:0}]},
    options:{maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:14}}}}
  });

  // Costo por empresa
  const emps=['MISAGI SAC','MISAGI CARGO'];
  const empCost=emps.map(e=>a.filter(p=>p.empresa===e).reduce((s,p)=>s+(p.sueldo_final||0),0));
  destroyChart('emp');
  charts.emp=new Chart($("chartEmpresa"),{
    type:'bar',
    data:{labels:emps,datasets:[{data:empCost,backgroundColor:[NAVY,NAVY_L],borderRadius:6,maxBarThickness:64}]},
    options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'S/ '+c.parsed.y.toLocaleString('es-PE')}}},
      scales:{y:{ticks:{callback:v=>'S/ '+(v/1000)+'k'},grid:{color:'#f1f5f9'}},x:{grid:{display:false}}}}
  });

  // Headcount por departamento
  const deptos={};
  a.forEach(p=>{const d=(p.departamento||'SIN DEPTO').trim();deptos[d]=(deptos[d]||0)+1;});
  const dLabels=Object.keys(deptos).sort((x,y)=>deptos[y]-deptos[x]);
  destroyChart('depto');
  charts.depto=new Chart($("chartDepto"),{
    type:'bar',
    data:{labels:dLabels,datasets:[{data:dLabels.map(d=>deptos[d]),backgroundColor:NAVY_L,borderRadius:5,maxBarThickness:26}]},
    options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{x:{ticks:{stepSize:1},grid:{color:'#f1f5f9'}},y:{grid:{display:false}}}}
  });

  // EMO status
  const emoGroups={'APTO':0,'Con restricciones':0,'No pasó / pendiente':0,'Sin registro':0};
  a.forEach(p=>{
    const e=(p.apto_empo||'').toUpperCase();
    if(e==='APTO') emoGroups['APTO']++;
    else if(e.includes('RESTRI')) emoGroups['Con restricciones']++;
    else if(e.includes('NO')) emoGroups['No pasó / pendiente']++;
    else emoGroups['Sin registro']++;
  });
  destroyChart('emo');
  charts.emo=new Chart($("chartEmo"),{
    type:'doughnut',
    data:{labels:Object.keys(emoGroups),datasets:[{data:Object.values(emoGroups),backgroundColor:[EMERALD,AMBER,ROSE,SLATE],borderWidth:0}]},
    options:{maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:10}}}}
  });
}

// ════════════════════════════════════════════════════════════════
//  RENDER: CONDUCTORES
// ════════════════════════════════════════════════════════════════
function renderConductores() {
  const cs=state.all.filter(p=>p.categoria==='Conductor'&&String(p.estado).toLowerCase()==='activo');
  $("condTotal").textContent=cs.length;
  const aptos=cs.filter(p=>(p.apto_empo||'').toUpperCase().startsWith('APTO'));
  $("condAptos").textContent=aptos.length;
  $("condNoAptos").textContent=cs.length-aptos.length;
  const porRenovar=cs.filter(p=>{const d=daysTo(p.renovacion_contrato);return d!==null&&d>=0&&d<=60;});
  $("condRenovar").textContent=porRenovar.length;

  const grid=$("condGrid");
  if(!cs.length){ grid.innerHTML='<p class="col-span-full text-center text-sm text-slate-400 py-10">No hay conductores registrados.</p>'; return; }

  grid.innerHTML=cs.map(p=>{
    const emo=(p.apto_empo||'').toUpperCase();
    const emoOk=emo==='APTO';
    const emoWarn=emo.includes('RESTRI');
    const dContrato=daysTo(p.renovacion_contrato);
    const semContrato = dContrato===null ? '⚪' : dContrato<15 ? '🔴' : dContrato<=45 ? '🟡' : '🟢';
    const semEmo = emoOk ? '🟢' : emoWarn ? '🟡' : '🔴';
    const semLic = p.licencia ? (p.licencia_vcto ? (daysTo(p.licencia_vcto)<30?'🔴':daysTo(p.licencia_vcto)<60?'🟡':'🟢') : '🟡') : '🔴';
    return `<div class="alert-card rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer" data-goto="${p.id}">
      <div class="bg-navy-950 px-4 py-3 flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-white/10 text-white grid place-items-center text-sm font-bold shrink-0">${esc(initials(p.nombres_completos))}</div>
        <div class="min-w-0">
          <p class="text-white text-[13px] font-semibold truncate">${esc(p.nombres_completos)}</p>
          <p class="text-white/50 text-[11px]">${esc(p.empresa||'')} · DNI ${esc(p.dni||'—')}</p>
        </div>
      </div>
      <div class="px-4 py-3 space-y-2">
        <div class="flex items-center justify-between text-[12px]">
          <span class="text-slate-400">Brevete</span>
          <span class="font-mono text-slate-700">${semLic} ${esc(p.licencia||'Sin registro')}</span>
        </div>
        <div class="flex items-center justify-between text-[12px]">
          <span class="text-slate-400">EMO</span>
          <span class="text-slate-700">${semEmo} ${esc(p.apto_empo||'Sin registro')}</span>
        </div>
        <div class="flex items-center justify-between text-[12px]">
          <span class="text-slate-400">Contrato</span>
          <span class="text-slate-700">${semContrato} ${p.renovacion_contrato?'Renov. '+fmtDate(p.renovacion_contrato):esc(p.tipo_contrato||'—')}</span>
        </div>
        <div class="flex items-center justify-between text-[12px] pt-2 border-t border-slate-100">
          <span class="text-slate-400">Sueldo final</span>
          <span class="font-semibold text-slate-800">${money(p.sueldo_final)}</span>
        </div>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>{
    const p=state.all.find(x=>x.id===el.dataset.goto);
    if(p){ switchView('personal'); renderDetail(p); renderTable(); }
  }));
}

// ════════════════════════════════════════════════════════════════
//  RENDER: PERSONAL (tabla + detalle)
// ════════════════════════════════════════════════════════════════
function getFiltered() {
  const q=state.search.trim().toLowerCase();
  return state.all.filter(p=>{
    const okC=!state.categoria||p.categoria===state.categoria;
    const okE=!state.empresa||p.empresa===state.empresa;
    const okQ=!q||[p.nombres_completos,p.dni,p.cargo,p.departamento].some(v=>String(v||'').toLowerCase().includes(q));
    return okC&&okE&&okQ;
  });
}

function skeleton(n=6){let o='';for(let i=0;i<n;i++)o+=`<tr><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="skel h-8 w-8 rounded-full"></div><div class="skel h-3.5 w-36 rounded"></div></div></td><td class="px-4 py-3"><div class="skel h-3.5 w-28 rounded"></div></td><td class="px-4 py-3"><div class="skel h-5 w-20 rounded-full"></div></td><td class="px-4 py-3 hidden lg:table-cell"><div class="skel h-3.5 w-20 rounded"></div></td><td class="px-4 py-3 hidden xl:table-cell"><div class="skel h-3.5 w-16 rounded"></div></td><td class="px-4 py-3"><div class="skel h-5 w-12 rounded-full"></div></td><td></td></tr>`;return o;}

function renderTable() {
  const tbody=$("tbody");
  if(state.loading){tbody.innerHTML=skeleton();$("count").textContent='Cargando…';return;}
  if(state.error){tbody.innerHTML=`<tr><td colspan="7" class="px-4 py-10 text-center text-sm text-rose-600">${esc(state.error)}</td></tr>`;return;}
  const rows=getFiltered();
  $("count").textContent=`${rows.length} de ${state.all.length} colaboradores`;
  if(!rows.length){tbody.innerHTML=`<tr><td colspan="7" class="px-4 py-10 text-center text-sm text-slate-400">${state.all.length===0?'Sin datos. Ejecuta el seeder.':'Sin coincidencias.'}</td></tr>`;return;}
  tbody.innerHTML=rows.map(p=>{
    const c=CAT[p.categoria]||{pill:'bg-slate-100 text-slate-500 ring-1 ring-slate-200'};
    const activo=String(p.estado||'').toLowerCase()==='activo';
    const sel=state.selected===p.id;
    return `<tr class="row-hover cursor-pointer transition-colors ${sel?'bg-navy-50':''}" data-id="${p.id}">
      <td class="px-4 py-3"><div class="flex items-center gap-3">
        <div class="h-8 w-8 shrink-0 rounded-full bg-navy-900 text-white grid place-items-center text-[11px] font-semibold">${esc(initials(p.nombres_completos))}</div>
        <div class="min-w-0"><p class="font-medium text-slate-800 truncate text-sm">${fmt(p.nombres_completos)}</p>
        <p class="text-[12px] text-slate-400 truncate">${p.dni?'DNI '+p.dni:(p.email||'')}</p></div></div></td>
      <td class="px-4 py-3 text-slate-600 text-sm">${fmt(p.cargo)}</td>
      <td class="px-4 py-3">${pill(p.categoria||'—',c.pill)}</td>
      <td class="px-4 py-3 text-slate-500 text-sm hidden lg:table-cell">${fmt(p.empresa)}</td>
      <td class="px-4 py-3 text-slate-700 text-sm font-medium hidden xl:table-cell">${money(p.sueldo_final)}</td>
      <td class="px-4 py-3">${activo?'<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>Activo</span>':'<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500 ring-1 ring-slate-200">Inactivo</span>'}</td>
      <td class="px-4 py-3"><div class="flex items-center justify-end gap-0.5">
        <button data-edit="${p.id}" class="p-1.5 rounded text-slate-400 hover:text-navy-700 hover:bg-navy-50 transition" aria-label="Editar"><svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5V16h2.5L15 7.5 12.5 5 4 13.5zM11.5 6l2.5 2.5"/></svg></button>
        <button data-del="${p.id}" class="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" aria-label="Eliminar"><svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h8M8 7V5h4v2M8 10v5M12 10v5M5 7l1 9h8l1-9"/></svg></button>
      </div></td></tr>`;
  }).join('');
}

function renderDetail(p) {
  const panel=$("detailPanel");
  if(!p){panel.classList.add('hidden');return;}
  state.selected=p.id;
  const activo=String(p.estado||'').toLowerCase()==='activo';
  const cat=CAT[p.categoria]||{pill:'bg-slate-100 text-slate-500 ring-1 ring-slate-200'};
  const myAlerts=state.alerts.filter(a=>a.id===p.id&&a.sev!=='verde');

  const row=(l,v,mono=false)=>v?`<div class="flex justify-between items-start py-2 border-b border-slate-100 last:border-0 gap-4"><span class="text-[12px] text-slate-400 shrink-0">${l}</span><span class="text-[13px] ${mono?'font-mono':''} text-slate-700 text-right">${esc(String(v))}</span></div>`:'';

  panel.innerHTML=`
    <div class="bg-navy-950 px-5 pt-5 pb-4">
      <div class="flex items-start justify-between mb-3">
        <div class="h-12 w-12 rounded-xl bg-white/10 text-white grid place-items-center text-base font-bold">${esc(initials(p.nombres_completos))}</div>
        <button id="btnCloseDetail" class="text-white/50 hover:text-white/90 transition p-1 -mt-1 -mr-1 rounded" aria-label="Cerrar"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg></button>
      </div>
      <h3 class="text-white font-semibold text-[15px] leading-tight">${fmt(p.nombres_completos)}</h3>
      <p class="text-white/60 text-[13px] mt-0.5">${fmt(p.cargo)}</p>
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white/10 text-white ring-1 ring-white/20">${esc(p.categoria||'—')}</span>
        ${activo?'<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"><span class="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>Activo</span>':'<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white/10 text-white/60 ring-1 ring-white/20">Inactivo</span>'}
        ${p.empresa?`<span class="text-[11px] text-white/50">${esc(p.empresa)}</span>`:''}
      </div>
    </div>
    <div class="px-5 py-3">
      ${myAlerts.length?`
      <div class="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5 mb-3">
        <p class="text-[11px] font-semibold text-rose-600 uppercase tracking-wide mb-1.5">⚠ ${myAlerts.length} alerta${myAlerts.length>1?'s':''} activa${myAlerts.length>1?'s':''}</p>
        ${myAlerts.slice(0,4).map(a=>`<p class="text-[12px] text-rose-700 leading-snug mb-0.5">${a.sev==='rojo'?'🔴':'🟡'} ${esc(a.titulo)}</p>`).join('')}
      </div>`:''}
      ${p.sueldo_final?`
      <div class="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 mb-4">
        <p class="text-[11px] font-medium text-emerald-600 uppercase tracking-wide mb-1">Sueldo final</p>
        <p class="text-2xl font-bold text-emerald-700">${money(p.sueldo_final)}</p>
        <div class="flex flex-wrap gap-x-4 mt-1.5">
          ${p.sueldo_base?`<span class="text-[12px] text-emerald-600">Base: ${money(p.sueldo_base)}</span>`:''}
          ${p.bono?`<span class="text-[12px] text-emerald-600">Bono: ${money(p.bono)}</span>`:''}
          ${p.asignacion_familiar?`<span class="text-[12px] text-emerald-600">Asig.: ${money(p.asignacion_familiar)}</span>`:''}
        </div>
      </div>`:''}
      <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1 mt-3">Personal</p>
      <div class="rounded-lg bg-slate-50 px-3 py-1 mb-3">
        ${row('DNI',p.dni,true)}${row('Nacimiento',fmtDate(p.fecha_nacimiento))}${row('Edad',p.edad?p.edad+' años':null)}
        ${row('Estado civil',p.estado_civil)}${row('Hijos',p.n_hijos!=null?p.n_hijos:null)}${row('Sangre',p.tipo_sangre)}
        ${row('Celular',p.celular)}${row('Correo',p.email)}${row('Dirección',p.direccion)}${row('Contacto familiar',p.contacto_familiar)}
      </div>
      <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Laboral</p>
      <div class="rounded-lg bg-slate-50 px-3 py-1 mb-3">
        ${row('Departamento',p.departamento)}${row('Tiempo laborando',p.tiempo_laborando)}
        ${row('Ingreso',fmtDate(p.fecha_ingreso))}${row('Renovación contrato',fmtDate(p.renovacion_contrato))}
        ${row('Tipo contrato',p.tipo_contrato)}${row('Licencia',p.licencia,true)}
        ${row('Vcto. licencia',p.licencia_vcto?fmtDate(p.licencia_vcto):null)}
        ${row('Período vacacional',p.periodo_vacaciones?fmtDate(p.periodo_vacaciones):null)}
        ${row('Días vacaciones',p.dias_vacaciones)}
      </div>
      <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Pensiones & salud</p>
      <div class="rounded-lg bg-slate-50 px-3 py-1 mb-3">
        ${row('Régimen',p.regimen_pensionario)}${row('CUSPP',p.cuspp,true)}${row('EMO',p.apto_empo)}
        ${row('Vcto. EMO',p.fecha_vcto_emo?fmtDate(p.fecha_vcto_emo):null)}
        ${row('Peso',p.peso?p.peso+' kg':null)}${row('Estatura',p.estatura?p.estatura+' m':null)}
      </div>
      ${p.observaciones?`<p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Observaciones</p><div class="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-[13px] text-amber-800 mb-3">${esc(p.observaciones)}</div>`:''}
      <div class="flex gap-2 mt-4 pb-1">
        <button data-edit="${p.id}" class="flex-1 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium py-2 hover:bg-navy-50 transition">Editar</button>
        <button data-del="${p.id}" class="flex-1 rounded-lg border border-rose-200 text-rose-600 text-sm font-medium py-2 hover:bg-rose-50 transition">Eliminar</button>
      </div>
    </div>`;
  panel.classList.remove('hidden');
  panel.classList.add('slide-in');
  setTimeout(()=>panel.classList.remove('slide-in'),300);
  $("btnCloseDetail")?.addEventListener('click',()=>{state.selected=null;panel.classList.add('hidden');renderTable();});
  panel.querySelectorAll('[data-edit]').forEach(el=>el.addEventListener('click',()=>openModal(state.all.find(x=>x.id===el.dataset.edit))));
  panel.querySelectorAll('[data-del]').forEach(el=>el.addEventListener('click',()=>openDelete(state.all.find(x=>x.id===el.dataset.del))));
}


// ════════════════════════════════════════════════════════════════
//  MÓDULO: BOLETAS DE PAGO
// ════════════════════════════════════════════════════════════════
const MESES = {  '01':'ENERO','02':'FEBRERO','03':'MARZO','04':'ABRIL','05':'MAYO','06':'JUNIO',
  '07':'JULIO','08':'AGOSTO','09':'SEPTIEMBRE','10':'OCTUBRE','11':'NOVIEMBRE','12':'DICIEMBRE' };

function tasaPension(regimen) {
  const r = (regimen||'').toUpperCase();
  if (r === 'ONP') return { nombre:'ONP 13%', tasa:0.13 };
  if (['PRIMA','HABITAT','INTEGRA','PROFUTURO'].includes(r)) return { nombre:'AFP '+r+' 11.74%', tasa:0.1174 };
  return { nombre:'Sin régimen', tasa:0 };
}

function fillBoletasSelect() {
  const sel = $("bolEmp");
  const activos = state.all.filter(p=>String(p.estado).toLowerCase()==='activo')
    .sort((a,b)=>String(a.nombres_completos).localeCompare(b.nombres_completos));
  sel.innerHTML = '<option value="">— Seleccionar —</option>' +
    activos.map(p=>`<option value="${p.id}">${esc(p.nombres_completos)} · ${esc(p.cargo||'')}</option>`).join('');
}

function generarBoleta() {
  const p = state.all.find(x=>x.id===$("bolEmp").value);
  if(!p){ toast('Selecciona un colaborador', true); return; }
  const mes = $("bolMes").value, anio = $("bolAnio").value;
  const dias = parseFloat($("bolDias").value)||30;
  const he = parseFloat($("bolHE").value)||0;
  const otros = parseFloat($("bolOtros").value)||0;
  const descAdic = parseFloat($("bolDesc").value)||0;

  const base = p.sueldo_base||0;
  const proporcional = base * (dias/30);
  const bono = p.bono||0;
  const asig = p.asignacion_familiar||0;
  const totalIngresos = proporcional + bono + asig + he + otros;

  const pen = tasaPension(p.regimen_pensionario);
  const dctoPension = totalIngresos * pen.tasa;
  const totalDesc = dctoPension + descAdic;
  const neto = totalIngresos - totalDesc;
  const essalud = totalIngresos * 0.09;

  const F = v => 'S/ ' + v.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});

  $("bolPreview").innerHTML = `
  <div class="w-full max-w-[640px] mx-auto text-[12px]" style="font-family:Inter,sans-serif">
    <div class="flex items-start justify-between border-b-2 border-navy-900 pb-3 mb-4">
      <div>
        <p class="font-bold text-navy-900 text-base">${esc(p.empresa||'MISAGI S.A.C.')}</p>
        <p class="text-slate-500 text-[11px]">RUC 20610685847 · Cerro Colorado, Arequipa</p>
      </div>
      <div class="text-right">
        <p class="font-bold text-slate-800">BOLETA DE PAGO</p>
        <p class="text-slate-500 text-[11px]">${MESES[mes]} ${anio}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-6 gap-y-1 mb-4">
      <p><span class="text-slate-400">Colaborador:</span> <strong>${esc(p.nombres_completos)}</strong></p>
      <p><span class="text-slate-400">DNI:</span> ${esc(p.dni||'—')}</p>
      <p><span class="text-slate-400">Cargo:</span> ${esc(p.cargo||'—')}</p>
      <p><span class="text-slate-400">Fecha ingreso:</span> ${fmtDate(p.fecha_ingreso)}</p>
      <p><span class="text-slate-400">Régimen:</span> ${esc(pen.nombre)}</p>
      <p><span class="text-slate-400">Días laborados:</span> ${dias}</p>
    </div>
    <table class="w-full mb-1">
      <tr class="bg-navy-900 text-white"><td class="px-3 py-1.5 font-semibold" colspan="2">INGRESOS</td></tr>
      <tr class="border-b border-slate-100"><td class="px-3 py-1.5">Sueldo básico ${dias<30?`(proporcional ${dias}/30)`:''}</td><td class="px-3 py-1.5 text-right font-mono">${F(proporcional)}</td></tr>
      ${bono?`<tr class="border-b border-slate-100"><td class="px-3 py-1.5">Bonificación</td><td class="px-3 py-1.5 text-right font-mono">${F(bono)}</td></tr>`:''}
      ${asig?`<tr class="border-b border-slate-100"><td class="px-3 py-1.5">Asignación familiar</td><td class="px-3 py-1.5 text-right font-mono">${F(asig)}</td></tr>`:''}
      ${he?`<tr class="border-b border-slate-100"><td class="px-3 py-1.5">Horas extras</td><td class="px-3 py-1.5 text-right font-mono">${F(he)}</td></tr>`:''}
      ${otros?`<tr class="border-b border-slate-100"><td class="px-3 py-1.5">Otros ingresos</td><td class="px-3 py-1.5 text-right font-mono">${F(otros)}</td></tr>`:''}
      <tr class="bg-slate-50 font-semibold"><td class="px-3 py-1.5">TOTAL INGRESOS</td><td class="px-3 py-1.5 text-right font-mono">${F(totalIngresos)}</td></tr>
      <tr class="bg-navy-900 text-white"><td class="px-3 py-1.5 font-semibold" colspan="2">DESCUENTOS</td></tr>
      <tr class="border-b border-slate-100"><td class="px-3 py-1.5">${esc(pen.nombre)}</td><td class="px-3 py-1.5 text-right font-mono">${F(dctoPension)}</td></tr>
      ${descAdic?`<tr class="border-b border-slate-100"><td class="px-3 py-1.5">Descuentos / adelantos</td><td class="px-3 py-1.5 text-right font-mono">${F(descAdic)}</td></tr>`:''}
      <tr class="bg-slate-50 font-semibold"><td class="px-3 py-1.5">TOTAL DESCUENTOS</td><td class="px-3 py-1.5 text-right font-mono">${F(totalDesc)}</td></tr>
      <tr class="bg-emerald-600 text-white text-sm font-bold"><td class="px-3 py-2">NETO A PAGAR</td><td class="px-3 py-2 text-right font-mono">${F(neto)}</td></tr>
    </table>
    <p class="text-[10px] text-slate-400 mb-5">Aporte empleador EsSalud (9%): ${F(essalud)} — no se descuenta al trabajador. Documento referencial generado por el Sistema RRHH MISAGI.</p>
    <div class="grid grid-cols-2 gap-10 mt-10 pt-6">
      <div class="border-t border-slate-300 pt-1 text-center text-[11px] text-slate-500">EMPLEADOR</div>
      <div class="border-t border-slate-300 pt-1 text-center text-[11px] text-slate-500">TRABAJADOR<br>${esc(p.nombres_completos)} · DNI ${esc(p.dni||'')}</div>
    </div>
  </div>`;
  $("bolImprimir").classList.remove('hidden');
}

// ════════════════════════════════════════════════════════════════
//  MÓDULO: HISTORIAL DE CONDUCTA
// ════════════════════════════════════════════════════════════════
async function fetchConducta() {
  try {
    const snap = await getDocs(conductaRef);
    state.conducta = snap.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||'')));
  } catch(e) { console.warn('conducta:', e.message); state.conducta=[]; }
}

const TIPO_CONDUCTA_STYLE = {
  'Llamada de atención verbal':  'bg-amber-50 text-amber-700 ring-amber-200',
  'Llamada de atención escrita': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Memorándum':                  'bg-rose-50 text-rose-700 ring-rose-200',
  'Suspensión':                  'bg-rose-100 text-rose-800 ring-rose-300',
  'Descargo':                    'bg-navy-50 text-navy-700 ring-navy-200',
  'Felicitación':                'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

function fillConductaSelects() {
  const activos = state.all.slice().sort((a,b)=>String(a.nombres_completos).localeCompare(b.nombres_completos));
  const opts = activos.map(p=>`<option value="${esc(p.dni||p.id)}">${esc(p.nombres_completos)}</option>`).join('');
  $("c_dni").innerHTML = '<option value="">— Seleccionar —</option>' + opts;
  $("condFiltroEmp").innerHTML = '<option value="">Todos los colaboradores</option>' + opts;
}

function renderConducta() {
  const list = $("conductaList");
  let rows = state.conducta;
  if (state.condEmpFilter)  rows = rows.filter(c=>c.dni===state.condEmpFilter);
  if (state.condTipoFilter) rows = rows.filter(c=>c.tipo===state.condTipoFilter);
  if (!rows.length) {
    list.innerHTML = '<div class="bg-white rounded-xl border border-slate-200 py-12 text-center text-sm text-slate-400">Sin incidencias registradas' + (state.condEmpFilter||state.condTipoFilter?' con estos filtros':'') + '.</div>';
    return;
  }
  list.innerHTML = rows.map(c=>{
    const sty = TIPO_CONDUCTA_STYLE[c.tipo] || 'bg-slate-100 text-slate-600 ring-slate-200';
    return `<div class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-3">
      <div class="h-9 w-9 shrink-0 rounded-full bg-navy-900 text-white grid place-items-center text-[10px] font-semibold mt-0.5">${esc(initials(c.nombre))}</div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-sm font-medium text-slate-800">${esc(c.nombre)}</p>
          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${sty}">${esc(c.tipo)}</span>
          <span class="text-[12px] text-slate-400 ml-auto">${fmtDate(c.fecha)}</span>
        </div>
        <p class="text-[13px] text-slate-700 mt-1">${esc(c.motivo||'')}</p>
        ${c.detalle?`<p class="text-[12px] text-slate-500 mt-0.5">${esc(c.detalle)}</p>`:''}
        ${c.documento?`<p class="text-[11px] text-slate-400 mt-1 font-mono">${esc(c.documento)}</p>`:''}
      </div>
      <button data-del-cond="${c.id}" class="p-1.5 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition shrink-0" aria-label="Eliminar">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h8M8 7V5h4v2M8 10v5M12 10v5M5 7l1 9h8l1-9"/></svg>
      </button>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-del-cond]').forEach(el=>el.addEventListener('click', async ()=>{
    if(!confirm('¿Eliminar este registro de conducta?')) return;
    try { await deleteDoc(doc(db,'conducta_misagi',el.dataset.delCond));
      state.conducta = state.conducta.filter(x=>x.id!==el.dataset.delCond);
      renderConducta(); toast('Registro eliminado');
    } catch(e){ toast('Error al eliminar',true); }
  }));
}

// ════════════════════════════════════════════════════════════════
//  VIEW SWITCHING
// ════════════════════════════════════════════════════════════════
function switchView(v) {
  state.view=v;
  document.querySelectorAll('.view').forEach(el=>el.classList.add('hidden'));
  $("view-"+v).classList.remove('hidden');
  $("view-"+v).classList.add('fade-in');
  document.querySelectorAll('.navtab').forEach(t=>t.classList.toggle('active',t.dataset.view===v));
  if(v==='dashboard') renderDashboard();
  if(v==='alertas') renderAlerts();
  if(v==='conductores') renderConductores();
  if(v==='personal') renderTable();
  if(v==='boletas') fillBoletasSelect();
  if(v==='conducta'){ fillConductaSelects(); renderConducta(); }
  // CTS está integrado nativo en el DOM; no requiere inicialización
}

function renderAll() {
  renderTable();
  if(state.view==='dashboard') renderDashboard();
  if(state.view==='alertas') renderAlerts();
  if(state.view==='conductores') renderConductores();
}

// ════════════════════════════════════════════════════════════════
//  MODAL CRUD
// ════════════════════════════════════════════════════════════════
const FIELDS=['nombres_completos','dni','fecha_nacimiento','estado_civil','n_hijos','celular','email','direccion','tipo_sangre','contacto_familiar','cargo','categoria','departamento','empresa','fecha_ingreso','renovacion_contrato','tipo_contrato','licencia','licencia_vcto','estado','sueldo_base','bono','asignacion_familiar','sueldo_final','regimen_pensionario','cuspp','peso','estatura','apto_empo','fecha_vcto_emo','observaciones'];
const SELECTS=['categoria','estado','empresa','tipo_contrato','estado_civil','regimen_pensionario','apto_empo'];

function openModal(rec=null) {
  $("form").reset();
  $("f_id").value=rec?.id||'';
  $("modalTitle").textContent=rec?'Editar colaborador':'Nuevo colaborador';
  $("btnSaveLabel").textContent=rec?'Guardar cambios':'Crear';
  $("f_categoria").value=rec?.categoria||'Administrativo';
  $("f_estado").value=rec?.estado||'Activo';
  $("f_empresa").value=rec?.empresa||'MISAGI SAC';
  SELECTS.forEach(f=>{if(!['categoria','estado','empresa'].includes(f))$("f_"+f).value=rec?.[f]||'';});
  if(rec)FIELDS.forEach(f=>{const el=$("f_"+f);if(el&&!SELECTS.includes(f))el.value=rec[f]??'';});
  $("modal").classList.remove('hidden');
  setTimeout(()=>$("f_nombres_completos").focus(),50);
}
const closeModal=()=>$("modal").classList.add('hidden');

$("form").addEventListener('submit',async e=>{
  e.preventDefault();
  const id=$("f_id").value;
  const data={};
  FIELDS.forEach(f=>{
    const el=$("f_"+f);if(!el)return;
    const v=el.value.trim();if(v==='')return;
    if(['n_hijos','sueldo_base','bono','asignacion_familiar','sueldo_final','peso','estatura'].includes(f)) data[f]=parseFloat(v)||0;
    else data[f]=v;
  });
  if(!data.estado)data.estado='Activo';
  $("btnSave").disabled=true;$("btnSaveLabel").textContent='Guardando…';
  try{
    await saveDoc(id,data);
    toast(id?'Actualizado ✓':'Creado ✓');
    closeModal();renderAll();
  }catch(err){toast('Error: '+err.message,true);}
  finally{$("btnSave").disabled=false;$("btnSaveLabel").textContent=id?'Guardar cambios':'Crear';}
});

function openDelete(rec){deleteId=rec.id;$("delName").textContent=rec.nombres_completos||'este colaborador';$("modalDelete").classList.remove('hidden');}
const closeDelete=()=>{$("modalDelete").classList.add('hidden');deleteId=null;};

$("btnConfirmDelete").addEventListener('click',async()=>{
  if(!deleteId)return;
  $("btnConfirmDelete").disabled=true;$("btnConfirmDelete").textContent='Eliminando…';
  try{await removeDoc(deleteId);toast('Eliminado');closeDelete();renderAll();}
  catch(e){toast('Error al eliminar',true);}
  finally{$("btnConfirmDelete").disabled=false;$("btnConfirmDelete").textContent='Eliminar';}
});

// ════════════════════════════════════════════════════════════════
//  EVENT WIRING
// ════════════════════════════════════════════════════════════════
document.querySelectorAll('.navtab').forEach(t=>t.addEventListener('click',()=>switchView(t.dataset.view)));

$("search").addEventListener('input',e=>{state.search=e.target.value;renderTable();});
$("filterCat").addEventListener('change',e=>{state.categoria=e.target.value;renderTable();});
$("filterEmp").addEventListener('change',e=>{state.empresa=e.target.value;renderTable();});
$("btnNew").addEventListener('click',()=>openModal());

document.querySelectorAll('.alert-filter').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.alert-filter').forEach(x=>{x.classList.remove('bg-navy-900','text-white');x.classList.add('text-slate-500');});
  b.classList.add('bg-navy-900','text-white');b.classList.remove('text-slate-500');
  state.alertSev=b.dataset.sev;renderAlerts();
}));
$("alertTipoFilter").addEventListener('change',e=>{state.alertTipo=e.target.value;renderAlerts();});

document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',closeModal));
document.querySelectorAll('[data-close-del]').forEach(el=>el.addEventListener('click',closeDelete));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeDelete();}});

$("tbody").addEventListener('click',e=>{
  const ed=e.target.closest('[data-edit]');
  const dl=e.target.closest('[data-del]');
  const tr=e.target.closest('tr[data-id]');
  if(ed){openModal(state.all.find(x=>x.id===ed.dataset.edit));return;}
  if(dl){openDelete(state.all.find(x=>x.id===dl.dataset.del));return;}
  if(tr){const p=state.all.find(x=>x.id===tr.dataset.id);if(p){renderDetail(p);renderTable();}}
});

// ── Eventos: Boletas ──
$("bolGenerar").addEventListener('click', generarBoleta);
$("bolImprimir").addEventListener('click', ()=>{
  document.body.classList.add('printing-boleta');
  const clean = ()=>document.body.classList.remove('printing-boleta');
  window.addEventListener('afterprint', clean, { once:true });
  window.print();
  setTimeout(clean, 2000); // respaldo por si afterprint no dispara
});

// ── Eventos: Conducta ──
$("btnNuevaConducta").addEventListener('click', ()=>{
  $("formConducta").reset();
  $("c_fecha").value = new Date().toISOString().slice(0,10);
  $("modalConducta").classList.remove('hidden');
});
document.querySelectorAll('[data-close-cond]').forEach(el=>el.addEventListener('click',()=>$("modalConducta").classList.add('hidden')));

$("formConducta").addEventListener('submit', async e=>{
  e.preventDefault();
  const dni = $("c_dni").value;
  const p = state.all.find(x=>(x.dni||x.id)===dni);
  if(!p){ toast('Selecciona un colaborador', true); return; }
  const data = {
    dni, nombre: p.nombres_completos,
    fecha: $("c_fecha").value,
    tipo: $("c_tipo").value,
    motivo: $("c_motivo").value.trim(),
    detalle: $("c_detalle").value.trim(),
    documento: $("c_documento").value.trim(),
    _created: serverTimestamp(),
  };
  $("btnSaveConducta").disabled = true;
  try {
    const ref = await addDoc(conductaRef, data);
    state.conducta.unshift({ id: ref.id, ...data });
    $("modalConducta").classList.add('hidden');
    renderConducta();
    toast('Incidencia registrada ✓');
  } catch(err){ toast('Error: '+err.message, true); }
  finally { $("btnSaveConducta").disabled = false; }
});

$("condFiltroEmp").addEventListener('change', e=>{ state.condEmpFilter=e.target.value; renderConducta(); });
$("condFiltroTipo").addEventListener('change', e=>{ state.condTipoFilter=e.target.value; renderConducta(); });

// ════════════════════════════════════════════════════════════════
//  LOGIN GATE (SHA-256)
// ════════════════════════════════════════════════════════════════
// Hash SHA-256 de la contraseña de acceso (la contraseña en texto plano
// NO está en el código; solo su huella criptográfica).
const AUTH_HASH = "6a59071c7cf7c185c37485f0a8062bf2f605aa7e2be0f1f1e7daa915b0516d2c";
const AUTH_KEY  = "msg_rrhh_auth";

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function tryLogin() {
  const input = $("loginPwd").value;
  const hash = await sha256(input);
  if (hash === AUTH_HASH) {
    localStorage.setItem(AUTH_KEY, hash);
    $("loginGate").classList.add('hidden');
    fetchAll();
  } else {
    $("loginError").classList.remove('hidden');
    $("loginPwd").value = '';
    $("loginPwd").focus();
  }
}

$("loginBtn").addEventListener('click', tryLogin);
$("loginPwd").addEventListener('keydown', e=>{ if(e.key==='Enter') tryLogin(); });
$("loginPwd").addEventListener('input', ()=>$("loginError").classList.add('hidden'));

// ── Boot ──
if (localStorage.getItem(AUTH_KEY) === AUTH_HASH) {
  $("loginGate").classList.add('hidden');
  fetchAll();
} else {
  setTimeout(()=>$("loginPwd").focus(), 100);
}
