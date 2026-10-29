// Descarga de Aules con la API de Moodle (la misma que usa la app móvil): cursos, contenidos,
// tareas, entregas, notas y eventos. La usan la web (desde tu navegador) y sync/aules.mjs (desde tu PC).
// Aules no admite conexiones desde los servidores de GitHub, por eso no corre en GitHub Actions.

// Admite que se pegue la URL de cualquier página de Aules: nos quedamos con la raíz del sitio.
export const raizAules = (url) => (url || '').trim().replace(/\/(course|my|login|user|mod|webservice)\/.*$/, '').replace(/\/+$/, '');

// Los textos de Aules llegan en HTML; la web los muestra como texto plano.
const texto = (html) => (html || '').replace(/<br\s*\/?>|<\/(p|div|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .replace(/\n{3,}/g, '\n\n').trim();

// Moodle espera los arrays como clave[0]=..., clave[1]=...
function aplanar(obj, form, pre = '') {
  for (const [k, v] of Object.entries(obj)) {
    const clave = pre ? `${pre}[${k}]` : k;
    if (v !== null && typeof v === 'object') aplanar(v, form, clave); else form.append(clave, String(v));
  }
}

export async function descargarAules(urlAules, token) {
  const URL_AULES = raizAules(urlAules);
  const avisos = [];
  async function ws(fn, params = {}) {
    const form = new URLSearchParams({ wstoken: token, wsfunction: fn, moodlewsrestformat: 'json' });
    aplanar(params, form);
    let r;
    try { r = await fetch(URL_AULES + '/webservice/rest/server.php', { method: 'POST', body: form, signal: AbortSignal.timeout(60000) }); }
    catch (e) { throw new Error(`No se pudo conectar con ${URL_AULES} (${e.cause ? e.cause.code || e.cause.message : e.message})`); }
    const cuerpo = await r.text();
    if (!r.ok) throw new Error(`${fn}: HTTP ${r.status}`);
    let j;
    try { j = JSON.parse(cuerpo); } catch (e) { throw new Error(`${fn}: Aules no devolvió datos válidos`); }
    if (j && j.exception) throw new Error(j.errorcode === 'invalidtoken' ? 'Aules no acepta el token. Genera uno nuevo y pégalo en Ajustes.' : `${fn}: ${j.message}`);
    return j;
  }
  // Lo opcional no debe tumbar toda la sincronización: se anota y se sigue.
  const opcional = (fn, params, porDefecto) => ws(fn, params).catch((e) => { avisos.push(e.message); return porDefecto; });

  const sitio = await ws('core_webservice_get_site_info'); // si esto falla, el token o la URL están mal: error
  const uid = sitio.userid;
  const cursosAules = await ws('core_enrol_get_users_courses', { userid: uid });
  const tareasPorCurso = {};
  const asignaciones = await opcional('mod_assign_get_assignments', { courseids: cursosAules.map((c) => c.id) }, { courses: [] });
  for (const c of asignaciones.courses || []) tareasPorCurso[c.id] = c.assignments || [];

  const cursos = await Promise.all(cursosAules.map(async (c) => {
    const [contenido, informe] = await Promise.all([
      opcional('core_course_get_contents', { courseid: c.id }, []),
      opcional('gradereport_user_get_grade_items', { courseid: c.id, userid: uid }, { usergrades: [] }),
    ]);
    const items = (informe.usergrades[0] || {}).gradeitems || [];
    const tareas = await Promise.all((tareasPorCurso[c.id] || []).map(async (a) => {
      const st = await opcional('mod_assign_get_submission_status', { assignid: a.id }, {});
      const sub = (st.lastattempt || {}).submission || (st.lastattempt || {}).teamsubmission || {};
      const fb = st.feedback || {};
      const item = items.find((i) => i.itemmodule === 'assign' && i.iteminstance === a.id);
      return {
        id: a.id, cmid: a.cmid, nombre: a.name, enunciado: texto(a.intro),
        apertura: a.allowsubmissionsfromdate || 0, entrega: a.duedate || 0, cierre: a.cutoffdate || 0,
        estado: sub.status || 'new', // new | draft | submitted | reopened
        enviada: sub.timemodified || 0,
        nota: item && item.graderaw != null ? item.graderaw : null,
        notaMax: item ? item.grademax : null,
        notaTexto: (item && item.gradeformatted) || (fb.gradefordisplay ? texto(fb.gradefordisplay) : ''),
        comentario: texto((item && item.feedback) || (fb.plugins || []).flatMap((p) => p.editorfields || []).map((f) => f.text).join('\n')),
        url: `${URL_AULES}/mod/assign/view.php?id=${a.cmid}`,
      };
    }));
    const total = items.find((i) => i.itemtype === 'course');
    return {
      id: c.id, nombre: c.fullname, corto: c.shortname, progreso: c.progress ?? null,
      url: `${URL_AULES}/course/view.php?id=${c.id}`,
      secciones: contenido.map((s) => ({
        nombre: s.name, resumen: texto(s.summary),
        elementos: (s.modules || []).filter((m) => m.uservisible !== false).map((m) => ({
          id: m.id, nombre: m.name, tipo: m.modname, url: m.url || '',
          // los enlaces a ficheros llevan el token: no se guardan, se abre la página de Aules
          archivos: (m.contents || []).filter((f) => f.type === 'file').map((f) => f.filename),
        })),
      })),
      tareas,
      notas: items.filter((i) => i.itemtype !== 'course').map((i) => ({
        nombre: i.itemname || '(sin nombre)', tipo: i.itemmodule || i.itemtype, cmid: i.cmid || null,
        nota: i.graderaw ?? null, max: i.grademax, min: i.grademin, texto: i.gradeformatted || '',
        peso: i.weightformatted || '', comentario: texto(i.feedback),
      })),
      notaCurso: total ? { nota: total.graderaw ?? null, max: total.grademax, texto: total.gradeformatted || '' } : null,
    };
  }));

  const ev = await opcional('core_calendar_get_action_events_by_timesort', { timesortfrom: Math.floor(Date.now() / 1000) - 14 * 86400, limitnum: 100 }, { events: [] });
  const eventos = (ev.events || []).map((e) => ({
    nombre: e.name, fecha: e.timesort, curso: e.course ? e.course.id : null, tipo: e.modulename || e.eventtype, url: e.url || '',
  }));
  return { generado: new Date().toISOString(), sitio: { nombre: sitio.sitename, url: URL_AULES }, cursos, eventos, avisos };
}
