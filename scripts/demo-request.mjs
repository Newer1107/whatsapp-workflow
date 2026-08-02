const persona = process.argv[2] === "visitor" ? "visitor" : "parent";
const message = persona === "visitor"
  ? "I want to learn about admissions"
  : "My child is absent today";
const endpoint = process.env.SCHOOL_DEMO_URL
  ?? "https://n8n.raunaktech.site/webhook/22d2d497-619b-47d8-ac4e-71047d537929/school-office-demo/conversation";

const payload = { persona, message };

console.log(JSON.stringify(payload, null, 2));
console.log("");
console.log("Run against the live demo workflow:");
console.log(`curl -X POST \"${endpoint}\" -H \"Content-Type: application/json\" -d '${JSON.stringify(payload)}'`);
