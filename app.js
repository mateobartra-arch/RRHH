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
const boletasRef  = collection(db, "boletas_misagi");

// Tasas AFP/ONP Perú (calibradas con boleta real MISAGI mayo 2026)
// Base afecta = Básico(proporcional) + Asig.Fam + Trabajo en día feriado
const AFP_RATES = {
  PRIMA:     { aporte:0.10, seguro:0.013698, comision:0.0160 },
  INTEGRA:   { aporte:0.10, seguro:0.013698, comision:0.015501 },
  PROFUTURO: { aporte:0.10, seguro:0.013698, comision:0.0169 },
  HABITAT:   { aporte:0.10, seguro:0.013698, comision:0.0147 },
};
const ONP_RATE = 0.13;
const ESSALUD_RATE = 0.09;
const MISAGI_LOGO = "data:image/jpeg;base64,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";

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
  conducta:[], condEmpFilter:"", condTipoFilter:"", boleta:null, boletas:[], boletaActual:null,
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
    // aplicar ediciones locales de Base de Datos (localStorage) si existen
    if (window.__dbOverride && Array.isArray(window.__dbOverride)) {
      const byId = {}; window.__dbOverride.forEach(x=>{ if(x.id) byId[x.id]=x; });
      state.all = state.all.map(p => byId[p.id] ? { ...p, ...byId[p.id] } : p);
    }
    await fetchConducta();
    await fetchBoletas();
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
//  MÓDULO: BOLETAS DE PAGO (formato SUNAT · AFP / ONP)
// ════════════════════════════════════════════════════════════════
const MESES = { '01':'ENERO','02':'FEBRERO','03':'MARZO','04':'ABRIL','05':'MAYO','06':'JUNIO',
  '07':'JULIO','08':'AGOSTO','09':'SEPTIEMBRE','10':'OCTUBRE','11':'NOVIEMBRE','12':'DICIEMBRE' };
const DIAS_MES = { '01':31,'02':28,'03':31,'04':30,'05':31,'06':30,'07':31,'08':31,'09':30,'10':31,'11':30,'12':31 };

function fillBoletasSelect() {
  const sel = $("bolEmp");
  const activos = state.all.filter(p=>String(p.estado).toLowerCase()==='activo')
    .sort((a,b)=>String(a.nombres_completos).localeCompare(b.nombres_completos));
  sel.innerHTML = '<option value="">— Seleccionar —</option>' +
    activos.map(p=>`<option value="${p.id}">${esc(p.nombres_completos)} · ${esc(p.cargo||'')}</option>`).join('');
  fillBoletaHistMeses();
  renderBoletaHist();
}

// Detecta régimen: AFP (PRIMA/INTEGRA/...) u ONP
function detectRegimen(p) {
  const r = (p.regimen_pensionario||'').toUpperCase().trim();
  if (r === 'ONP') return { tipo:'ONP', nombre:'ONP' };
  if (AFP_RATES[r]) return { tipo:'AFP', nombre:r };
  // fallback: si tiene CUSPP es AFP, si no ONP
  if (p.cuspp && p.cuspp !== '-') return { tipo:'AFP', nombre: r || 'INTEGRA' };
  return { tipo:'ONP', nombre:'ONP' };
}

// Calcula todos los montos de la boleta (modelo MISAGI real)
function calcBoleta(p, inputs) {
  const basico = p.sueldo_base || 0;
  const dias = inputs.dias;
  const propBasico = basico * (dias/30);
  const asig = p.asignacion_familiar || 0;
  const feriado = inputs.feriado;
  // Bonos NO afectos a AFP/EsSalud
  const bonos = inputs.bonProd + inputs.bonRuta + inputs.bonComb + inputs.bonRooster + inputs.cdt;
  const totalRem = propBasico + asig + feriado + bonos;

  // BASE AFECTA (cotiza AFP/ONP/EsSalud): básico prop. + asig.fam + feriado
  const baseAfecta = propBasico + asig + feriado;

  const reg = detectRegimen(p);
  let descPension = 0;
  let afpFondo=0, afpSeguro=0, afpComis=0, onp=0;
  if (reg.tipo === 'ONP') {
    onp = baseAfecta * ONP_RATE;
    descPension = onp;
  } else {
    const rt = AFP_RATES[reg.nombre] || AFP_RATES.INTEGRA;
    afpFondo  = baseAfecta * rt.aporte;
    afpSeguro = baseAfecta * rt.seguro;
    afpComis  = baseAfecta * rt.comision;
    descPension = afpFondo + afpSeguro + afpComis;
  }
  const r2 = v => Math.round(v*100)/100;
  afpFondo=r2(afpFondo); afpSeguro=r2(afpSeguro); afpComis=r2(afpComis); onp=r2(onp);
  descPension = r2(reg.tipo==='AFP' ? (afpFondo+afpSeguro+afpComis) : onp);
  const totalDesc = r2(descPension + inputs.ret5ta + inputs.adelanto);
  const essalud = r2(baseAfecta * ESSALUD_RATE);
  const neto = r2(totalRem - totalDesc);

  return { basico, propBasico, asig, feriado, bonos, totalRem, baseAfecta, reg,
    afpFondo, afpSeguro, afpComis, onp, descPension, totalDesc, essalud, neto, dias,
    bonProd:inputs.bonProd, bonRuta:inputs.bonRuta, bonComb:inputs.bonComb,
    bonRooster:inputs.bonRooster, cdt:inputs.cdt, ret5ta:inputs.ret5ta, adelanto:inputs.adelanto };
}

