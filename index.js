const {Router} = require('cloudworker-router');

const router = new Router();


let records = [];
let idCounter = 1;


router.get('/', (request) => {
  return new Response(JSON.stringify(records), { headers: { 'Content-Type': 'application/json' } });
});

router.get('/:id', (request) => {
  const params = request.params
  const record = records.find((r) => r.id === parseInt(params.id, 10));
  if (record) {
    return new Response(JSON.stringify(record), { headers: { 'Content-Type': 'application/json' } });
  } else {
    return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
});

router.post("/", async (event) => {
  const contentType = event.request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await event.request.json();
    const newRecord = { id: idCounter++, ...data };
    records.push(newRecord);
    return new Response(JSON.stringify(newRecord), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(
      JSON.stringify({ error: "Invalid content type" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

router.put('/:id', async (request) => {
  const params = request.params
  const index = records.findIndex((r) => r.id === parseInt(params.id, 10));
  if (index !== -1) {
    const contentType = request.request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await request.request.json();
      records[index] = { ...records[index], ...data };
      return new Response(JSON.stringify(records[index]), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid content type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: "Record not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
});

router.delete('/:id', async (request) => {
  const params = request.params;
  const index = records.findIndex((r) => r.id === parseInt(params.id, 10));
  if (index !== -1) {
    const deletedRecord = records.splice(index, 1)[0];
    return new Response(JSON.stringify(deletedRecord), { headers: { 'Content-Type': 'application/json' } });
  } else {
    return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
});

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request));
});
