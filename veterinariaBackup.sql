--
-- PostgreSQL database dump
--

\restrict 6hj1Mqky08Bb9c5uCBjCckybJzfgccoXK703jIR5LaQnJgnZ56o7hAI662TuMlB

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-08-25 13:28:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 56813)
-- Name: administradores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administradores (
    id_usuario integer NOT NULL,
    nvl_acceso character varying(50) NOT NULL
);


ALTER TABLE public.administradores OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 56909)
-- Name: citas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citas (
    id_cita integer NOT NULL,
    fecha date NOT NULL,
    hora time without time zone NOT NULL,
    tipo character varying(100) NOT NULL,
    descripcion text NOT NULL,
    costo numeric(10,2) NOT NULL,
    id_mascota integer NOT NULL,
    id_cliente integer NOT NULL,
    id_recepcionista integer NOT NULL
);


ALTER TABLE public.citas OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 56825)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id_usuario integer NOT NULL,
    nro_cuenta character varying(50),
    direccion character varying(255),
    nit character varying(50)
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 56942)
-- Name: consultas_medicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultas_medicas (
    id_cons_medica integer NOT NULL,
    fecha date NOT NULL,
    hora time without time zone NOT NULL,
    costo numeric(10,2) NOT NULL,
    especialidad character varying(150) NOT NULL,
    ambiente character varying(100) NOT NULL,
    id_veterinario integer NOT NULL,
    id_cita integer,
    "idMascota" integer
);


ALTER TABLE public.consultas_medicas OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 56836)
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id_usuario integer NOT NULL,
    salario numeric(10,2) NOT NULL,
    hora_ingreso time without time zone NOT NULL,
    hora_salida time without time zone NOT NULL
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 56875)
-- Name: estilistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estilistas (
    id_usuario integer NOT NULL,
    rol character varying(100) NOT NULL
);


ALTER TABLE public.estilistas OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 56887)
-- Name: mascotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mascotas (
    id_mascota integer NOT NULL,
    id_cliente integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(50) NOT NULL,
    raza character varying(100) NOT NULL,
    edad integer NOT NULL,
    peso numeric(6,2) NOT NULL,
    altura numeric(5,2) NOT NULL,
    alergias text,
    genero character varying(20) NOT NULL
);


ALTER TABLE public.mascotas OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 56863)
-- Name: recepcionistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recepcionistas (
    id_usuario integer NOT NULL,
    departamento character varying(100) NOT NULL
);


ALTER TABLE public.recepcionistas OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 56791)
-- Name: seq_id_clientes; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_id_clientes
    START WITH 700001
    INCREMENT BY 1
    MINVALUE 700001
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seq_id_clientes OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 56792)
-- Name: seq_id_personal; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_id_personal
    START WITH 100001
    INCREMENT BY 1
    MINVALUE 100001
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seq_id_personal OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 56973)
-- Name: tratamientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tratamientos (
    id_tratamiento integer NOT NULL,
    descripcion text NOT NULL,
    fecha_emision date NOT NULL,
    id_cons_medica integer NOT NULL
);


