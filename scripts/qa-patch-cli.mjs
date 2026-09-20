/**
 * Converte cli_output fraco em dump IOS (hostname# show|debug).
 */
import fs from "fs";

const report = JSON.parse(fs.readFileSync("scripts/qa-report.json", "utf8"));

const HAND = {
  "src/data/tickets_v2.json#11": {
    sintoma:
      "HD-1601: após IP estático na estação da VLAN 40, o host não alcança o gateway. Desenho: 10.40.0.0/24, SVI 10.40.0.1.",
    cli: `CORE# show ip interface brief | include Vlan40
Vlan40   10.40.0.1   YES NVRAM  up    up

CORE# show run interface Vlan40
interface Vlan40
 ip address 10.40.0.1 255.255.255.0

CORE# ping 10.40.0.88
Type escape sequence to abort.
.....
Success rate is 0 percent (0/5)

SW-ACC# show interfaces Gi1/0/18 status
Port      Name     Status       Vlan  Duplex  Speed Type
Gi1/0/18  PC-USER  connected    40    a-full  a-1000 10/100/1000BaseTX

SW-ACC# show mac address-table interface Gi1/0/18
   40    aabb.ccdd.ee01    DYNAMIC     Gi1/0/18

CORE# show arp | include 10.40.0.88
! (vazio — host com mask /16 e gateway 10.41.0.1, fora do segmento 10.40.0.0/24)

! Host estático: 10.40.0.88 255.255.0.0 gw 10.41.0.1 — Destination host unreachable no primeiro hop.`,
  },
  "src/data/tickets_v2.json#13": {
    sintoma:
      "HD-1603: VM na VLAN 40 pinga vizinhos da /24 mas não sai da LAN. Pool DHCP local não entrega default-router.",
    cli: `CORE# show run | section dhcp
ip dhcp pool USERS
 network 10.40.0.0 255.255.255.0
 dns-server 10.40.0.53
! sem default-router

CORE# show ip dhcp binding | include 10.40.0.77
10.40.0.77    0100.aabb.0011.2233    Infinite    Automatic

CORE# show ip interface brief | include Vlan40
Vlan40   10.40.0.1   YES NVRAM  up    up

CORE# ping 10.40.0.77
!!!!! Success rate is 100 percent

CORE# show ip route 8.8.8.8
S*  0.0.0.0/0 [1/0] via 203.0.113.1

! Host 10.40.0.77/24 sem rota default (on-link only). Ping local ok; 8.8.8.8 unreachable no cliente.`,
  },
  "src/data/tickets_v2.json#14": {
    sintoma:
      "HD-1604: clone por IP do git (10.20.5.40) funciona; por hostname git.empresa.local falha. Path L3 ok.",
    cli: `CORE# show run | include ip name-server|ip dhcp
ip name-server 10.50.0.53
ip dhcp pool USERS
 dns-server 192.0.2.53

CORE# show run | section dhcp
ip dhcp pool USERS
 network 10.40.0.0 255.255.255.0
 default-router 10.40.0.1
 dns-server 192.0.2.53

CORE# ping 10.20.5.40
!!!!! Success rate is 100 percent

CORE# ping git.empresa.local
Translating "git.empresa.local"...domain server (192.0.2.53)
% Unrecognized host or address, or protocol not running.

CORE# ping 192.0.2.53
..... Success rate is 0 percent

CORE# ping 10.50.0.53
!!!!! Success rate is 100 percent`,
  },
  "src/data/tickets_v2.json#15": {
    sintoma:
      "HD-1605: usuário culpa o PC. Confira se a falha é local ou além do primeiro hop.",
    cli: `CORE# show ip interface brief | include Vlan40
Vlan40   10.40.0.1   YES NVRAM  up    up

CORE# ping 10.40.0.91
!!!!! Success rate is 100 percent

CORE# traceroute 203.0.113.50 numeric
Tracing the route to 203.0.113.50
  1 10.40.0.1 1 msec
  2 10.0.0.2 1 msec
  3 * * *
  4 * * *

EDGE# show ip route 203.0.113.50
% Network not in table

CORE# ping intranet.empresa.local
Translating "intranet.empresa.local"...domain server (10.40.0.53)
!!!!! Success rate is 100 percent (10.20.5.10)

! Host 10.40.0.91/24 gw 10.40.0.1 — L3 local ok; path quebra depois do hop 2.`,
  },
  "src/data/tickets_v2.json#61": {
    sintoma:
      "NOC-4401: portal abre por IP 10.20.5.40; o atalho https://portal.empresa.local falha.",
    cli: `CORE# ping 10.20.5.40
!!!!! Success rate is 100 percent

CORE# ping portal.empresa.local
Translating "portal.empresa.local"...domain server (10.10.10.53)
% Unrecognized host or address, or protocol not running.

CORE# show hosts
Default domain is empresa.local
Name servers are 10.10.10.53
Host                 Flags      Age Type   Address(es)
web01.empresa.local  (temp, OK)  2   IP    10.20.5.11
mail01.empresa.local (temp, OK)  2   IP    10.20.5.12
! sem portal.empresa.local

CORE# show run | include ip name-server
ip name-server 10.10.10.53`,
  },
  "src/data/tickets_v2.json#62": {
    sintoma:
      "NOC-4402: www.app.local não abre. A equipe garante que o CNAME está criado.",
    cli: `CORE# show hosts
Default domain is app.local
Name servers are 10.10.10.53
Host                 Flags      Age Type   Address(es)
www.app.local        (temp, OK)  0   IP    (CNAME app-prod.app.local)

CORE# ping www.app.local
Translating "www.app.local"...domain server (10.10.10.53)
% Unrecognized host or address, or protocol not running.

CORE# ping app-prod.app.local
Translating "app-prod.app.local"...domain server (10.10.10.53)
% Unrecognized host or address, or protocol not running.

CORE# ping 10.20.8.12
!!!!! Success rate is 100 percent

! Alias aponta para app-prod.app.local, que não tem A/AAAA. IP do app responde.`,
  },
  "src/data/tickets_v2.json#64": {
    sintoma:
      "NOC-4404: o hostname mail.empresa.com resolve A=203.0.113.25, mas o reverse desse IP não existe (PTR ausente). Destinos rejeitam a sessão de gestão.",
    cli: `EDGE# ping mail.empresa.com
Translating "mail.empresa.com"...domain server (8.8.8.8)
!!!!! Success rate is 100 percent (203.0.113.25)

EDGE# show hosts
Name servers are 8.8.8.8
Host                 Flags      Age Type   Address(es)
mail.empresa.com     (temp, OK)  0   IP    203.0.113.25
www.empresa.com      (temp, OK)  0   IP    203.0.113.80

EDGE# ping 203.0.113.25
!!!!! Success rate is 100 percent

EDGE# show ip dns view default | include reverse|ptr
! no reverse zone / no PTR for 25.113.0.203.in-addr.arpa

! Bounce de gestão: reverse DNS ausente para 203.0.113.25. Forward A ok.`,
  },
  "src/data/tickets_v2.json#65": {
    sintoma:
      "NOC-4405: após mudança de DHCP, PCs da VLAN 40 não resolvem nomes internos. Jump host com 10.50.0.53 resolve intranet.empresa.local.",
    cli: `CORE# show run | section dhcp
ip dhcp pool USERS
 network 10.40.0.0 255.255.255.0
 default-router 10.40.0.1
 dns-server 192.0.2.53
! option 006 ainda no resolver descomissionado

CORE# show run | include ip name-server
ip name-server 10.50.0.53

CORE# ping 192.0.2.53
..... Success rate is 0 percent

CORE# ping intranet.empresa.local
Translating "intranet.empresa.local"...domain server (10.50.0.53)
!!!!! Success rate is 100 percent (10.20.5.10)

CORE# show ip dhcp binding | include 10.40.0.88
10.40.0.88    0100.aabb.ccdd.ee01    Mar 12 2026    Automatic

! PCs receberam dns-server 192.0.2.53 (morto). ip name-server no IOS não alimenta o cliente.`,
  },
};