function getBoletaInputs() {
  const g = id => parseFloat($(id).value)||0;
  return {
    dias: g("bolDias")||30, hrs: g("bolHrs"),
    feriado:g("bolFeriado"), bonProd:g("bolBonProd"), bonRuta:g("bolBonRuta"),
    bonComb:g("bolBonComb"), bonRooster:g("bolBonRooster"), cdt:g("bolCDT"),
    ret5ta:g("bolRet5ta"), adelanto:g("bolAdelanto"),
  };
}

const M2 = v => 'S/ ' + (v||0).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});

function boletaHTML(p, inputs, mes, anio, pagada) {
  const c = calcBoleta(p, inputs);
  const empresa = p.empresa || 'MISAGI S.A.C.';
  const dir = empresa.includes('CARGO')
    ? 'P.T. SOGAY, MZ. X, LT. 5 Y 7 - YARABAMBA - AREQUIPA'
    : 'CAL.ALEMANIA MZA. L LOTE. 1D OTR. APTASA AREQUIPA - AREQUIPA - CERRO COLORADO';
  const fini = `01/${mes}/${anio}`, ffin = `${DIAS_MES[mes]}/${mes}/${anio}`;
  const M = v => (v||0).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const cod = p.dni ? '1'+String(p.dni).slice(-3) : '—';
  const esAFP = c.reg.tipo === 'AFP';

  // filas datos derecha (vacaciones / permisos)
  const dr = (l,v) => `<tr><td class="bl-k">${l}</td><td class="bl-v">${v}</td></tr>`;

  // remuneraciones (siempre muestra las líneas estándar como el PDF)
  const remRows = [
    ['Remuneración Base', c.propBasico],
    ['Asignación Familiar', c.asig],
    ['Trabajo en Dia Feriado', c.feriado],
    ['Bonif Producción', c.bonProd],
    ['Bono Cumpl. De ruta', c.bonRuta],
    ['Bono combustible', c.bonComb],
    ['Bono rooster', c.bonRooster],
    ['CDT', c.cdt],
  ];
  // descuentos
  const descRows = esAFP
    ? [['AFP FONDO', c.afpFondo],['AFP SEGURO', c.afpSeguro],['AFP COMIS VARIABLE', c.afpComis],['RETENCION 5TA', c.ret5ta]]
    : [['ONP', c.onp],['RETENCION 5TA', c.ret5ta]];
  if (c.adelanto>0) descRows.push(['Adelantos / Otros', c.adelanto]);
  const apoRows = [['ESSALUD', c.essalud],['S.C.T.R. ', '']];

  const remHTML = remRows.map(([l,v])=>`<div class="bl-line"><span>${l}</span><span class="bl-n">${M(v)}</span></div>`).join('');
  const descHTML = descRows.map(([l,v])=>`<div class="bl-line"><span>${l}</span><span class="bl-n">${M(v)}</span></div>`).join('');
  const apoHTML = apoRows.map(([l,v])=>`<div class="bl-line"><span>${l}</span><span class="bl-n">${v===''?'':M(v)}</span></div>`).join('');

  return `<div id="boletaDoc" class="bl-doc">
    <!-- Cabecera -->
    <div class="bl-head">
      <div class="bl-head-l">
        <img src="${MISAGI_LOGO}" alt="MISAGI" class="bl-logo" />
        <p class="bl-rs">${esc(empresa)}</p>
        <p class="bl-sm">RUC: 20610685847</p>
        <p class="bl-sm bl-dir">DIRECCIÓN: ${esc(dir)}</p>
      </div>
      <div class="bl-head-r">
        <p class="bl-title">BOLETA DE PAGO</p>
        <p class="bl-sub">MENSUAL MISAGI - ${MESES[mes]} ${anio}</p>
        <p class="bl-sub">del ${fini} al ${ffin}</p>
        <p class="bl-sub bl-art">ART. DEL DECRETO SUPREMO N° 001-98-TR</p>
      </div>
    </div>

    <!-- Fila nombre + vacaciones header -->
    <table class="bl-tbl bl-tbl-top">
      <tr>
        <td class="bl-name" colspan="2"><b>${esc(p.dni||'')}</b> &nbsp; <i>${esc(p.nombres_completos)}</i></td>
        <td class="bl-k">Fec Ing</td><td class="bl-v">${p.fecha_ingreso?fmtDate(p.fecha_ingreso):''}</td>
        <td class="bl-vac" colspan="2">Vacaciones</td>
      </tr>
    </table>

    <!-- Bloque datos: izquierda + derecha -->
    <table class="bl-tbl bl-data">
      <tr><td class="bl-k">Código</td><td class="bl-vb">${cod}</td><td class="bl-k">Fec Cese</td><td class="bl-v">:</td><td class="bl-k">Inicio</td><td class="bl-k">Fin</td></tr>
      <tr><td class="bl-k">Tipo Trabajador</td><td class="bl-vb">EMPLEADO</td><td class="bl-k">Días Vac.</td><td class="bl-v">: 0 día(s)</td><td></td><td></td></tr>
      <tr><td class="bl-k">Categoria</td><td class="bl-vb">${esc(p.cargo||'')}</td><td class="bl-k">Hrs Trab</td><td class="bl-v">${inputs.hrs}</td><td></td><td></td></tr>
      <tr><td class="bl-k">Área/Dpto.</td><td class="bl-vb">${esc(p.departamento||'')}</td><td class="bl-k">Hrs Trab N</td><td class="bl-v">: 0.00</td><td class="bl-k" colspan="2">Correspondientes a</td></tr>
      <tr><td class="bl-k">Ocupación</td><td class="bl-vb">EMPLEADO</td><td colspan="4"></td></tr>
      <tr><td class="bl-k">Tipo AFP</td><td class="bl-vb">${esc(c.reg.nombre)}</td><td class="bl-k">Hrs Extras</td><td class="bl-v">: (25%) 0.00  (35%) 0.00  (100%) 0.00</td><td></td><td></td></tr>
      <tr><td class="bl-k">Reg. Pensionario</td><td class="bl-vb"></td><td class="bl-k">Per. C. Goce</td><td class="bl-v">: 0 día(s)</td><td></td><td></td></tr>
      <tr><td class="bl-k">CUSPP</td><td class="bl-vb">${esc(p.cuspp||'-')}</td><td class="bl-k">Desc Med</td><td class="bl-v">: 0 día(s)</td><td class="bl-k">Faltas</td><td class="bl-v">: 0 día(s)</td></tr>
      <tr><td class="bl-k">Banco</td><td class="bl-vb">${esc(p.banco||'')}</td><td class="bl-k">Subsidio IT</td><td class="bl-v">: 0 día(s)</td><td class="bl-k">Permisos</td><td class="bl-v">: 0 día(s)</td></tr>
      <tr><td class="bl-k">Cta.</td><td class="bl-vb">${esc(p.cuenta_cts||p.cuenta||'')}</td><td class="bl-k">Subsidio Mat</td><td class="bl-v">: 0 día(s)</td><td class="bl-k">Suspensión</td><td class="bl-v">: 0 día(s)</td></tr>
      <tr><td class="bl-k">Situación Especial</td><td class="bl-vb">NINGUNA</td><td class="bl-k">Licencia Pat</td><td class="bl-v">: 0 día(s)</td><td class="bl-k">Tardanza</td><td class="bl-v">: 0.00 mins</td></tr>
      <tr><td class="bl-k">Basico</td><td class="bl-vb">S/ ${M(c.basico)}</td><td class="bl-k">Lic. Fallecimiento</td><td class="bl-v">: 0 día(s)</td><td class="bl-k">Desc Med AT</td><td class="bl-v">: 0 día(s)</td></tr>
      <tr><td></td><td></td><td class="bl-k">Lic. Enf. Grave</td><td class="bl-v">: 0 día(s)</td><td class="bl-k">Subs. IT AT</td><td class="bl-v">: 0 día(s)</td></tr>
    </table>

    <!-- 3 columnas -->
    <div class="bl-cols">
      <div class="bl-col"><div class="bl-col-h">REMUNERACIONES</div><div class="bl-col-b">${remHTML}</div></div>
      <div class="bl-col"><div class="bl-col-h">DESCUENTOS</div><div class="bl-col-b">${descHTML}</div></div>
      <div class="bl-col"><div class="bl-col-h">APORTES</div><div class="bl-col-b">${apoHTML}</div></div>
    </div>

    <!-- Totales -->
    <table class="bl-tot">
      <tr>
        <td>TOTAL REMUNERACIONES</td><td class="bl-n">S/ ${M(c.totalRem)}</td>
        <td>TOTAL DESCUENTOS</td><td class="bl-n">S/ ${M(c.totalDesc)}</td>
        <td>TOTAL APORTES</td><td class="bl-n">S/ ${M(c.essalud)}</td>
      </tr>
    </table>
    <div class="bl-neto"><span>NETO A PAGAR</span><span>S/ ${M(c.neto)}</span></div>
    ${pagada?'<div class="bl-pagada">✓ PAGADA</div>':''}

    <!-- Firmas -->
    <div class="bl-firmas">
      <div class="bl-firma">
        <img src="${MISAGI_LOGO}" class="bl-firma-logo" alt="" />
        <div class="bl-firma-line">EMPLEADOR</div>
        <div class="bl-firma-sub">Max J. Amachi Reyes · GERENTE GENERAL</div>
      </div>
      <div class="bl-firma">
        <div class="bl-firma-line bl-firma-line2">${esc(p.nombres_completos)}</div>
        <div class="bl-firma-sub">${esc(p.dni||'')}</div>
      </div>
    </div>
  </div>`;
}

