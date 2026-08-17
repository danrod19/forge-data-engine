# TASKS v2.0

> Backlog da trilha standby CCNA 200-301 v2.0.  
> Nenhuma part v2 entra no Simulado/Trilha de produção sem merge explícito e build PASS.

---

## Feito

- [x] Estrutura `v2/` + PROMPT_BASE + DECISIONS + README
- [x] `v2/blueprint/README.md` + `v2/parts/.gitkeep`

---

## Backlog P0 (não iniciar até ordem explícita)

- [x] part v2-5.1 agentic-ai
- [x] part v2-5.2 ai-prompts
- [x] part v2-1.1 interfaces-cables
- [x] part v2-4.4 dns-diagnose
- [x] part v2-1.7 dhcp-tshoot

---

## Backlog P1

- [x] v2-1.6 client-connectivity-os
- [x] v2-2.2 edge-host-ports
- [x] v2-2.4 tshoot-l2l3-capture
- [x] v2-3.3 ospfv2-v3
- [x] v2-4.7 l2-security (RA guard)
- [x] v2-4.2 sftp-scp

---

## Backlog P2

- [ ] Migrar/melhorar parts de reuso (STP, ACL, static, FHRP, NAT, wireless, Ansible use, …)
  - v2-1.2 virtualization
  - v2-1.3 ipv4-tshoot
  - v2-1.4 ipv6-tshoot
  - [x] v2-1.5 wireless-principles (content + 30Q + 5 tickets em v2/parts/)
  - v2-2.1 infra-connectivity
  - v2-2.3 cdp-lldp
  - [x] v2-2.5 rapid-pvst (STP/PortFast/BPDU Guard)
  - v2-3.1 routing-table
  - [x] v2-3.2 static-tshoot
  - [x] v2-3.4 fhrp
  - v2-4.1 aaa-local
  - [x] v2-4.3 nat-pat
  - v2-4.5 ipsec-vpn
  - [x] v2-4.6 acls
  - v2-5.3 mgmt-approaches
  - v2-5.4 snmp
  - v2-5.5 ansible-use
  - v2-5.6 syslog

---

## Consolidação standby (banco v2)

- [x] Script `v2/scripts/consolidate_v2.mjs` + saídas em `v2/final/`
  - questions_v2_traditional.json · tickets_v2.json · parts_index.json
  - inventory_report.json · consolidation_report.json
- [x] Reconsolidate P0+P1+P2 (16 parts) → app `src/data/*_v2*` (477 Q / 80 tickets)
- [x] Reconsolidate + wireless v2-1.5 (17 parts) → app `src/data/*_v2*` (506 Q / 85 tickets; free 170 / PRO 336; 4 traditional deduped)

## Backlog P3

- [ ] Script merge v2 → app (dual-track ou cutover)
- [ ] domains.ts v2 / feature flag

---

## Regra

**Nenhuma part v2 entra no Simulado/Trilha de produção sem merge explícito e build PASS.**

Produção atual (`src/`, `trilha-content/parts/` v1, JSONs de simulado/trilha) permanece intocada até ordem de cutover.
