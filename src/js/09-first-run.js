/* ===== First run: an empty company. The SRC example is only loaded when the user asks for it. ===== */
function emptyData() {
  D = {
    org: "Mi empresa",
    ent: "all",
    entities: [{ id: "e1", name: "Mi empresa", country: "España", cur: "EUR", vat: "21% IVA" }],
    licenses: [],
    users: [],
    me: null,
    as: "manager",
    managers: [],
    people: [],
    projects: [],
    custom: [],
    croles: [],
    notes: [],
    intg: {},
    requests: [],
    rates: {},
    setup: false,
    demo: false,
  };
  save();
}
