/**
 * CCNA Forge — Correção inteligente de erros de OCR em questões
 *
 * Corrige padrões comuns de OCR em PDFs (ligaduras fi/fl/ff perdidas,
 * caracteres estranhos, espaços irregulars) sem alterar o sentido técnico.
 *
 * Uso: node scripts/fix-ocr-questions.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "src/data/questions_bulk_limpo.json");
const OUTPUT = path.join(ROOT, "src/data/questions_bulk_corrigido.json");

/**
 * Mapa de correções OCR (chave em lowercase).
 * Ordenado por comprimento decrescente na aplicação.
 * Foco em ligaduras fi/fl/ff e erros típicos de networking.
 */
const OCR_WORD_MAP = {
  // configure / configuration family (fi → missing)
  autoconfiguration: "autoconfiguration",
  reconfiguration: "reconfiguration",
  reconfigure: "reconfigure",
  reconfigured: "reconfigured",
  reconfiguring: "reconfiguring",
  misconfiguration: "misconfiguration",
  misconfigured: "misconfigured",
  configurations: "configurations",
  configuration: "configuration",
  configurator: "configurator",
  configuring: "configuring",
  configured: "configured",
  configures: "configures",
  configure: "configure",
  config: "config",

  // broken forms without fi
  autoconguration: "autoconfiguration",
  reconguration: "reconfiguration",
  recongure: "reconfigure",
  recongured: "reconfigured",
  reconguring: "reconfiguring",
  misconguration: "misconfiguration",
  miscongured: "misconfigured",
  conguration: "configuration",
  congurations: "configurations",
  congurator: "configurator",
  conguring: "configuring",
  congured: "configured",
  congures: "configures",
  congure: "configure",
  autocong: "autoconfig",
  recong: "reconfig",
  cong: "config",

  // efficient family (ffi)
  inefficiently: "inefficiently",
  inefficient: "inefficient",
  efficiently: "efficiently",
  efficiency: "efficiency",
  efficiencies: "efficiencies",
  efficient: "efficient",
  ineciently: "inefficiently",
  inecient: "inefficient",
  eciently: "efficiently",
  eciency: "efficiency",
  eciencies: "efficiencies",
  ecient: "efficient",
  efciently: "efficiently",
  efcient: "efficient",
  efciency: "efficiency",

  // sufficient
  insufficiently: "insufficiently",
  insufficient: "insufficient",
  sufficiently: "sufficiently",
  sufficiency: "sufficiency",
  sufficient: "sufficient",
  insufciently: "insufficiently",
  insufcient: "insufficient",
  sufciently: "sufficiently",
  sufciency: "sufficiency",
  sufcient: "sufficient",
  insuciently: "insufficiently",
  insucient: "insufficient",
  suciently: "sufficiently",
  suciency: "sufficiency",
  sucient: "sufficient",

  // benefit
  beneficial: "beneficial",
  benefiting: "benefiting",
  benefited: "benefited",
  benefits: "benefits",
  benefit: "benefit",
  benecial: "beneficial",
  beneting: "benefiting",
  beneted: "benefited",
  benets: "benefits",
  benet: "benefit",

  // floating / flow / flag / floor / office
  floating: "floating",
  oating: "floating",
  overflow: "overflow",
  overow: "overflow",
  workflow: "workflow",
  workow: "workflow",
  flooded: "flooded",
  flooding: "flooding",
  floods: "floods",
  flood: "flood",
  ooded: "flooded",
  ooding: "flooding",
  oods: "floods",
  ood: "flood",
  floors: "floors",
  floor: "floor",
  oors: "floors",
  oor: "floor",
  offices: "offices",
  office: "office",
  ofces: "offices",
  ofce: "office",
  oces: "offices",
  oce: "office",
  flags: "flags",
  flag: "flag",

  // identify / specified / prefix / definition
  identifies: "identifies",
  identified: "identified",
  identifying: "identifying",
  identifier: "identifier",
  identifiers: "identifiers",
  identity: "identity",
  identify: "identify",
  identies: "identifies",
  identied: "identified",
  identier: "identifier",
  identiers: "identifiers",
  identiy: "identity",

  specifically: "specifically",
  specification: "specification",
  specifications: "specifications",
  specified: "specified",
  specifies: "specifies",
  specifying: "specifying",
  specific: "specific",
  specify: "specify",
  speciically: "specifically",
  specication: "specification",
  specications: "specifications",
  specied: "specified",
  specic: "specific",
  specically: "specifically",

  prefixes: "prefixes",
  prefixing: "prefixing",
  prefixed: "prefixed",
  prefix: "prefix",
  prexes: "prefixes",
  prexing: "prefixing",
  prexed: "prefixed",
  prex: "prefix",

  definitions: "definitions",
  definition: "definition",
  defined: "defined",
  defines: "defines",
  defining: "defining",
  define: "define",
  denitions: "definitions",
  denition: "definition",
  dened: "defined",
  denes: "defines",
  dening: "defining",
  dene: "define",

  // different / difficult
  differently: "differently",
  differentiation: "differentiation",
  differentiate: "differentiate",
  differences: "differences",
  difference: "difference",
  different: "different",
  dierently: "differently",
  dierentiation: "differentiation",
  dierentiate: "differentiate",
  dierences: "differences",
  dierence: "difference",
  dierent: "different",
  difcultly: "difficultly",
  difficulty: "difficulty",
  difficulties: "difficulties",
  difficult: "difficult",
  diiculty: "difficulty",
  diiculties: "difficulties",
  diicult: "difficult",

  // official / financial / flexible / confirm / profile
  officially: "officially",
  officials: "officials",
  official: "official",
  ofcially: "officially",
  ofcials: "officials",
  ofcial: "official",

  financially: "financially",
  financial: "financial",
  finance: "finance",
  nancially: "financially",
  nancial: "financial",
  nance: "finance",

  flexibility: "flexibility",
  flexible: "flexible",
  exibility: "flexibility",
  exible: "flexible",

  confirmation: "confirmation",
  confirmed: "confirmed",
  confirms: "confirms",
  confirm: "confirm",
  conrmation: "confirmation",
  conrmed: "confirmed",
  conrms: "confirms",
  conrm: "confirm",

  profiles: "profiles",
  profile: "profile",
  proles: "profiles",
  prole: "profile",

  // traffic / interface / address / receive / protocol
  traffic: "traffic",
  trafc: "traffic",
  traic: "traffic",

  interfaces: "interfaces",
  interface: "interface",
  interaces: "interfaces",
  interace: "interface",

  addresses: "addresses",
  addressing: "addressing",
  addressed: "addressed",
  address: "address",
  adresses: "addresses",
  adressing: "addressing",
  adressed: "addressed",
  adress: "address",

  receiving: "receiving",
  received: "received",
  receives: "receives",
  receive: "receive",
  receiver: "receiver",
  recieving: "receiving",
  recieved: "received",
  recieves: "receives",
  recieve: "receive",
  reciever: "receiver",

  protocols: "protocols",
  protocol: "protocol",
  protcols: "protocols",
  protcol: "protocol",

  // packets / separate / default / virtual / physical
  packets: "packets",
  packet: "packet",
  packtes: "packets",
  packte: "packet",

  separately: "separately",
  separation: "separation",
  separated: "separated",
  separates: "separates",
  separate: "separate",
  seperately: "separately",
  seperation: "separation",
  seperated: "separated",
  seperates: "separates",
  seperate: "separate",

  defaults: "defaults",
  default: "default",
  deaults: "defaults",
  deault: "default",

  virtualization: "virtualization",
  virtualized: "virtualized",
  virtually: "virtually",
  virtual: "virtual",
  virturalization: "virtualization",
  virturalized: "virtualized",
  virturally: "virtually",
  virtural: "virtual",

  physically: "physically",
  physical: "physical",
  physcially: "physically",
  physcial: "physical",

  // connectivity / network / switch / router / command
  connectivity: "connectivity",
  connectivty: "connectivity",
  conectivity: "connectivity",

  networking: "networking",
  networks: "networks",
  network: "network",
  netowrking: "networking",
  netowrks: "networks",
  netowrk: "network",

  switches: "switches",
  switching: "switching",
  switched: "switched",
  switch: "switch",
  swiches: "switches",
  swiching: "switching",
  swiched: "switched",
  swich: "switch",
  swithces: "switches",
  swith: "switch",

  routers: "routers",
  routing: "routing",
  routed: "routed",
  router: "router",
  routres: "routers",
  routre: "router",

  commands: "commands",
  command: "command",
  commmands: "commands",
  commmand: "command",
  comands: "commands",
  comand: "command",

  // verified / modified / classified / fixed / filtered
  verification: "verification",
  verified: "verified",
  verifies: "verifies",
  verify: "verify",
  verication: "verification",
  veried: "verified",
  veries: "verifies",

  modification: "modification",
  modifications: "modifications",
  modified: "modified",
  modifies: "modifies",
  modify: "modify",
  modication: "modification",
  modications: "modifications",
  modied: "modified",
  modies: "modifies",
  modiy: "modify",

  classification: "classification",
  classified: "classified",
  classifies: "classifies",
  classify: "classify",
  classication: "classification",
  classied: "classified",
  classies: "classifies",
  classiy: "classify",

  filtering: "filtering",
  filtered: "filtered",
  filters: "filters",
  filter: "filter",

  // affinity / offline
  affinity: "affinity",
  afnity: "affinity",
  offline: "offline",
  ofine: "offline",

  // certificate / artificial / significant
  certificates: "certificates",
  certificate: "certificate",
  certicates: "certificates",
  certicate: "certificate",

  artificial: "artificial",
  articial: "artificial",

  significantly: "significantly",
  significant: "significant",
  significance: "significance",
  signicantly: "significantly",
  signicant: "significant",
  signicance: "significance",

  // performance / reference / preference
  performance: "performance",
  performace: "performance",
  reference: "reference",
  references: "references",
  refernce: "reference",
  preference: "preference",
  preferences: "preferences",
  prefernce: "preference",

  // subnet / ethernet / wireless / wireless
  subnets: "subnets",
  subnetting: "subnetting",
  subnet: "subnet",
  subents: "subnets",
  subenting: "subnetting",
  subent: "subnet",

  ethernet: "ethernet",
  ethrenet: "ethernet",
  etherent: "ethernet",

  wireless: "wireless",
  wireles: "wireless",
  wierless: "wireless",

  // bandwidth / latency / throughput
  bandwidth: "bandwidth",
  bandwith: "bandwidth",
  bandwdth: "bandwidth",

  latency: "latency",
  latenyc: "latency",

  throughput: "throughput",
  throughtput: "throughput",
  troughput: "throughput",

  // adjacency / neighbor / redundancy
  adjacencies: "adjacencies",
  adjacency: "adjacency",
  adjaceny: "adjacency",

  neighbors: "neighbors",
  neighbor: "neighbor",
  neighborship: "neighborship",
  neighbours: "neighbours",
  neighbour: "neighbour",
  neigbors: "neighbors",
  neigbor: "neighbor",

  redundancy: "redundancy",
  redundancies: "redundancies",
  redundant: "redundant",
  redudancy: "redundancy",
  redudant: "redundant",

  // authentication / authorization / encryption
  authentication: "authentication",
  authenticate: "authenticate",
  authenticated: "authenticated",
  authenticating: "authenticating",
  authentiation: "authentication",
  autenticate: "authenticate",

  authorization: "authorization",
  authorize: "authorize",
  authorized: "authorized",
  authorisation: "authorisation",
  autorization: "authorization",

  encryption: "encryption",
  encrypted: "encrypted",
  encrypting: "encrypting",
  encrypt: "encrypt",
  encription: "encryption",
  encripted: "encrypted",

  // available / availability
  availability: "availability",
  available: "available",
  availablity: "availability",
  avaliable: "available",
  availible: "available",

  // necessary / successful / successful
  necessary: "necessary",
  necesary: "necessary",
  neccessary: "necessary",

  successfully: "successfully",
  successful: "successful",
  success: "success",
  succesfully: "successfully",
  succesful: "successful",
  sucessfully: "successfully",
  sucessful: "successful",

  // occurring / occurred / occurrence
  occurrence: "occurrence",
  occurring: "occurring",
  occurred: "occurred",
  occurs: "occurs",
  occurence: "occurrence",
  occuring: "occurring",
  occured: "occurred",

  // parameter / privilege / administrator
  parameters: "parameters",
  parameter: "parameter",
  paramaters: "parameters",
  paramater: "parameter",
  parametres: "parameters",

  privileges: "privileges",
  privilege: "privilege",
  privileged: "privileged",
  priviledge: "privilege",
  priviledges: "privileges",
  privelege: "privilege",

  administrators: "administrators",
  administrator: "administrator",
  administrative: "administrative",
  administration: "administration",
  adminstrator: "administrator",
  adminstrative: "administrative",

  // transmission / destination / source
  transmission: "transmission",
  transmitting: "transmitting",
  transmitted: "transmitted",
  transmit: "transmit",
  transmision: "transmission",

  destination: "destination",
  destinations: "destinations",
  destintion: "destination",
  destinaton: "destination",

  // hierarchy / architecture
  hierarchical: "hierarchical",
  hierarchy: "hierarchy",
  hierachy: "hierarchy",
  heirarchy: "hierarchy",

  architecture: "architecture",
  architectures: "architectures",
  architecure: "architecture",
  architechture: "architecture",

  // hypervisor / virtualization extras
  hypervisors: "hypervisors",
  hypervisor: "hypervisor",
  hypervior: "hypervisor",

  // layer / multilayer
  multilayer: "multilayer",
  multlayer: "multilayer",

  // troubleshooting
  troubleshooting: "troubleshooting",
  troubleshoot: "troubleshoot",
  troubeshooting: "troubleshooting",
  trobleshooting: "troubleshooting",

  // IEEE / OSPF common OCR glitches
  spanning: "spanning",
  spaning: "spanning",

  // permit / deny already fine

  // "which of the following" OCR
  following: "following",
  folowing: "following",
  followng: "following",

  // additional common OCR
  because: "because",
  becuase: "because",
  beacuse: "because",

  between: "between",
  betwen: "between",
  beetween: "between",

  whether: "whether",
  wether: "whether",

  through: "through",
  thrugh: "through",
  trough: "through",

  although: "although",
  althought: "although",

  required: "required",
  requied: "required",
  requried: "required",

  provides: "provides",
  provide: "provide",
  provids: "provides",

  allows: "allows",
  allow: "allow",

  enables: "enables",
  enable: "enable",
  enabes: "enables",

  disables: "disables",
  disable: "disable",
  disbale: "disable",

  implements: "implements",
  implement: "implement",
  implementation: "implementation",
  implmentation: "implementation",
  implemenation: "implementation",

  information: "information",
  informaton: "information",
  infromation: "information",

  connection: "connection",
  connections: "connections",
  conecton: "connection",
  conection: "connection",

  communication: "communication",
  communications: "communications",
  comunication: "communication",

  management: "management",
  managment: "management",
  managemnt: "management",

  environment: "environment",
  enviroment: "environment",
  enviornment: "environment",

  equipment: "equipment",
  equipement: "equipment",
  equiptment: "equipment",

  assignment: "assignment",
  assigment: "assignment",

  statement: "statement",
  statements: "statements",
  statment: "statement",

  attachment: "attachment",
  attachement: "attachment",

  encapsulation: "encapsulation",
  encapsulaton: "encapsulation",
  encapsualtion: "encapsulation",

  negotiation: "negotiation",
  negociation: "negotiation",

  advertisement: "advertisement",
  advertisements: "advertisements",
  advertizement: "advertisement",

  redistribution: "redistribution",
  redistributon: "redistribution",

  summarization: "summarization",
  sumarization: "summarization",

  aggregation: "aggregation",
  agreggation: "aggregation",

  propagation: "propagation",
  propogation: "propagation",

  broadcast: "broadcast",
  broadcasts: "broadcasts",
  brodcast: "broadcast",

  multicast: "multicast",
  multicasts: "multicasts",
  muticast: "multicast",

  unicast: "unicast",
  unicasts: "unicasts",

  anycast: "anycast",

  loopback: "loopback",
  loopbak: "loopback",

  wildcard: "wildcard",
  wildcards: "wildcards",
  wildcrd: "wildcard",

  checksum: "checksum",
  checkum: "checksum",

  handshake: "handshake",
  handhake: "handshake",
  handshke: "handshake",

  acknowledgment: "acknowledgment",
  acknowledgement: "acknowledgement",
  acknowledgments: "acknowledgments",
  acknowlegment: "acknowledgment",
  acknowlegement: "acknowledgement",

  retransmission: "retransmission",
  retransmision: "retransmission",

  fragmentation: "fragmentation",
  fragmentaton: "fragmentation",

  reassembly: "reassembly",
  reasembly: "reassembly",

  sequence: "sequence",
  sequences: "sequences",
  sequenece: "sequence",

  windowing: "windowing",
  windowng: "windowing",

  congestion: "congestion",
  congeston: "congestion",

  reliability: "reliability",
  reliablity: "reliability",
  realibility: "reliability",

  scalability: "scalability",
  scalabilty: "scalability",
  scaleability: "scalability",

  compatibility: "compatibility",
  compatability: "compatibility",
  compatiblity: "compatibility",

  interoperability: "interoperability",
  interoperatbility: "interoperability",

  maintainability: "maintainability",
  maintainabilty: "maintainability",

  // Cisco-specific OCR
  switchport: "switchport",
  swithport: "switchport",
  swichport: "switchport",

  etherchannel: "etherchannel",
  etherChanel: "etherchannel",

  portchannel: "portchannel",
  portChanel: "portchannel",

  spanningtree: "spanning-tree",

  accesslist: "access-list",

  // common typos from OCR numbers/letters
  gigabitethernet: "GigabitEthernet",
  fastethernet: "FastEthernet",
};

