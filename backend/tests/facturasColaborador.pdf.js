import crypto from 'node:crypto';
import { PDFDocument, StandardFonts } from 'pdf-lib';

/*
  Facturas de colaboradores (#202) · los PDF de las pruebas, y pdf-parse simulado.

  Los PDF se hacen con pdf-lib, como en MultiCRM. Para leerlos, el módulo usa
  pdf-parse@1.1.1 (importePdf.js). Con el paquete instalado (la CI hace
  `npm ci`), las pruebas usan el de verdad. Sin él —el `node_modules` local no
  lo tiene hasta el siguiente `npm install`— se usa este simulado, que se porta
  como pdf-parse con los PDF hechos aquí: entrega a `pagerender` cada página con
  sus trozos de texto y su altura (`transform[5]`), como pdf.js, y así se sigue
  probando de verdad cómo importePdf.js junta las líneas y busca el total. Con
  un PDF que no se hizo aquí (roto, vacío), lanza, como el de verdad.

  En cada fichero de pruebas:

    vi.mock('pdf-parse/lib/pdf-parse.js', async (importOriginal) => {
      try { return await importOriginal(); } catch {
        return { default: (await import('./facturasColaborador.pdf.js')).pdfParseSimulado };
      }
    });
*/

const hechos = new Map(); // huella del PDF → sus líneas
const huella = (bytes) => crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');

/** Un PDF con estas líneas; una línea [etiqueta, cifra] lleva la cifra a la derecha, en otro trozo. */
export async function pdfCon(lineas) {
  const doc = await PDFDocument.create();
  const pagina = doc.addPage();
  const letra = await doc.embedFont(StandardFonts.Helvetica);
  lineas.forEach((l, i) => {
    const y = 760 - i * 20;
    if (Array.isArray(l)) {
      pagina.drawText(l[0], { x: 50, y, size: 11, font: letra });
      pagina.drawText(l[1], { x: 380, y, size: 11, font: letra });
    } else {
      pagina.drawText(l, { x: 50, y, size: 11, font: letra });
    }
  });
  const buffer = Buffer.from(await doc.save());
  hechos.set(huella(buffer), lineas);
  return buffer;
}

/** Una página en blanco: un PDF sin texto, como un escaneado. */
export async function pdfEnBlanco() {
  const doc = await PDFDocument.create();
  doc.addPage();
  const buffer = Buffer.from(await doc.save());
  hechos.set(huella(buffer), []);
  return buffer;
}

/** pdf-parse@1.1.1, simulado: `pdfParse(datos, { max, pagerender })` → `{ text, numpages }`. */
export async function pdfParseSimulado(datos, opciones = {}) {
  const lineas = hechos.get(huella(datos));
  if (!lineas) throw new Error('Invalid PDF structure');
  const items = lineas.flatMap((l, i) => {
    const y = 760 - i * 20;
    return (Array.isArray(l) ? l : [l]).map((str, j) => ({ str, transform: [11, 0, 0, 11, j ? 380 : 50, y] }));
  });
  const pagina = { getTextContent: async () => ({ items }) };
  const render = opciones.pagerender || (async (p) => (await p.getTextContent()).items.map((x) => x.str).join('\n'));
  // Como pdf-parse: cada página, detrás de una línea en blanco.
  const text = `\n\n${await render(pagina)}`;
  return { numpages: 1, numrender: 1, info: {}, metadata: null, text, version: 'simulado' };
}
