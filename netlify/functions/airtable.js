exports.handler = async (event) => {
  const { from, to } = event.queryStringParameters;
  const BASE_ID = 'appiyfCJkXwnihoEM';
  const TABLE_ID = 'tblMy7iSLVw7799x4';
  const TOKEN = 'patg3PyOEJXA1jiVi';

  const formula = encodeURIComponent(`AND({Data}>="${from}",{Data}<="${to}")`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${formula}&sort[0][field]=Data&sort[0][direction]=asc`;

  try {
    let all = [];
    let offset = null;
    do {
      const res = await fetch(url + (offset ? `&offset=${offset}` : ''), {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Airtable error');
      all = all.concat(data.records);
      offset = data.offset || null;
    } while (offset);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(all)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
