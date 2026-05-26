exports.handler = async (event) => {
  const { from, to } = event.queryStringParameters;
  const BASE_ID = 'appiyfCJkXwnihoEM';
  const TOKEN = 'patDJSXmnXhrL3Nmn.f00c23fa5a57de009c41eeb81a7c04960dda2897f0cb1bca891bbd7f5e17a4b2';

  const tables = [
    {
      id: 'tblYKRPFGArA7iKLM',
      tipo: 'Acquisto',
      dataField: 'Data Fattura',
      descField: 'Descrizione',
      dareField: 'Imponibile',
      avereField: null,
      ivaField: 'Importo IVA'
    },
    {
      id: 'tbljcBVnvkCGRQyGn',
      tipo: 'Vendita',
      dataField: 'Data Fattura',
      descField: 'Descrizione',
      dareField: null,
      avereField: 'Imponibile',
      ivaField: 'Importo IVA'
    },
    {
      id: 'tbldWvZCkxvojtnTY',
      tipo: 'Corrispettivo',
      dataField: 'Data registrazione',
      descField: 'Note',
      dareField: null,
      avereField: 'Imponibile',
      ivaField: 'Importo IVA'
    }
  ];

  try {
    const formula = encodeURIComponent(`AND({Data Fattura}>="${from}",{Data Fattura}<="${to}")`);
    const formulaCorr = encodeURIComponent(`AND({Data registrazione}>="${from}",{Data registrazione}<="${to}")`);

    let allRecords = [];

    for (const table of tables) {
      const f = table.tipo === 'Corrispettivo' ? formulaCorr : formula;
      const url = `https://api.airtable.com/v0/${BASE_ID}/${table.id}?filterByFormula=${f}&sort[0][field]=${encodeURIComponent(table.dataField)}&sort[0][direction]=asc`;

      let records = [];
      let offset = null;

      do {
        const res = await fetch(url + (offset ? `&offset=${offset}` : ''), {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error?.message || `Airtable ${res.status} on ${table.id}`);
        }
        const data = await res.json();
        records = records.concat(data.records);
        offset = data.offset || null;
      } while (offset);

      records.forEach(r => {
        allRecords.push({
          fields: {
            Data: r.fields[table.dataField] || '',
            Descrizione: r.fields[table.descField] || '',
            Tipo: table.tipo,
            DARE: table.dareField ? (parseFloat(r.fields[table.dareField] || 0)) : 0,
            AVERE: table.avereField ? (parseFloat(r.fields[table.avereField] || 0)) : 0,
            IVA: parseFloat(r.fields[table.ivaField] || 0)
          }
        });
      });
    }

    // Ordina per data
    allRecords.sort((a, b) => a.fields.Data.localeCompare(b.fields.Data));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(allRecords)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