// Remove identity mappings and build sorted list (longest first)
const SORTED_REPLACEMENTS = Object.entries(OCR_WORD_MAP)
  .filter(([from, to]) => from.toLowerCase() !== to.toLowerCase())
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Preserva capitalização da palavra original ao aplicar correção.
 */
function applyCasing(original, replacement) {
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Substitui palavras do mapa com word boundaries, preservando casing.
 */
function replaceKnownWords(text) {
  let result = text;
  for (const [from, to] of SORTED_REPLACEMENTS) {
    const re = new RegExp(`\\b${escapeRegExp(from)}\\b`, "gi");
    result = result.replace(re, (match) => applyCasing(match, to));
  }
  return result;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Remove caracteres de controle e glifos OCR comuns, preservando
 * newlines em CLI e pontuação útil.
 */
function cleanStrangeChars(text) {
  return (
    text
      // zero-width / BOM / soft hyphen
      .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
      // common mojibake / replacement chars
      .replace(/\uFFFD/g, "")
      // PDF bullet/glyph junk often used as list markers
      .replace(/[✑✓✔✗✘●○◆◇■□▪▫►▸‣•]/g, "•")
      // fancy quotes → ascii
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      // dashes
      .replace(/[\u2010-\u2015]/g, "-")
      // ellipsis
      .replace(/\u2026/g, "...")
      // non-breaking space
      .replace(/\u00A0/g, " ")
      // strip most control chars except tab/newline
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
  );
}

/**
 * Normaliza espaços: colapsa múltiplos espaços (não newlines),
 * remove espaço antes de pontuação, garante espaço após vírgula/ponto.
 */
function normalizeSpaces(text) {
  return (
    text
      // collapse horizontal whitespace (keep newlines)
      .replace(/[^\S\n]+/g, " ")
      // space before punctuation
      .replace(/ +([,.;:!?])/g, "$1")
      // ensure space after punctuation if letter follows
      .replace(/([,.;:!?])([A-Za-z])/g, "$1 $2")
      // trim each line
      .replace(/^ +| +$/gm, "")
      // collapse 3+ newlines to 2
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Corrige números grudados no meio de palavras alfabéticas.
 * Ex.: "con1figure" → "configure", "rou2ter" → "router"
 * NÃO toca em: IPs, máscaras, portas, modelos (Gi0/1, 200-301, 802.1Q, etc.)
 */
function fixDigitsStuckInWords(text) {
  // Letter(s) + digit(s) + letter(s) — remove internal digits only for short junk digits
  // Skip if looks like hex, version, or technical token with known patterns
  return text.replace(
    /\b([A-Za-z]{2,})(\d{1,2})([A-Za-z]{2,})\b/g,
    (full, a, digits, b) => {
      const lower = full.toLowerCase();
      // Preserve technical tokens
      if (
        /^(v?\d|ipv\d|eigrp|ospfv?\d|bgp|vlan\d|gi\d|fa\d|se\d|eth\d)/i.test(
          full
        )
      ) {
        return full;
      }
      // Preserve things like "802dot1q" style if any
      if (/^\d/.test(full)) return full;
      // Only strip if resulting word is plausible (no digit left) and common OCR junk
      // Heuristic: single digit 0-9 often is OCR noise inside a word
      if (digits.length === 1) {
        return a + b;
      }
      return full;
    }
  );
}

/**
 * Heurísticas extras para padrões de ligadura em substrings
 * (quando a palavra inteira não está no mapa).
 */
function fixLigatureFragments(text) {
  // autocong → autoconfig (substring in longer tokens already handled)
  // "con gure" with space → configure (rare)
  let r = text;
  r = r.replace(/\bcon\s+gure\b/gi, (m) =>
    m[0] === "C" ? "Configure" : "configure"
  );
  r = r.replace(/\bcon\s+guration\b/gi, (m) =>
    m[0] === "C" ? "Configuration" : "configuration"
  );
  // "ef cient" → efficient
  r = r.replace(/\bef\s+cient(ly|y)?\b/gi, (_, suf = "") => {
    return "efficient" + suf;
  });
  return r;
}

/**
 * Pipeline completo de correção de texto.
 */
export function fixOcrText(input) {
  if (!input || typeof input !== "string") return input ?? "";
  let text = input;
  text = cleanStrangeChars(text);
  text = fixLigatureFragments(text);
  text = replaceKnownWords(text);
  text = fixDigitsStuckInWords(text);
  text = normalizeSpaces(text);
  return text;
}

/**
 * Corrige um objeto de questão por completo.
 */
export function fixQuestion(q) {
  const out = { ...q };
  if (typeof out.enunciado === "string") {
    out.enunciado = fixOcrText(out.enunciado);
  }
  if (typeof out.sintoma === "string") {
    out.sintoma = fixOcrText(out.sintoma);
  }
  if (typeof out.cli_output === "string") {
    // CLI: cleaner but keep structure; still fix OCR words
    out.cli_output = fixOcrText(out.cli_output);
  }
  if (Array.isArray(out.alternativas)) {
    out.alternativas = out.alternativas.map((a) =>
      typeof a === "string" ? fixOcrText(a) : a
    );
  }
  if (typeof out.explicacao_profunda === "string" && out.explicacao_profunda) {
    out.explicacao_profunda = fixOcrText(out.explicacao_profunda);
  }
  return out;
}

function countDiffs(before, after) {
  let fields = 0;
  let chars = 0;
  const visit = (a, b) => {
    if (typeof a === "string" && typeof b === "string" && a !== b) {
      fields += 1;
      // rough char delta
      chars += Math.abs(a.length - b.length) + 1;
    } else if (Array.isArray(a) && Array.isArray(b)) {
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        visit(a[i], b[i]);
      }
    }
  };
  visit(before.enunciado, after.enunciado);
  visit(before.sintoma, after.sintoma);
  visit(before.cli_output, after.cli_output);
  visit(before.alternativas, after.alternativas);
  visit(before.explicacao_profunda, after.explicacao_profunda);
  return { fields, chars };
}

function main() {
  console.log("Lendo:", INPUT);
  const raw = fs.readFileSync(INPUT, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("JSON de entrada deve ser um array de questões");
  }

  console.log(`Questões: ${data.length}`);
  let changedQuestions = 0;
  let changedFields = 0;
  const samples = [];

  const fixed = data.map((q) => {
    const next = fixQuestion(q);
    const diff = countDiffs(q, next);
    if (diff.fields > 0) {
      changedQuestions += 1;
      changedFields += diff.fields;
      if (samples.length < 8) {
        samples.push({
          id: q.id,
          before: (q.enunciado || q.sintoma || "").slice(0, 120),
          after: (next.enunciado || next.sintoma || "").slice(0, 120),
        });
      }
    }
    return next;
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(fixed, null, 2) + "\n", "utf8");
  console.log("Salvo:", OUTPUT);
  console.log(
    `Corrigidas: ${changedQuestions}/${data.length} questões (${changedFields} campos)`
  );
  if (samples.length) {
    console.log("\nAmostras:");
    for (const s of samples) {
      console.log(`  #${s.id}`);
      console.log(`    - ${s.before}`);
      console.log(`    + ${s.after}`);
    }
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main();
}