ALTER TABLE public.tratamientos OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 56793)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombres character varying(100) NOT NULL,
    ap_pat character varying(100) NOT NULL,
    ap_mat character varying(100),
    cel character varying(20),
    correo character varying(150) NOT NULL,
    genero character varying(20),
    contrasenia character varying(255) NOT NULL,
    tipo_usuario character varying(30) NOT NULL,
    reset_token character varying(255) DEFAULT NULL::character varying,
    reset_token_expira timestamp without time zone,
    intentos_fallidos integer DEFAULT 0,
    bloqueado_hasta timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tipo_usuario CHECK (((tipo_usuario)::text = ANY ((ARRAY['ADMIN'::character varying, 'CLIENTE'::character varying, 'VETERINARIO'::character varying, 'RECEPCIONISTA'::character varying, 'ESTILISTA'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 56850)
-- Name: veterinarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.veterinarios (
    id_usuario integer NOT NULL,
    especializacion character varying(150) NOT NULL,
    titulo character varying(150) NOT NULL
);


ALTER TABLE public.veterinarios OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 56813)
-- Dependencies: 222
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administradores (id_usuario, nvl_acceso) FROM stdin;
100001	SUPERADMIN
\.


--
-- TOC entry 5104 (class 0 OID 56909)
-- Dependencies: 229
-- Data for Name: citas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.citas (id_cita, fecha, hora, tipo, descripcion, costo, id_mascota, id_cliente, id_recepcionista) FROM stdin;
101	2026-05-10	08:30:00	Consulta	Control prenatal	120.00	2	700029	100018
102	2026-05-10	09:15:00	Consulta	Alergia cutánea	150.00	4	700030	100018
103	2026-05-11	10:00:00	Cirugía	Esterilización	650.00	3	700029	100019
104	2026-05-11	14:30:00	Consulta	Cojera pata trasera	120.00	6	700031	100020
105	2026-05-12	11:00:00	Estética	Baño y corte de pelo	180.00	13	700035	100019
106	2026-05-12	16:00:00	Urgencia	Ingesta de veneno	400.00	16	700037	100022
107	2026-05-13	09:00:00	Consulta	Infección ocular	120.00	18	700038	100020
108	2026-05-13	10:30:00	Consulta	Otitis aguda	130.00	1	700029	100021
109	2026-05-14	08:00:00	Cirugía	Limpieza dental profunda	500.00	7	700032	100023
110	2026-05-14	11:15:00	Consulta	Problema estomacal	120.00	8	700032	100024
111	2026-05-15	15:00:00	Consulta	Caída de plumas excesiva	150.00	12	700034	100025
112	2026-05-15	17:30:00	Urgencia	Fractura expuesta por caída	550.00	5	700030	100027
113	2026-05-16	09:00:00	Consulta	Tos de las perreras	120.00	10	700033	100026
114	2026-05-16	10:00:00	Consulta	Inapetencia y letargia	120.00	11	700033	100026
115	2026-05-17	08:30:00	Consulta	Fiebre y deshidratación	120.00	14	700035	100018
116	2026-05-17	14:00:00	Consulta	Chequeo cardíaco rutinario	160.00	24	700042	100019
117	2026-05-18	09:30:00	Consulta	Control de sarna	140.00	15	700036	100020
118	2026-05-18	11:00:00	Consulta	Problemas urinarios	130.00	9	700032	100028
119	2026-05-19	08:15:00	Cirugía	Remoción de tumor benigno	800.00	19	700039	100021
120	2026-05-19	16:45:00	Urgencia	Atragantamiento con juguete	350.00	20	700039	100022
121	2026-05-20	09:00:00	Consulta	Control de peso y nutrición	110.00	21	700040	100024
122	2026-05-20	10:30:00	Consulta	Herida en la oreja	120.00	22	700041	100023
123	2026-05-21	11:00:00	Consulta	Crecimiento anormal de dientes	100.00	23	700041	100025
124	2026-05-21	15:30:00	Consulta	Vacunación antirrábica	90.00	25	700043	100026
125	2026-05-22	08:00:00	Cirugía	Operación de ligamentos	950.00	26	700043	100027
126	2026-05-22	10:45:00	Consulta	Quemadura solar cutánea	140.00	27	700044	100018
127	2026-05-23	14:00:00	Consulta	Chequeo oncológico inicial	200.00	28	700045	100019
128	2026-05-23	16:00:00	Consulta	Dolor muscular crónico	120.00	30	700046	100020
129	2026-05-24	09:00:00	Consulta	Moquillo presuntivo	130.00	31	700047	100024
130	2026-05-24	11:30:00	Consulta	Examen de parásitos	110.00	32	700048	100025
131	2026-05-24	15:00:00	Consulta	Dolor de oído	120.00	33	700049	100028
132	2026-05-24	18:00:00	Urgencia	Hemorragia por pelea	300.00	17	700037	100022
\.


--
-- TOC entry 5098 (class 0 OID 56825)
-- Dependencies: 223
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id_usuario, nro_cuenta, direccion, nit) FROM stdin;
700029	CTA-0029	Av. 6 de Agosto #101	102938401
700030	CTA-0030	Calle 21 de Calacoto #55	102938402
700031	CTA-0031	Av. Arce #204	102938403
700032	CTA-0032	Calle Sagarnaga #12	102938404
700033	CTA-0033	Av. Busch #345	102938405
700034	CTA-0034	Calle Loayza #98	102938406
700035	CTA-0035	Calle Ballivian #67	102938407
700036	CTA-0036	Av. Saavedra #890	102938408
700037	CTA-0037	Calle Murillo #43	102938409
700038	CTA-0038	Av. Illimani #112	102938410
700039	CTA-0039	Calle Comercio #50	102938411
700040	CTA-0040	Av. Montes #777	102938412
700041	CTA-0041	Calle Mexico #302	102938413
700042	CTA-0042	Av. Camacho #100	102938414
700043	CTA-0043	Calle Belisario Salinas #19	102938415
700044	CTA-0044	Av. 20 de Octubre #90	102938416
700045	CTA-0045	Calle Potosi #450	102938417
700046	CTA-0046	Av. Buenos Aires #33	102938418
700047	CTA-0047	Calle Sucre #22	102938419
700048	CTA-0048	Av. Jaimes Freyre #60	102938420
700049	CTA-0049	Calle Linares #15	102938421
700050	000000	Por definir en sucursal	0
\.


--
-- TOC entry 5105 (class 0 OID 56942)
-- Dependencies: 230
-- Data for Name: consultas_medicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultas_medicas (id_cons_medica, fecha, hora, costo, especialidad, ambiente, id_veterinario, id_cita, "idMascota") FROM stdin;
201	2026-05-10	08:45:00	120.00	Pediatría y Neonatología	Consultorio A	100010	101	2
202	2026-05-10	09:30:00	150.00	Dermatología Veterinaria	Consultorio B	100008	102	4
203	2026-05-11	10:15:00	650.00	Cirugía de Tejidos Blandos	Quirófano 1	100007	103	3
204	2026-05-11	14:45:00	120.00	Traumatología y Ortopedia	Sala de Yesos	100009	104	6
205	2026-05-12	16:15:00	400.00	Urgencias y Cuidados Críticos	UCI Quirúrgica	100011	106	16
206	2026-05-13	09:20:00	120.00	Oftalmología Veterinaria	Consultorio C	100015	107	18
207	2026-05-13	10:45:00	130.00	Medicina General	Consultorio A	100006	108	1
208	2026-05-14	08:30:00	500.00	Odontología Animal	Sala Dental	100016	109	7
209	2026-05-14	11:30:00	120.00	Medicina General	Consultorio B	100006	110	8
210	2026-05-15	15:20:00	150.00	Medicina General	Consultorio C	100010	111	12
211	2026-05-15	17:45:00	550.00	Urgencias y Cuidados Críticos	Trauma Shock	100011	112	5
212	2026-05-16	09:15:00	120.00	Medicina General	Consultorio A	100006	113	10
213	2026-05-16	10:15:00	120.00	Medicina General	Consultorio B	100010	114	11
214	2026-05-17	08:45:00	120.00	Medicina General	Consultorio A	100006	115	14
215	2026-05-17	14:15:00	160.00	Cardiología Veterinaria	Sala de Eco	100012	116	24
216	2026-05-18	09:45:00	140.00	Dermatología Veterinaria	Consultorio B	100008	117	15
217	2026-05-18	11:15:00	130.00	Medicina General	Consultorio C	100006	118	9
218	2026-05-19	08:45:00	800.00	Cirugía de Tejidos Blandos	Quirófano 1	100007	119	19
219	2026-05-19	17:00:00	350.00	Urgencias y Cuidados Críticos	Trauma Shock	100011	120	20
220	2026-05-20	09:15:00	110.00	Nutrición Clínica	Consultorio Especial	100017	121	21
221	2026-05-20	10:45:00	120.00	Medicina General	Consultorio B	100006	122	22
222	2026-05-21	11:15:00	100.00	Odontología Animal	Sala Dental	100016	123	23
223	2026-05-21	15:45:00	90.00	Medicina General	Consultorio A	100006	124	25
224	2026-05-22	08:30:00	950.00	Traumatología y Ortopedia	Quirófano 2	100009	125	26
225	2026-05-22	11:00:00	140.00	Dermatología Veterinaria	Consultorio B	100008	126	27
226	2026-05-23	14:15:00	200.00	Oncología Felina y Canina	Sala Onco	100013	127	28
227	2026-05-23	16:15:00	120.00	Traumatología y Ortopedia	Sala de Yesos	100009	128	30
228	2026-05-24	09:15:00	130.00	Medicina General	Consultorio A	100006	129	31
229	2026-05-24	11:45:00	110.00	Nutrición Clínica	Consultorio Especial	100017	130	32
230	2026-05-24	15:15:00	120.00	Medicina General	Consultorio C	100006	131	33
231	2026-05-24	18:15:00	300.00	Urgencias y Cuidados Críticos	UCI	100011	132	17
\.


--
-- TOC entry 5099 (class 0 OID 56836)
-- Dependencies: 224
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (id_usuario, salario, hora_ingreso, hora_salida) FROM stdin;
100006	4200.00	08:00:00	16:00:00
100007	4500.00	08:00:00	16:00:00
100008	4300.00	08:00:00	16:00:00
100009	4600.00	08:00:00	16:00:00
100010	4100.00	08:00:00	16:00:00
100011	4800.00	14:00:00	22:00:00
100012	4500.00	08:00:00	16:00:00
100013	4700.00	08:00:00	16:00:00
100014	4000.00	08:00:00	16:00:00
100015	4400.00	08:00:00	16:00:00
100016	4300.00	08:00:00	16:00:00
100017	4100.00	08:00:00	16:00:00
100018	2800.00	08:00:00	16:00:00
100019	2800.00	08:00:00	16:00:00
100020	2800.00	08:00:00	16:00:00
100021	2800.00	08:00:00	16:00:00
100022	2900.00	14:00:00	22:00:00
100023	2800.00	08:00:00	16:00:00
100024	2800.00	08:00:00	16:00:00
100025	2800.00	08:00:00	16:00:00
100026	2800.00	08:00:00	16:00:00
100027	2900.00	14:00:00	22:00:00
100028	2800.00	08:00:00	16:00:00
100029	3000.00	09:00:00	17:00:00
100030	3000.00	09:00:00	17:00:00
\.


--
-- TOC entry 5102 (class 0 OID 56875)
-- Dependencies: 227
-- Data for Name: estilistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estilistas (id_usuario, rol) FROM stdin;
100029	Peluquero Canino Senior
100030	Estilista Felino y Spa
\.


--
-- TOC entry 5103 (class 0 OID 56887)
-- Dependencies: 228
-- Data for Name: mascotas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mascotas (id_mascota, id_cliente, nombre, tipo, raza, edad, peso, altura, alergias, genero) FROM stdin;
1	700029	Toby	Perro	Golden Retriever	3	32.50	60.00	Ninguna	Macho
2	700029	Pelusa	Gato	Angora	1	3.10	20.00	Ninguna	Hembra
3	700029	Kira	Perro	Chihuahua	5	2.80	18.00	Picadura de pulga	Hembra
4	700030	Luna	Gato	Siamés	2	4.20	25.00	Penicilina	Hembra
5	700030	Oliver	Gato	Común Europeo	4	5.00	26.00	Ninguna	Macho
6	700031	Max	Perro	Pastor Alemán	5	38.00	65.00	Ninguna	Macho
7	700032	Mia	Gato	Persa	1	3.80	22.00	Polvo	Hembra
8	700032	Simba	Perro	Pug	2	8.10	30.00	Ninguna	Macho
9	700032	Chloe	Gato	Ragdoll	3	4.50	24.00	Ninguna	Hembra
10	700033	Rocky	Perro	Bóxer	4	29.00	57.50	Ninguna	Macho
11	700033	Teo	Hámster	Sirio	1	0.12	12.00	Ninguna	Macho
12	700034	Coco	Loro	Loro Hablador	8	0.40	35.00	Ninguna	Macho
13	700035	Bella	Perro	Poodle	6	7.20	28.00	Shampoo convencional	Hembra
14	700035	Thor	Perro	Bulldog Inglés	2	24.00	38.00	Dermatitis	Macho
15	700036	Garfio	Gato	Bengala	2	5.10	27.00	Ninguna	Macho
16	700037	Zeus	Perro	Rottweiler	7	45.00	68.00	Ninguna	Macho
17	700037	Hera	Perro	Dóberman	3	34.00	64.00	Ninguna	Hembra
18	700038	Nala	Perro	Chihuahua	1	2.10	15.00	Ninguna	Hembra
19	700039	Bruno	Perro	Labrador	4	31.00	58.00	Ninguna	Macho
20	700039	Milo	Perro	Beagle	2	12.50	36.00	Ninguna	Macho
21	700040	Frida	Perro	Schnauzer	3	6.80	33.00	Ninguna	Hembra
22	700041	Sasha	Gato	Siberiano	5	6.00	28.00	Pescado	Hembra
23	700041	Paco	Conejo	Angora	1	1.50	20.00	Ninguna	Macho
24	700042	Beto	Perro	San Bernardo	6	70.00	75.00	Ninguna	Macho
25	700043	Loki	Perro	Husky Siberiano	2	26.00	55.00	Ninguna	Macho
26	700043	Odin	Perro	Alaskan Malamute	4	39.00	63.00	Polen	Macho
27	700044	Clara	Gato	Sphynx	2	3.50	22.00	Exposición solar	Hembra
28	700045	Rocco	Perro	Pitbull	3	28.50	50.00	Ninguna	Macho
29	700045	Blanca	Gato	Munchkin	1	2.90	15.00	Ninguna	Hembra
30	700046	Pacha	Perro	Mastín	5	55.00	70.00	Ninguna	Hembra
31	700047	Chester	Perro	Cocker Spaniel	4	14.00	40.00	Ninguna	Macho
32	700048	Kiwi	Gato	Abisinio	2	3.90	23.00	Ninguna	Macho
33	700049	Goku	Perro	Akita Inu	3	32.00	61.00	Ninguna	Macho
\.


--
-- TOC entry 5101 (class 0 OID 56863)
-- Dependencies: 226
-- Data for Name: recepcionistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recepcionistas (id_usuario, departamento) FROM stdin;
100018	Atención al Cliente Mañana
100019	Caja y Admisiones
100020	Atención Telefónica y Agenda
100021	Archivo Clínico
100022	Urgencias Noche
100023	Atención al Cliente Tarde
100024	Caja Central
100025	Recepción General
100026	Informaciones
100027	Admisiones Tarde
100028	Control de Citas
\.


--
-- TOC entry 5106 (class 0 OID 56973)
-- Dependencies: 231
-- Data for Name: tratamientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tratamientos (id_tratamiento, descripcion, fecha_emision, id_cons_medica) FROM stdin;
301	Vitaminas natales en gotas y suplemento de calcio diario por 30 días.	2026-05-10	201
302	Shampoo con Clorhexidina cada 3 días y Apoquel 5.4mg por 14 días.	2026-05-10	202
303	Limpieza de puntos externa, Meloxicam 1ml cada 24h y collar isabelino.	2026-05-11	203
304	Analgésico Tramadol vía oral por 5 días y reposo absoluto en jaula.	2026-05-11	204
305	Tratamiento antitóxico, fluidoterapia IV continua y carbón activado.	2026-05-12	205
306	Colirio Tobramicina 1 gota c/8h por 7 días en el ojo izquierdo.	2026-05-13	206
307	Gotas óticas de Conofite c/12h tras limpieza previa de oído por 10 días.	2026-05-13	207
308	Gel de clorhexidina dental diario y antibiótico Stomorgyl por 6 días.	2026-05-14	208
309	Jarabe antiparasitario Basken en dosis única y dieta blanda (arroz/pollo).	2026-05-14	209
310	Suplemento vitamínico líquido Promotor L en el agua de bebida por 5 días.	2026-05-15	210
311	Colocación de férula temporal, analgésicos intravenosos y programación de cirugía.	2026-05-15	211
312	Antibiótico amoxicilina con ácido clavulánico c/12h por 8 días vía oral.	2026-05-16	212
313	Suplementación forzada con Recovery balanceado y protectores gástricos.	2026-05-16	213
314	Suero oral de rehidratación y control térmico con paños húmedos.	2026-05-17	214
315	Administración crónica de Enalapril 5mg diario y control cardiológico en un mes.	2026-05-17	215
316	Aplicación de pipeta Advocate y limpieza antiséptica cutánea.	2026-05-18	216
317	Jarabe de jaral (antiséptico urinario) y cambio estricto a alimento Urinary.	2026-05-18	217
318	Cuidado de herida postoperatoria, Enrofloxacina oral por 7 días.	2026-05-19	218
319	Extracción endoscópica del objeto extraño, observación preventiva por 6 horas.	2026-05-19	219
320	Prescripción de alimento Metabolic de Hill's, reducción drástica de porciones.	2026-05-20	220
321	Curación con crema Cicatril e inyección única de antiinflamatorio.	2026-05-20	221
322	Desgaste controlado con instrumental especializado y cambio a forraje más duro.	2026-05-21	222
323	Monitoreo post-vacunal por 20 minutos. No requiere medicamentos.	2026-05-21	223
324	Vendaje compresivo post-quirúrgico, fijadores externos e inyección de morfina.	2026-05-22	224
325	Crema humectante con aloe vera y baños con agua fría. Evitar sol.	2026-05-22	225
326	Toma de biopsia de tejido, programación para sesión de quimioterapia dirigida.	2026-05-23	226
327	Compresas calientes en articulaciones y administración de condroprotectores.	2026-05-23	227
328	Aislamiento clínico inmediato, suero hiperinmune y antipiréticos endovenosos.	2026-05-24	228
329	Análisis coproparasitológico y prescripción de antiparasitario de amplio espectro.	2026-05-24	229
330	Limpieza profunda de canal auditivo con Otifree y gotas antiinflamatorias.	2026-05-24	230
331	Sutura de 4 puntos en piel, vendaje protector y tratamiento con cefalexina.	2026-05-24	231
\.


--
-- TOC entry 5096 (class 0 OID 56793)
-- Dependencies: 221
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nombres, ap_pat, ap_mat, cel, correo, genero, contrasenia, tipo_usuario, reset_token, reset_token_expira, intentos_fallidos, bloqueado_hasta, fecha_creacion) FROM stdin;
100006	Carlos	Mendoza	Rios	70000006	carlos.mendoza@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100007	Laura	Gomez	Vargas	70000007	laura.gomez@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100008	Mario	Flores	Quispe	70000008	mario.flores@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100009	Andrea	Rojas	Mamani	70000009	andrea.rojas@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100010	Diego	Castro	Luna	70000010	diego.castro@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100011	Elena	Paredes	Soto	70000011	elena.paredes@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100012	Fernando	Torrico	Alvarez	70000012	fernando.torrico@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100013	Gabriela	Navarro	Cabrera	70000013	gabriela.navarro@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100014	Hugo	Morales	Rios	70000014	hugo.morales@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100015	Isabel	Cruz	Ortiz	70000015	isabel.cruz@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100016	Javier	Silva	Campos	70000016	javier.silva@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100017	Karina	Herrera	Fuentes	70000017	karina.herrera@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	VETERINARIO	\N	\N	0	\N	2026-08-23 17:40:03.085211
100018	Lucia	Vargas	Ruiz	70000018	lucia.vargas@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100019	Manuel	Salas	Peña	70000019	manuel.salas@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100020	Natalia	Duran	Vega	70000020	natalia.duran@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100021	Oscar	Benitez	Soliz	70000021	oscar.benitez@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100022	Patricia	Mejia	Suarez	70000022	patricia.mejia@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100023	Rodrigo	Chavez	Pinto	70000023	rodrigo.chavez@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100024	Sofia	Miranda	Ramos	70000024	sofia.miranda@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100025	Tomas	Aguilar	Leiton	70000025	tomas.aguilar@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100026	Ursula	Valdez	Guzman	70000026	ursula.valdez@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100027	Victor	Escobar	Arias	70000027	victor.escobar@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100028	Wendy	Bautista	Salazar	70000028	wendy.bautista@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	RECEPCIONISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100029	Raul	Montano	Calizaya	70000029	raul.estilista@vetcare.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	ESTILISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
100030	Paola	Camacho	Rios	70000030	paola.estilista@vetcare.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	ESTILISTA	\N	\N	0	\N	2026-08-23 17:40:03.085211
700029	Alejandro	Montes	Soria	71234029	alejandro.montes@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700030	Beatriz	Paz	Cordova	71234030	beatriz.paz@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700031	Camilo	Zeballos	Molina	71234031	camilo.zeballos@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700032	Daniela	Bravo	Santillan	71234032	daniela.bravo@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700033	Esteban	Quinteros	Vera	71234033	esteban.quinteros@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700034	Fabiola	Mercado	Rios	71234034	fabiola.mercado@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700035	Gonzalo	Tapia	Camacho	71234035	gonzalo.tapia@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700036	Helena	Lozano	Cano	71234036	helena.lozano@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700037	Ignacio	Cardona	Villar	71234037	ignacio.cardona@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700038	Jimena	Maldonado	Arce	71234038	jimena.maldonado@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700039	Kevin	Barrientos	Cespedes	71234039	kevin.barrientos@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700040	Lorena	Saavedra	Calle	71234040	lorena.saavedra@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700041	Mauricio	Terceros	Calderon	71234041	mauricio.terceros@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700042	Nuria	Chumacero	Ticona	71234042	nuria.chumacero@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700043	Orlando	Aparicio	Cossio	71234043	orlando.aparicio@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700044	Paola	Beltran	Daza	71234044	paola.beltran@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700045	Quirino	Centellas	Eguez	71234045	quirino.centellas@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700046	Renata	Daza	Encinas	71234046	renata.daza@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700047	Sergio	Ferrufino	Gandarillas	71234047	sergio.ferrufino@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700048	Tatiana	Gamarra	Heredia	71234048	tatiana.gamarra@gmail.com	Hembra	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
700049	Ulises	Hurtado	Iriarte	71234049	ulises.hurtado@gmail.com	Macho	$2b$10$7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6e3bE1mX8k9WbW8yR6e.X3k7Z6	CLIENTE	\N	\N	0	\N	2026-08-23 17:40:03.085211
100001	Joaquin	Admin	Perez	70000001	ellucho042@gmail.com	Macho	$2b$10$m4K7bzeCdcOB0zI1vzN6juOPp11r0Y8SBSoDYHdwcZoZhkP6YO4T.	ADMIN	\N	\N	0	\N	2026-08-23 17:40:03.085211
700050	a	a	\N	123456	a@gmail.com	Otro	$2b$10$UWzVCYJx/Mks9haNDy1QquocepH5T7pkJw6vcpInaLPagnjDRjr0u	CLIENTE	\N	\N	0	\N	2026-08-24 13:55:17.793107
\.


--
-- TOC entry 5100 (class 0 OID 56850)
-- Dependencies: 225
-- Data for Name: veterinarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.veterinarios (id_usuario, especializacion, titulo) FROM stdin;
100006	Medicina General	Médico Veterinario Zootecnista
100007	Cirugía de Tejidos Blandos	Especialista Quirúrgico
100008	Dermatología Veterinaria	Dermatólogo Veterinario
100009	Traumatología y Ortopedia	Traumatólogo Veterinario
100010	Pediatría y Neonatología	Médico Veterinario
100011	Urgencias y Cuidados Críticos	Especialista en Urgencias
100012	Cardiología Veterinaria	Cardiólogo Veterinario
100013	Oncología Felina y Canina	Oncólogo Veterinario
100014	Medicina General	Médico Veterinario
100015	Oftalmología Veterinaria	Oftalmólogo Veterinario
100016	Odontología Animal	Odontólogo Veterinario
100017	Nutrición Clínica	Nutricionista Animal
\.


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 219
-- Name: seq_id_clientes; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_id_clientes', 700050, true);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 220
-- Name: seq_id_personal; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_id_personal', 100031, false);


--
-- TOC entry 4907 (class 2606 OID 56819)
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4922 (class 2606 OID 56924)
-- Name: citas citas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_pkey PRIMARY KEY (id_cita);


--
-- TOC entry 4909 (class 2606 OID 56830)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4926 (class 2606 OID 56955)
-- Name: consultas_medicas consultas_medicas_id_cita_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas_medicas
    ADD CONSTRAINT consultas_medicas_id_cita_key UNIQUE (id_cita);


--
-- TOC entry 4928 (class 2606 OID 56953)
-- Name: consultas_medicas consultas_medicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas_medicas
    ADD CONSTRAINT consultas_medicas_pkey PRIMARY KEY (id_cons_medica);


--
-- TOC entry 4911 (class 2606 OID 56844)
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4917 (class 2606 OID 56881)
-- Name: estilistas estilistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estilistas
    ADD CONSTRAINT estilistas_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4920 (class 2606 OID 56902)
-- Name: mascotas mascotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mascotas
    ADD CONSTRAINT mascotas_pkey PRIMARY KEY (id_mascota);


--
-- TOC entry 4915 (class 2606 OID 56869)
-- Name: recepcionistas recepcionistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcionistas
    ADD CONSTRAINT recepcionistas_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4932 (class 2606 OID 56983)
-- Name: tratamientos tratamientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tratamientos
    ADD CONSTRAINT tratamientos_pkey PRIMARY KEY (id_tratamiento);


--
-- TOC entry 4903 (class 2606 OID 56811)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 4905 (class 2606 OID 56809)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4913 (class 2606 OID 56857)
-- Name: veterinarios veterinarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarios
    ADD CONSTRAINT veterinarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4923 (class 1259 OID 56941)
-- Name: idx_citas_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_citas_cliente ON public.citas USING btree (id_cliente);


--
-- TOC entry 4924 (class 1259 OID 56940)
-- Name: idx_citas_mascota; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_citas_mascota ON public.citas USING btree (id_mascota);


--
-- TOC entry 4929 (class 1259 OID 56972)
-- Name: idx_consultas_mascota; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consultas_mascota ON public.consultas_medicas USING btree ("idMascota");


--
-- TOC entry 4930 (class 1259 OID 56971)
-- Name: idx_consultas_veterinario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consultas_veterinario ON public.consultas_medicas USING btree (id_veterinario);


--
-- TOC entry 4918 (class 1259 OID 56908)
-- Name: idx_mascotas_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mascotas_cliente ON public.mascotas USING btree (id_cliente);


--
-- TOC entry 4901 (class 1259 OID 56812)
-- Name: idx_usuarios_correo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_correo ON public.usuarios USING btree (correo);


--
-- TOC entry 4933 (class 2606 OID 56820)
-- Name: administradores fk_admin_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4940 (class 2606 OID 56930)
-- Name: citas fk_citas_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT fk_citas_cliente FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4941 (class 2606 OID 56925)
-- Name: citas fk_citas_mascota; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT fk_citas_mascota FOREIGN KEY (id_mascota) REFERENCES public.mascotas(id_mascota) ON DELETE CASCADE;


--
-- TOC entry 4942 (class 2606 OID 56935)
-- Name: citas fk_citas_recepcionista; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT fk_citas_recepcionista FOREIGN KEY (id_recepcionista) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- TOC entry 4934 (class 2606 OID 56831)
-- Name: clientes fk_cliente_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4943 (class 2606 OID 56961)
-- Name: consultas_medicas fk_consultas_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas_medicas
    ADD CONSTRAINT fk_consultas_cita FOREIGN KEY (id_cita) REFERENCES public.citas(id_cita) ON DELETE SET NULL;


--
-- TOC entry 4944 (class 2606 OID 56966)
-- Name: consultas_medicas fk_consultas_mascota; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas_medicas
    ADD CONSTRAINT fk_consultas_mascota FOREIGN KEY ("idMascota") REFERENCES public.mascotas(id_mascota) ON DELETE CASCADE;


--
-- TOC entry 4945 (class 2606 OID 56956)
-- Name: consultas_medicas fk_consultas_veterinario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas_medicas
    ADD CONSTRAINT fk_consultas_veterinario FOREIGN KEY (id_veterinario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- TOC entry 4935 (class 2606 OID 56845)
-- Name: empleados fk_empleado_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT fk_empleado_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4938 (class 2606 OID 56882)
-- Name: estilistas fk_estilista_empleado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estilistas
    ADD CONSTRAINT fk_estilista_empleado FOREIGN KEY (id_usuario) REFERENCES public.empleados(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4939 (class 2606 OID 56903)
-- Name: mascotas fk_mascotas_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mascotas
    ADD CONSTRAINT fk_mascotas_cliente FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4937 (class 2606 OID 56870)
-- Name: recepcionistas fk_recepcionista_empleado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcionistas
    ADD CONSTRAINT fk_recepcionista_empleado FOREIGN KEY (id_usuario) REFERENCES public.empleados(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4946 (class 2606 OID 56984)
-- Name: tratamientos fk_tratamientos_consulta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tratamientos
    ADD CONSTRAINT fk_tratamientos_consulta FOREIGN KEY (id_cons_medica) REFERENCES public.consultas_medicas(id_cons_medica) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 56858)
-- Name: veterinarios fk_veterinario_empleado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarios
    ADD CONSTRAINT fk_veterinario_empleado FOREIGN KEY (id_usuario) REFERENCES public.empleados(id_usuario) ON DELETE CASCADE;


-- Completed on 2026-08-25 13:28:27

--
-- PostgreSQL database dump complete
--

\unrestrict 6hj1Mqky08Bb9c5uCBjCckybJzfgccoXK703jIR5LaQnJgnZ56o7hAI662TuMlB

