# DECISIONS v2.0

> Decisões fechadas da trilha CCNA Forge alinhada ao exame 200-301 **v2.0**.  
> Precedência: este arquivo > PROMPT_BASE_v2.md > TASKS_v2.md > PDF em blueprint/.

---

## Blueprint

- **Fonte:** 200-301_CCNA_v2.0_Exam_Topics (Cisco Public, 2026)
- **5 domínios** (não 6 como v1.x)
- **Ênfase em troubleshooting** (~diagnose/troubleshoot em grande parte dos tópicos)
- **AI agentic + prompt engineering** entram no domínio 5.0

### Domínios oficiais

| Domínio | Nome | Peso |
|---------|------|------|
| 1.0 | Network Infrastructure & Connectivity | 25% |
| 2.0 | Switching & Network Access | 25% |
| 3.0 | IP Routing | 20% |
| 4.0 | Network Services & Security | 20% |
| 5.0 | AI & Network Operations and Management | 10% |

---

## Relação com v1

- **App de produção permanece em v1** até decisão de cutover
- **Conteúdo v1 reutilizável:** migrar com upgrade de rigor (mais CLI, menos definição pura)
- **Conteúdo novo obrigatório do zero:**
  - AI agentic, prompts
  - RA guard
  - SFTP/SCP
  - DNS diagnose
  - OSPFv3
  - packet capture
  - client multi-OS
  - interface/cable diagnose
  - edge-host profiles (PoE/voice/AP/IoT)

---

## Qualidade (mais rígida que v1)

1. Cada part declara o **verbo Cisco principal** no content (`Diagnose` | `Troubleshoot` | `Configure` | `Interpret` | `Use` | `Describe`)
2. **Tickets:** evidência ≥6 linhas; resposta dedutível só com o output; temas distintos nos 5 tickets
3. **Questions:** preferir cenário/output; máximo **20%** de definição pura por part
4. `explicacao_profunda` ≥**150** caracteres; proibido “A resposta correta é…”
5. Gabarito traditional ~**7–8** por índice (0–3)
6. `isPremium`: ids **1–10 false**, **11–30 true** (traditional); tickets **todos true**
7. `part_id` no formato `"v2-1.1"`, `"v2-5.2"`, etc.
8. **Zero** exhibit obrigatório / **zero** choose-two no banco standard
9. **Ansible = Use** (playbook/inventory/RECAP), não só descrever
10. **AI = operacional de rede** (persona, dados, formato, instruções), não chatbot genérico

---

## Árvore de parts planejada

### 1.0 Network Infrastructure & Connectivity (25%)

| part_id | slug | status |
|---------|------|--------|
| v2-1.1 | interfaces-cables | NOVO |
| v2-1.2 | virtualization | reuso+ |
| v2-1.3 | ipv4-tshoot | reuso+ |
| v2-1.4 | ipv6-tshoot | reuso+ |
| v2-1.5 | wireless-principles | reuso+ |
| v2-1.6 | client-connectivity-os | NOVO |
| v2-1.7 | dhcp-tshoot | reescrever |

### 2.0 Switching & Network Access (25%)

| part_id | slug | status |
|---------|------|--------|
| v2-2.1 | infra-connectivity | reuso+ |
| v2-2.2 | edge-host-ports | NOVO |
| v2-2.3 | cdp-lldp | — |
| v2-2.4 | tshoot-l2l3-capture | NOVO capture |
| v2-2.5 | rapid-pvst | reuso+ |

### 3.0 IP Routing (20%)

| part_id | slug | status |
|---------|------|--------|
| v2-3.1 | routing-table | — |
| v2-3.2 | static-tshoot | — |
| v2-3.3 | ospfv2-v3 | + OSPFv3 NOVO |
| v2-3.4 | fhrp | — |

### 4.0 Network Services & Security (20%)

| part_id | slug | status |
|---------|------|--------|
| v2-4.1 | aaa-local | — |
| v2-4.2 | sftp-scp | NOVO |
| v2-4.3 | nat-pat | — |
| v2-4.4 | dns-diagnose | NOVO |
| v2-4.5 | ipsec-vpn | — |
| v2-4.6 | acls | — |
| v2-4.7 | l2-security | + RA guard NOVO |

### 5.0 AI & Network Operations and Management (10%)

| part_id | slug | status |
|---------|------|--------|
| v2-5.1 | agentic-ai | NOVO crítico |
| v2-5.2 | ai-prompts | NOVO crítico |
| v2-5.3 | mgmt-approaches | — |
| v2-5.4 | snmp | — |
| v2-5.5 | ansible-use | upgrade Use |
| v2-5.6 | syslog | — |

---

## Prioridade de produção

| Prioridade | Parts |
|------------|--------|
| **P0** | 5.1, 5.2, 1.1, 4.4, 1.7 |
| **P1** | 1.6, 2.2, 2.4, 3.3, 4.7, 4.2 |
| **P2** | reuso melhorado restante |
| **P3** | merge no app / dual-track ou cutover |

---

## Fora de escopo v2 (por enquanto)

- Lab fabric/VXLAN profundo
- Python SDK / telemetry subscriptions avançadas
- Mini-jogos novos
- Stripe/paywall changes
- Tradução EN