function generarBoleta() {
  const p = state.all.find(x=>x.id===$("bolEmp").value);
  if(!p){ toast('Selecciona un colaborador', true); return; }
  const inputs = getBoletaInputs();
  const mes = $("bolMes").value, anio = $("bolAnio").value;
  // ¿ya existe guardada y pagada?
  const existing = state.boletas.find(b=>b.empId===p.id && b.mes===mes && b.anio===anio);
  state.boletaActual = { p, inputs, mes, anio };
  $("bolPreview").innerHTML = boletaHTML(p, inputs, mes, anio, existing?.pagada);
  $("bolAcciones").classList.remove('hidden');
}

// ── Persistencia de boletas en Firestore ──
async function fetchBoletas() {
  try {
    const snap = await getDocs(boletasRef);
    state.boletas = snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ console.warn('boletas:', e.message); state.boletas=[]; }
}

async function guardarBoleta() {
  const a = state.boletaActual;
  if(!a){ toast('Genera una boleta primero', true); return; }
  const c = calcBoleta(a.p, a.inputs);
  const data = {
    empId: a.p.id, dni: a.p.dni||'', nombre: a.p.nombres_completos,
    mes: a.mes, anio: a.anio, periodo: `${a.mes}/${a.anio}`,
    inputs: a.inputs, neto: c.neto, totalRem: c.totalRem, totalDesc: c.totalDesc,
    regimen: c.reg.nombre, pagada: false, _updated: serverTimestamp(),
  };
  // id determinista: una boleta por trabajador-mes
  const id = `bol_${a.p.dni||a.p.id}_${a.anio}${a.mes}`;
  try {
    await setDoc(doc(db,'boletas_misagi',id), data);
    const i = state.boletas.findIndex(b=>b.id===id);
    if(i!==-1) state.boletas[i]={id,...data}; else state.boletas.push({id,...data});
    toast('Boleta guardada ✓');
    fillBoletaHistMeses(); renderBoletaHist();
  } catch(e){ toast('Error al guardar: '+e.message, true); }
}