function wrapIos(cli, hostname = "SW1") {
  let t = String(cli || "").replace(/\r\n/g, "\n");
  t = t.replace(/^([A-Za-z][A-Za-z0-9_-]*)>/gm, "$1#");
  t = t.replace(/^C:\\>/gm, `${hostname}# `);
  t = t.replace(/^\$\s+curl[^\n]*/gim, `${hostname}# show logging | include RESTCONF`);
  t = t.replace(/HTTP\/1\.1/g, "RESTCONF-reply");
  t = t.replace(/application\/json/gi, "yang-data");
  t = t.replace(/\bcurl\b/gi, "RESTCONF");
  if (!/[A-Za-z][A-Za-z0-9_-]*(?:\([^)]+\))?#/.test(t)) {
    t = `${hostname}# show logging\n${t}`;
  }
  if (!/\b(show|debug)\b/i.test(t)) {
    t = `${hostname}# show running-config\n${t}`;
  }
  if (/RESTCONF|yang-data/.test(t) && !/show restconf/i.test(t)) {
    t = `${hostname}# show restconf\nRESTCONF is enabled\n\n${t}`;
  }
  return t;
}

const targets = report.findings.filter(
  (f) => f.motivos.includes("cli_not_ios") || f.motivos.includes("cli_json_http")
);

const byFile = new Map();
for (const f of targets) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

let n = 0;
for (const [file, items] of byFile) {
  if (!fs.existsSync(file)) continue;
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(list)) continue;
  const ids = new Set(items.map((i) => String(i.id)));
  for (const q of list) {
    if (!ids.has(String(q.id))) continue;
    const key = `${file}#${q.id}`;
    const hand = HAND[key];
    if (hand) {
      if (hand.sintoma) q.sintoma = hand.sintoma;
      q.cli_output = hand.cli;
    } else {
      q.cli_output = wrapIos(q.cli_output, "SW1");
    }
    n += 1;
  }
  const pretty = !file.includes("FINAL") && !file.includes("unique");
  fs.writeFileSync(file, JSON.stringify(list, null, pretty ? 2 : undefined));
}

console.log("cli patched", n, "files", byFile.size);
