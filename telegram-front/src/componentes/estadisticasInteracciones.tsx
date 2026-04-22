import * as React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Stack,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiFetch } from '../api/client';
import { htmlToPlainText } from '../utils/sanitizeHtml';

/** Respuesta agregada antigua (si el backend aún la usa) */
type EstadisticaLegacy = {
  idmenu: number;
  texto: string;
  tema_menu: string;
  visualizaciones: number;
  fecha?: string;
};

type EstadisticaEvento = {
  id?: number;
  usuarioId?: number;
  comando: string;
  texto: string;
  fecha?: string;
};

type FilaGrafico = { nombre: string; visualizaciones: number; fecha?: string };

type VistaTipo = 'menu' | 'tema';

type ModoFiltroFecha = 'todo' | 'mes' | 'rango';

type RangoFechas = { t0: number; t1: number };

type ModoDatos = 'eventos' | 'agregado' | 'legacy';

type MenuRow = {
  id: number;
  titulo: string;
  temas: { id: number; titulo: string; comando_tema?: string }[];
};

/** Texto visible sin etiquetas HTML (coincide con mensajes enriquecidos del panel). */
function etiquetaVisible(s: string): string {
  return htmlToPlainText(String(s ?? ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clave para cruzar con estadísticas (texto plano, sin tildes en minúsculas). */
function normalizarEtiqueta(s: string): string {
  const plain = etiquetaVisible(s);
  if (!plain) return '';
  return plain
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

const PIE_COLORS = [
  '#009aae',
  '#00aec3',
  '#417099',
  '#ebb813',
  '#22a954',
  '#592673',
  '#be1717',
  '#838383',
];

const BAR_TEAL = 'var(--pba-primary)';
const BAR_GRAY = '#d3d3d3';

function parseFechaFlexible(s: string | undefined): number | null {
  if (s == null || !String(s).trim()) return null;
  const t = Date.parse(String(s).trim());
  if (Number.isNaN(t)) return null;
  return t;
}

function rangoDesdeFiltro(
  modo: ModoFiltroFecha,
  mes: string,
  desde: string,
  hasta: string,
): RangoFechas | null {
  if (modo === 'todo') return null;
  if (modo === 'mes') {
    const m = mes.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const t0 = new Date(y, mo, 1).getTime();
    const t1 = new Date(y, mo + 1, 0, 23, 59, 59, 999).getTime();
    return { t0, t1 };
  }
  if (modo === 'rango') {
    if (!desde?.trim() || !hasta?.trim()) return null;
    const d0 = new Date(`${desde.trim()}T00:00:00`);
    const d1 = new Date(`${hasta.trim()}T23:59:59.999`);
    if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime())) return null;
    if (d0.getTime() > d1.getTime()) return { t0: d1.getTime(), t1: d0.getTime() };
    return { t0: d0.getTime(), t1: d1.getTime() };
  }
  return null;
}

/** Evento sin fecha no entra al filtrar por período. */
function eventoPasaFiltroFecha(fecha: string | undefined, rango: RangoFechas | null): boolean {
  if (!rango) return true;
  const t = parseFechaFlexible(fecha);
  if (t === null) return false;
  return t >= rango.t0 && t <= rango.t1;
}

/** Fila agregada/legacy sin fecha se mantiene al filtrar (el backend a veces no envía fecha). */
function filaConFechaOpcionalPasaFiltro(fecha: string | undefined, rango: RangoFechas | null): boolean {
  if (!rango) return true;
  if (fecha === undefined || fecha === null || String(fecha).trim() === '') return true;
  const t = parseFechaFlexible(fecha);
  if (t === null) return true;
  return t >= rango.t0 && t <= rango.t1;
}

function sufijoQueryFechas(rango: RangoFechas | null): string {
  if (!rango) return '';
  const d0 = new Date(rango.t0);
  const d1 = new Date(rango.t1);
  const desde = d0.toISOString().slice(0, 10);
  const hasta = d1.toISOString().slice(0, 10);
  const q = new URLSearchParams({ desde, hasta });
  return `?${q.toString()}`;
}

function getValorIgnorandoMayusculas(r: Record<string, unknown>, nombre: string): unknown {
  const lower = nombre.toLowerCase();
  for (const k of Object.keys(r)) {
    if (k.toLowerCase() === lower) return r[k];
  }
  return undefined;
}

function esFilaEvento(item: Record<string, unknown>): boolean {
  const comando = getValorIgnorandoMayusculas(item, 'comando');
  const texto = getValorIgnorandoMayusculas(item, 'texto');
  return comando !== undefined && texto !== undefined;
}

function tieneClaveComando(r: Record<string, unknown>): boolean {
  return Object.keys(r).some((k) => k.toLowerCase() === 'comando');
}

function esFilaAgregadaSimple(item: Record<string, unknown>): boolean {
  const texto = getValorIgnorandoMayusculas(item, 'texto');
  const vis = getValorIgnorandoMayusculas(item, 'visualizaciones');
  if (texto === undefined || vis === undefined) return false;
  if (tieneClaveComando(item)) return false;
  const tm = getValorIgnorandoMayusculas(item, 'tema_menu');
  if (tm !== undefined && String(tm).trim() !== '') return false;
  return true;
}

function parsearCuerpoEstadisticas(text: string): unknown {
  const t = text.replace(/^\uFEFF/, '').trim();
  if (!t) return [];
  try {
    return JSON.parse(t);
  } catch {
    const wrapped = `[${t}]`.replace(/,\s*\]$/, ']');
    return JSON.parse(wrapped);
  }
}

function extraerArrayDesdeRespuesta(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data != null && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    const tv =
      getValorIgnorandoMayusculas(o, 'texto') !== undefined &&
      getValorIgnorandoMayusculas(o, 'visualizaciones') !== undefined &&
      !tieneClaveComando(o);
    if (tv && Object.keys(o).length <= 4) {
      return [o];
    }
    const candidatos = [
      'estadisticas',
      'Estadisticas',
      'data',
      'rows',
      'result',
      'results',
      'items',
      'records',
      'content',
      'list',
    ];
    for (const k of candidatos) {
      const v = o[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

function filaAEvento(r: Record<string, unknown>): EstadisticaEvento {
  const idRaw = getValorIgnorandoMayusculas(r, 'id');
  const usuarioRaw =
    getValorIgnorandoMayusculas(r, 'usuarioId') ?? getValorIgnorandoMayusculas(r, 'usuario_id');
  const fechaRaw = getValorIgnorandoMayusculas(r, 'fecha');
  return {
    id: idRaw != null && idRaw !== '' ? Number(idRaw) : undefined,
    usuarioId: usuarioRaw != null && usuarioRaw !== '' ? Number(usuarioRaw) : undefined,
    comando: String(getValorIgnorandoMayusculas(r, 'comando') ?? ''),
    texto: String(getValorIgnorandoMayusculas(r, 'texto') ?? ''),
    fecha: fechaRaw != null ? String(fechaRaw) : undefined,
  };
}

function normalizarComando(c: string): string {
  const t = (c || '').trim();
  if (!t) return '(sin comando)';
  return t.startsWith('/') ? t : `/${t}`;
}

function esComandoTema(comando: string): boolean {
  const sinSlash = comando.trim().replace(/^\//, '');
  return /^cnd/i.test(sinSlash);
}

function agregarClics(
  eventos: EstadisticaEvento[],
  clave: 'comando' | 'texto',
  filtro?: (e: EstadisticaEvento) => boolean,
): FilaGrafico[] {
  const map = new Map<string, number>();
  for (const e of eventos) {
    if (filtro && !filtro(e)) continue;
    const raw = clave === 'comando' ? e.comando : e.texto;
    const key =
      clave === 'comando'
        ? normalizarComando(raw)
        : (raw || '').trim() || '(sin texto)';
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([nombre, visualizaciones]) => ({ nombre, visualizaciones }))
    .sort((a, b) => b.visualizaciones - a.visualizaciones);
}

function normalizarTipoLegacy(temaMenu: string): VistaTipo | null {
  const t = (temaMenu || '').toLowerCase().trim();
  if (t === 'menu' || t === 'menú' || t === 'menus') return 'menu';
  if (t === 'tema' || t === 'temas') return 'tema';
  if (t === 'mensaje' || t === 'mensajes' || t === 'message') return null;
  return null;
}

function filtrarLegacy(rows: EstadisticaLegacy[], vista: VistaTipo): EstadisticaLegacy[] {
  return rows.filter((r) => normalizarTipoLegacy(r.tema_menu) === vista);
}

function agregarLegacy(rows: EstadisticaLegacy[]): FilaGrafico[] {
  const map = new Map<string, { nombre: string; visualizaciones: number }>();
  for (const r of rows) {
    const key = `${r.idmenu}\u0000${r.texto}`;
    const n = Number(r.visualizaciones) || 0;
    const prev = map.get(key);
    if (prev) prev.visualizaciones += n;
    else map.set(key, { nombre: r.texto, visualizaciones: n });
  }
  return Array.from(map.values()).sort((a, b) => b.visualizaciones - a.visualizaciones);
}

function detectarModo(data: unknown[]): ModoDatos {
  if (!data.length) return 'legacy';
  const records = data.filter(
    (row): row is Record<string, unknown> => row != null && typeof row === 'object',
  );
  if (records.some((r) => esFilaEvento(r))) return 'eventos';
  if (records.some((r) => esFilaAgregadaSimple(r))) return 'agregado';
  return 'legacy';
}

function filasGraficoDesdeAgregadoSimple(records: Record<string, unknown>[]): FilaGrafico[] {
  return records
    .filter(esFilaAgregadaSimple)
    .map((r) => {
      const raw = String(getValorIgnorandoMayusculas(r, 'texto') ?? '').trim();
      const fechaRaw = getValorIgnorandoMayusculas(r, 'fecha');
      const fechaStr =
        fechaRaw != null && String(fechaRaw).trim() !== '' ? String(fechaRaw) : undefined;
      return {
        nombre: etiquetaVisible(raw) || '(sin etiqueta)',
        visualizaciones: Number(getValorIgnorandoMayusculas(r, 'visualizaciones')) || 0,
        fecha: fechaStr,
      };
    })
    .sort((a, b) => b.visualizaciones - a.visualizaciones);
}

function parsearRespuesta(data: unknown): {
  modo: ModoDatos;
  eventos: EstadisticaEvento[];
  legacy: EstadisticaLegacy[];
  agregado: FilaGrafico[];
} {
  const arr = extraerArrayDesdeRespuesta(data);
  if (!arr.length) {
    return { modo: 'legacy', eventos: [], legacy: [], agregado: [] };
  }
  const records = arr.filter(
    (item): item is Record<string, unknown> => item != null && typeof item === 'object',
  );
  const modo = detectarModo(arr);
  if (modo === 'eventos') {
    return {
      modo,
      eventos: records.filter((r) => esFilaEvento(r)).map((r) => filaAEvento(r)),
      legacy: [],
      agregado: [],
    };
  }
  if (modo === 'agregado') {
    return {
      modo,
      eventos: [],
      legacy: [],
      agregado: filasGraficoDesdeAgregadoSimple(records),
    };
  }
  return {
    modo,
    eventos: [],
    agregado: [],
    legacy: records.map((r) => {
      const fechaRaw = getValorIgnorandoMayusculas(r, 'fecha');
      return {
        idmenu: Number(getValorIgnorandoMayusculas(r, 'idmenu')) || 0,
        texto: String(getValorIgnorandoMayusculas(r, 'texto') ?? ''),
        tema_menu: String(getValorIgnorandoMayusculas(r, 'tema_menu') ?? ''),
        visualizaciones: Number(getValorIgnorandoMayusculas(r, 'visualizaciones')) || 0,
        fecha:
          fechaRaw != null && String(fechaRaw).trim() !== '' ? String(fechaRaw) : undefined,
      };
    }),
  };
}

function construirMapaStats(
  modo: ModoDatos,
  agregado: FilaGrafico[],
  eventos: EstadisticaEvento[],
  legacy: EstadisticaLegacy[],
): Map<string, number> {
  const m = new Map<string, number>();
  if (modo === 'agregado') {
    for (const f of agregado) {
      const k = normalizarEtiqueta(f.nombre);
      m.set(k, (m.get(k) ?? 0) + f.visualizaciones);
    }
  } else if (modo === 'eventos') {
    for (const e of eventos) {
      const k = normalizarEtiqueta(e.texto);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
  } else {
    for (const r of legacy) {
      const k = normalizarEtiqueta(r.texto);
      m.set(k, (m.get(k) ?? 0) + (Number(r.visualizaciones) || 0));
    }
  }
  return m;
}

function datosOverviewMenus(menus: MenuRow[], stats: Map<string, number>): FilaGrafico[] {
  return menus
    .map((menu) => {
      let v = stats.get(normalizarEtiqueta(menu.titulo)) ?? 0;
      for (const t of menu.temas) {
        v += stats.get(normalizarEtiqueta(t.titulo)) ?? 0;
        v += stats.get(normalizarEtiqueta(String(t.comando_tema ?? ''))) ?? 0;
      }
      return { nombre: etiquetaVisible(menu.titulo), visualizaciones: v };
    })
    .sort((a, b) => b.visualizaciones - a.visualizaciones);
}

/** Suma stats por título del tema y su comando (sin incluir mensajes internos). */
function visualizacionesParaTema(
  tituloTema: string,
  comandoTema: string | undefined,
  stats: Map<string, number>,
): number {
  const keysUsadas = new Set<string>();
  let total = 0;
  const sumarSiNueva = (raw: string) => {
    const k = normalizarEtiqueta(raw);
    if (!k || keysUsadas.has(k)) return;
    keysUsadas.add(k);
    total += stats.get(k) ?? 0;
  };
  sumarSiNueva(tituloTema);
  sumarSiNueva(String(comandoTema ?? ''));
  return total;
}

const tooltipStyle = {
  backgroundColor: 'var(--pba-header-bg)',
  border: '1px solid var(--pba-gris-claro)',
  borderRadius: 8,
};

function BotonFiltroPba({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      size="small"
      sx={{
        textTransform: 'uppercase',
        fontFamily: 'var(--font-primary)',
        fontWeight: 700,
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        borderRadius: 2,
        borderColor: 'var(--pba-primary)',
        color: selected ? '#fff !important' : 'var(--pba-primary)',
        bgcolor: selected ? 'var(--pba-primary)' : '#fff',
        '&:hover': {
          borderColor: 'var(--pba-primary)',
          bgcolor: selected ? 'var(--pba-celeste)' : 'rgba(0, 154, 174, 0.08)',
        },
        px: { xs: 1, sm: 1.5 },
        py: 0.75,
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      {children}
    </Button>
  );
}

function mesActualInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function EstadisticasInteracciones() {
  const [modo, setModo] = React.useState<ModoDatos>('legacy');
  const [eventosBrutos, setEventosBrutos] = React.useState<EstadisticaEvento[]>([]);
  const [legacyBrutos, setLegacyBrutos] = React.useState<EstadisticaLegacy[]>([]);
  const [agregadoBrutos, setAgregadoBrutos] = React.useState<FilaGrafico[]>([]);
  const [menues, setMenues] = React.useState<MenuRow[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [vista, setVista] = React.useState<VistaTipo>('menu');
  const [menuSeleccionadoId, setMenuSeleccionadoId] = React.useState<string | null>(null);
  const [filasDrill, setFilasDrill] = React.useState<FilaGrafico[]>([]);
  const [modoFiltroFecha, setModoFiltroFecha] = React.useState<ModoFiltroFecha>('todo');
  const [mesFiltro, setMesFiltro] = React.useState(mesActualInputValue);
  const [rangoDesde, setRangoDesde] = React.useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [rangoHasta, setRangoHasta] = React.useState(() => new Date().toISOString().slice(0, 10));

  const rangoFechasActivo = React.useMemo(
    () => rangoDesdeFiltro(modoFiltroFecha, mesFiltro, rangoDesde, rangoHasta),
    [modoFiltroFecha, mesFiltro, rangoDesde, rangoHasta],
  );

  const eventos = React.useMemo(
    () => eventosBrutos.filter((e) => eventoPasaFiltroFecha(e.fecha, rangoFechasActivo)),
    [eventosBrutos, rangoFechasActivo],
  );

  const legacy = React.useMemo(
    () => legacyBrutos.filter((r) => filaConFechaOpcionalPasaFiltro(r.fecha, rangoFechasActivo)),
    [legacyBrutos, rangoFechasActivo],
  );

  const agregado = React.useMemo(
    () => agregadoBrutos.filter((f) => filaConFechaOpcionalPasaFiltro(f.fecha, rangoFechasActivo)),
    [agregadoBrutos, rangoFechasActivo],
  );

  const queryStats = React.useMemo(() => sufijoQueryFechas(rangoFechasActivo), [rangoFechasActivo]);

  React.useEffect(() => {
    let cancel = false;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const [statsResult, menuesResult] = await Promise.allSettled([
          (async () => {
            const rutas = [`/estadisticas/${queryStats}`, `/estadisticas${queryStats}`];
            let data: unknown = null;
            let ultimoStatus = 0;
            for (const path of rutas) {
              const respuesta = await apiFetch(path, { method: 'GET' });
              ultimoStatus = respuesta.status;
              if (!respuesta.ok) continue;
              const textoCuerpo = await respuesta.text();
              let parsedJson: unknown;
              try {
                parsedJson = parsearCuerpoEstadisticas(textoCuerpo);
              } catch {
                continue;
              }
              if (extraerArrayDesdeRespuesta(parsedJson).length > 0) {
                data = parsedJson;
                break;
              }
              data = parsedJson;
            }
            if (data === null) {
              throw new Error(`No se pudieron cargar las estadísticas (${ultimoStatus}).`);
            }
            return data;
          })(),
          (async () => {
            const respuesta = await apiFetch('/home/menues');
            if (!respuesta.ok) return [];
            const datos = await respuesta.json();
            if (!Array.isArray(datos)) return [];
            return datos.map(
              (menu: {
                id: number;
                titulo: string;
                temas?: { id: number; titulo: string; comando_tema?: string }[];
              }) => ({
                id: menu.id,
                titulo: menu.titulo,
                temas: Array.isArray(menu.temas)
                  ? menu.temas.map((tm) => ({
                      id: tm.id,
                      titulo: tm.titulo,
                      comando_tema: tm.comando_tema,
                    }))
                  : [],
              }),
            ) as MenuRow[];
          })(),
        ]);

        if (cancel) return;

        if (statsResult.status === 'fulfilled') {
          const data = statsResult.value;
          if (
            import.meta.env.DEV &&
            extraerArrayDesdeRespuesta(data).length === 0 &&
            data != null &&
            typeof data === 'object'
          ) {
            console.warn(
              '[Estadísticas] La respuesta no trae un array reconocido. Claves del objeto:',
              Object.keys(data as Record<string, unknown>),
            );
          }
          const parsed = parsearRespuesta(data);
          setModo(parsed.modo);
          setEventosBrutos(parsed.eventos);
          setLegacyBrutos(parsed.legacy);
          setAgregadoBrutos(parsed.agregado);
        } else {
          throw statsResult.reason instanceof Error
            ? statsResult.reason
            : new Error('Error al cargar estadísticas.');
        }

        if (menuesResult.status === 'fulfilled') {
          const lista = menuesResult.value;
          lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
          setMenues(lista);
        } else {
          setMenues([]);
        }
      } catch (e) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : 'Error al cargar estadísticas.');
          setEventosBrutos([]);
          setLegacyBrutos([]);
          setAgregadoBrutos([]);
          setMenues([]);
        }
      } finally {
        if (!cancel) setCargando(false);
      }
    };
    cargar();
    return () => {
      cancel = true;
    };
  }, [queryStats]);

  const statsMap = React.useMemo(
    () => construirMapaStats(modo, agregado, eventos, legacy),
    [modo, agregado, eventos, legacy],
  );

  React.useEffect(() => {
    if (!menuSeleccionadoId) {
      setFilasDrill([]);
      return;
    }

    const menu = menues.find((m) => String(m.id) === menuSeleccionadoId);
    if (!menu) {
      setFilasDrill([]);
      return;
    }

    const barrasPorTema: FilaGrafico[] = menu.temas.map((t) => ({
      nombre: etiquetaVisible(t.titulo),
      visualizaciones: visualizacionesParaTema(t.titulo, t.comando_tema, statsMap),
    }));
    setFilasDrill(barrasPorTema.sort((a, b) => b.visualizaciones - a.visualizaciones));
  }, [menuSeleccionadoId, menues, statsMap]);

  const datosVistaFallback = React.useMemo((): FilaGrafico[] => {
    let base: FilaGrafico[];
    if (modo === 'agregado') base = agregado;
    else if (modo === 'eventos') {
      if (vista === 'menu') {
        base = agregarClics(eventos, 'comando', (e) => !esComandoTema(e.comando));
      } else {
        base = agregarClics(eventos, 'comando', (e) => esComandoTema(e.comando));
      }
    } else {
      base = agregarLegacy(filtrarLegacy(legacy, vista));
    }
    return base.map((r) => ({ ...r, nombre: etiquetaVisible(r.nombre) }));
  }, [modo, agregado, eventos, legacy, vista]);

  const datosGrafico = React.useMemo((): FilaGrafico[] => {
    if (menues.length === 0) return datosVistaFallback;
    if (menuSeleccionadoId) return filasDrill;
    return datosOverviewMenus(menues, statsMap);
  }, [menues, menuSeleccionadoId, filasDrill, statsMap, datosVistaFallback]);

  const pieData = React.useMemo(() => {
    const slice = datosGrafico.slice(0, 8);
    const total = slice.reduce((s, d) => s + d.visualizaciones, 0) || 1;
    return slice.map((d) => {
      const plain = etiquetaVisible(d.nombre);
      const label = plain.length > 36 ? `${plain.slice(0, 36)}…` : plain;
      return {
        name: label,
        value: d.visualizaciones,
        pct: (d.visualizaciones / total) * 100,
      };
    });
  }, [datosGrafico]);

  const etiquetaMetrica = modo === 'eventos' ? 'clics' : 'visualizaciones';
  const usaJerarquia = menues.length > 0;

  const mensajeVacioFallback =
    modo === 'eventos'
      ? `No hay datos en esta vista.`
      : modo === 'agregado'
        ? 'No se recibieron filas con texto y visualizaciones.'
        : `No hay datos en esta categoría (tema_menu + visualizaciones).`;

  const chartHeight = Math.min(Math.max(datosGrafico.length * 40, 280), 720);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: 'var(--pba-primary)' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto', mt: 2 }}>
     

      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          border: '1px solid var(--pba-gris-claro)',
          bgcolor: 'rgba(0, 154, 174, 0.04)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'var(--pba-secondary)' }}>
          Período
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={modoFiltroFecha}
          onChange={(_, v) => v && setModoFiltroFecha(v)}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
        >
          <ToggleButton value="todo" sx={{ textTransform: 'none', fontFamily: 'var(--font-primary)' }}>
            Todo
          </ToggleButton>
          <ToggleButton value="mes" sx={{ textTransform: 'none', fontFamily: 'var(--font-primary)' }}>
            Mes
          </ToggleButton>
          <ToggleButton value="rango" sx={{ textTransform: 'none', fontFamily: 'var(--font-primary)' }}>
            Rango
          </ToggleButton>
        </ToggleButtonGroup>
        {modoFiltroFecha === 'mes' && (
          <TextField
            type="month"
            label="Mes"
            size="small"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
        )}
        {modoFiltroFecha === 'rango' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              type="date"
              label="Desde"
              size="small"
              value={rangoDesde}
              onChange={(e) => setRangoDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="Hasta"
              size="small"
              value={rangoHasta}
              onChange={(e) => setRangoHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        )}
       
      </Box>

      {usaJerarquia && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            mb: 2,
            px: { xs: 0, sm: 1 },
          }}
        >
          <BotonFiltroPba
            selected={menuSeleccionadoId === null}
            onClick={() => setMenuSeleccionadoId(null)}
          >
            Menús
          </BotonFiltroPba>
          {menues.map((m) => (
            <BotonFiltroPba
              key={m.id}
              selected={menuSeleccionadoId === String(m.id)}
              onClick={() => setMenuSeleccionadoId(String(m.id))}
            >
              <Box
                component="span"
                sx={{
                  display: 'block',
                  maxWidth: { xs: 140, sm: 200 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={m.titulo}
              >
                {m.titulo}
              </Box>
            </BotonFiltroPba>
          ))}
        </Box>
      )}

      {!usaJerarquia && (
        <ToggleButtonGroup
          exclusive
          value={vista}
          onChange={(_, v) => v && setVista(v)}
          aria-label="Tipo de estadística"
          sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}
        >
          <ToggleButton value="menu" sx={{ textTransform: 'none', fontFamily: 'var(--font-primary)' }}>
            Menús
          </ToggleButton>
          <ToggleButton value="tema" sx={{ textTransform: 'none', fontFamily: 'var(--font-primary)' }}>
            Temas
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      

      {datosGrafico.length === 0 ? (
        <Alert severity="info" sx={{ mt: 1 }}>
          {usaJerarquia ? 'No hay datos para mostrar en esta vista.' : mensajeVacioFallback}
        </Alert>
      ) : (
        datosGrafico.length > 0 && (
          <>
            {datosGrafico[0] && (
              <Typography variant="body2" sx={{ mb: 2, color: 'var(--pba-secondary)' }}>
                Más frecuente:{' '}
                <strong>{etiquetaVisible(datosGrafico[0].nombre)}</strong> ({datosGrafico[0].visualizaciones}{' '}
                {etiquetaMetrica})
              </Typography>
            )}

            <Box sx={{ width: '100%', height: chartHeight, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={datosGrafico.slice(0, 20)}
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--pba-gris-claro)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 'dataMax + 5']} />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={Math.min(
                      180,
                      Math.max(100, ...datosGrafico.slice(0, 20).map((d) => d.nombre.length * 5)),
                    )}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => {
                      const plain = etiquetaVisible(String(v));
                      return plain.length > 26 ? `${plain.slice(0, 26)}…` : plain;
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [
                      `${value}`,
                      modo === 'eventos' ? 'Clics' : 'Visualizaciones',
                    ]}
                    labelFormatter={(_, payload) => (payload?.[0]?.payload?.nombre as string) ?? ''}
                  />
                  <Bar
                    dataKey="visualizaciones"
                    radius={[0, 4, 4, 0]}
                    name={modo === 'eventos' ? 'Clics' : 'Visualizaciones'}
                  >
                    {datosGrafico.slice(0, 20).map((_, i) => (
                      <Cell key={`cell-bar-${i}`} fill={i % 2 === 0 ? BAR_TEAL : BAR_GRAY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {pieData.length > 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'var(--font-primary)', fontWeight: 600, mb: 1 }}>
                  Distribución (top {pieData.length})
                </Typography>
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={false}
                        isAnimationActive={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number, _n, item) => {
                          const name = (item?.payload as { name?: string })?.name ?? '';
                          return [`${value}`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
                  {pieData.map((d, i) => (
                    <Box
                      component="li"
                      key={`leyenda-${i}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        py: 0.5,
                        borderBottom: '1px solid var(--pba-gris-claro)',
                        '&:last-of-type': { borderBottom: 'none' },
                      }}
                    >
                      <Box
                        aria-hidden
                        sx={{
                          width: 18,
                          height: 18,
                          flexShrink: 0,
                          mt: 0.35,
                          borderRadius: 0.5,
                          bgcolor: PIE_COLORS[i % PIE_COLORS.length],
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.4 }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'var(--pba-secondary)' }}>
                          {d.name}
                        </Box>
                        <Box component="span" sx={{ color: 'text.secondary', ml: 0.75 }}>
                          — {d.value} {etiquetaMetrica} ({d.pct.toFixed(0)}%)
                        </Box>
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )
      )}
    </Box>
  );
}