async function togglePagada(id) {
  const b = state.boletas.find(x=>x.id===id);
  if(!b) return;
  try {
    await updateDoc(doc(db,'boletas_misagi',id), { pagada: !b.pagada, _updated: serverTimestamp() });
    b.pagada = !b.pagada;
    renderBoletaHist();
    toast(b.pagada ? 'Marcada como pagada ✓' : 'Marcada como pendiente');
  } catch(e){ toast('Error: '+e.message, true); }
}

function fillBoletaHistMeses() {
  const sel = $("bolHistMes");
  const periodos = [...new Set(state.boletas.map(b=>`${b.anio}-${b.mes}`))].sort().reverse();
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todos los meses</option>' +
    periodos.map(pr=>{const [a,m]=pr.split('-');return `<option value="${pr}">${MESES[m]} ${a}</option>`;}).join('');
  if(cur) sel.value = cur;
}

function renderBoletaHist() {
  const list = $("bolHistList");
  const filt = $("bolHistMes").value;
  let rows = state.boletas.slice().sort((a,b)=>(b.anio+b.mes).localeCompare(a.anio+a.mes) || String(a.nombre).localeCompare(b.nombre));
  if(filt){ const [a,m]=filt.split('-'); rows = rows.filter(b=>b.anio===a && b.mes===m); }
  if(!rows.length){ list.innerHTML='<p class="text-[12px] text-slate-400 text-center py-4">Sin boletas guardadas.</p>'; return; }
  list.innerHTML = rows.map(b=>`
    <div class="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-2 hover:bg-slate-50 transition">
      <div class="min-w-0 flex-1 cursor-pointer" data-openbol="${b.id}">
        <p class="text-[12px] font-medium text-slate-700 truncate">${esc(b.nombre)}</p>
        <p class="text-[10px] text-slate-400">${MESES[b.mes]} ${b.anio} · ${M2(b.neto)}</p>
      </div>
      <button data-pagada="${b.id}" class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${b.pagada?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700 hover:bg-amber-200'}">
        ${b.pagada?'✓ Pagada':'⏳ Pendiente'}
      </button>
    </div>`).join('');
  list.querySelectorAll('[data-pagada]').forEach(el=>el.addEventListener('click',()=>togglePagada(el.dataset.pagada)));
  list.querySelectorAll('[data-openbol]').forEach(el=>el.addEventListener('click',()=>abrirBoletaGuardada(el.dataset.openbol)));
}

function abrirBoletaGuardada(id) {
  const b = state.boletas.find(x=>x.id===id);
  if(!b) return;
  const p = state.all.find(x=>x.id===b.empId) || state.all.find(x=>x.dni===b.dni);
  if(!p){ toast('Colaborador no encontrado', true); return; }
  // restaurar inputs en el formulario
  $("bolEmp").value = p.id; $("bolMes").value = b.mes; $("bolAnio").value = b.anio;
  const inp = b.inputs||{};
  $("bolDias").value=inp.dias||30; $("bolHrs").value=inp.hrs||216;
  $("bolFeriado").value=inp.feriado||0; $("bolBonProd").value=inp.bonProd||0;
  $("bolBonRuta").value=inp.bonRuta||0; $("bolBonComb").value=inp.bonComb||0;
  $("bolBonRooster").value=inp.bonRooster||0; $("bolCDT").value=inp.cdt||0;
  $("bolRet5ta").value=inp.ret5ta||0; $("bolAdelanto").value=inp.adelanto||0;
  state.boletaActual = { p, inputs:inp, mes:b.mes, anio:b.anio };
  $("bolPreview").innerHTML = boletaHTML(p, inp, b.mes, b.anio, b.pagada);
  $("bolAcciones").classList.remove('hidden');
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
  // Base de Datos: re-bloquear al salir y al entrar
  if(v!=='basedatos'){ $("dbContent")?.classList.add('hidden'); $("dbLoginGate")?.classList.remove('hidden'); }
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

// ── Eventos: Boletas (acciones nuevas) ──
$("bolGuardar")?.addEventListener('click', guardarBoleta);
$("bolHistMes")?.addEventListener('change', renderBoletaHist);
$("bolPDF")?.addEventListener('click', ()=>{
  const el = document.getElementById('boletaDoc');
  if(!el || typeof html2pdf==='undefined'){ toast('Genera la boleta primero', true); return; }
  const a = state.boletaActual;
  const nombre = a ? `Boleta_${a.p.nombres_completos.replace(/[^\w]+/g,'_')}_${MESES[a.mes]}_${a.anio}.pdf` : 'boleta.pdf';
  html2pdf().set({margin:8, filename:nombre, image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}).from(el).save();
});

// ════════════════════════════════════════════════════════════════
//  MÓDULO: BASE DE DATOS MAESTRA (acceso restringido)
// ════════════════════════════════════════════════════════════════
// Hash SHA-256 de "operaciones2026" (contraseña no almacenada en texto plano)
const DB_HASH = "dff13cf08c213d9b5434334963ad6bc93e4f5a1ff986c688d4654e43fbddddbf";
const DB_LS_KEY = "misagi_db";

async function dbUnlock() {
  const val = $("dbPwd").value;
  const h = await sha256(val);
  if (h === DB_HASH) {
    $("dbLoginGate").classList.add('hidden');
    $("dbContent").classList.remove('hidden');
    $("dbPwd").value = '';
    renderDatabaseTable();
  } else {
    $("dbError").classList.remove('hidden');
    $("dbPwd").value = ''; $("dbPwd").focus();
  }
}

// Mapea documentos Firestore al esquema de la tabla maestra
function dbRows() {
  return state.all.map(p=>({
    id: p.id,
    codigo: p.dni ? 'C-'+String(p.dni).slice(-4) : '',
    dni: p.dni||'',
    nombres: p.nombres_completos||'',
    banco: p.banco||'',
    cuenta_cts: p.cuenta_cts || p.cuenta || '',
    basico: p.sueldo_base||0,
  }));
}

function renderDatabaseTable() {
  const tbody = $("dbTbody");
  const rows = dbRows();
  $("dbCount").textContent = `${rows.length} registros`;
  const cell = (id,field,val,type='text') =>
    `<td class="px-3 py-1.5"><input data-id="${id}" data-field="${field}" type="${type}" value="${esc(val)}"
      class="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-navy-400 rounded px-1.5 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-navy-100 transition" /></td>`;
  tbody.innerHTML = rows.map(r=>`<tr class="hover:bg-slate-50/60">
    ${cell(r.id,'codigo',r.codigo)}
    ${cell(r.id,'dni',r.dni)}
    ${cell(r.id,'nombres',r.nombres)}
    ${cell(r.id,'banco',r.banco)}
    ${cell(r.id,'cuenta_cts',r.cuenta_cts)}
    ${cell(r.id,'basico',r.basico,'number')}
  </tr>`).join('');
  tbody.querySelectorAll('input').forEach(inp=>inp.addEventListener('change',onDbEdit));
}

function onDbEdit(e) {
  const { id, field } = e.target.dataset;
  let val = e.target.value;
  const p = state.all.find(x=>x.id===id);
  if(!p) return;
  // mapear campo de tabla → propiedad real del documento
  if(field==='basico'){ p.sueldo_base = parseFloat(val)||0; }
  else if(field==='nombres'){ p.nombres_completos = val; }
  else if(field==='cuenta_cts'){ p.cuenta_cts = val; }
  else if(field==='codigo'){ /* solo display */ }
  else { p[field] = val; }
  // persistir snapshot local
  try { localStorage.setItem(DB_LS_KEY, JSON.stringify(state.all)); } catch(_){}
  // refrescar otros módulos que dependen del dato
  if(['basico','nombres'].includes(field)){ renderTable(); updateStats(); }
  toast('Guardado localmente');
}

$("dbUnlock")?.addEventListener('click', dbUnlock);
$("dbPwd")?.addEventListener('keydown', e=>{ if(e.key==='Enter') dbUnlock(); });
$("dbPwd")?.addEventListener('input', ()=>$("dbError").classList.add('hidden'));
$("dbExport")?.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(dbRows(),null,2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'base_datos_misagi.json'; a.click();
});
$("dbReload")?.addEventListener('click', async ()=>{
  try { localStorage.removeItem(DB_LS_KEY); } catch(_){}
  toast('Recargando de Firestore…');
  await fetchAll();
  renderDatabaseTable();
});

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

// ── Init: aplicar override local de Base de Datos si existe ──
window.addEventListener('DOMContentLoaded', ()=>{
  try {
    const raw = localStorage.getItem(DB_LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length) {
        // se aplicará tras el fetch; guardamos para merge
        window.__dbOverride = data;
      }
    }
  } catch(_){}
});

// ── Boot ──
if (localStorage.getItem(AUTH_KEY) === AUTH_HASH) {
  $("loginGate").classList.add('hidden');
  fetchAll();
} else {
  setTimeout(()=>$("loginPwd").focus(), 100);
}
