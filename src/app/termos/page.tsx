import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { CONTACT_EMAIL, CONTACT_MAILTO, SITE_ORIGIN } from "@/types/question";

export const metadata: Metadata = {
  title: "Termos — CCNA Forge",
  description: "Termos de uso do CCNA Forge.",
  alternates: { canonical: `${SITE_ORIGIN}/termos` },
};

export default function TermosPage() {
  return (
    <LegalDoc title="Termos de uso" prompt="$ cat /termos">
      <LegalSection heading="O app">
        <p>
          O CCNA Forge é um app de estudo (Trilha, Simulado, Estudo) para
          preparação. Não substitui a prova da Cisco nem a da AWS, e não emite
          certificado oficial.
        </p>
      </LegalSection>
      <LegalSection heading="Conta e trial">
        <p>
          Uma conta por pessoa. O trial de 24 horas vale 1 vez por conta. O PRO
          é pagamento único por período (7, 30 ou 120 dias), não é assinatura
          recorrente automática.
        </p>
      </LegalSection>
      <LegalSection heading="Reembolso">
        <p>
          Se precisar de reembolso, escreva para{" "}
          <a
            href={CONTACT_MAILTO}
            className="text-neon-green underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          em até 7 dias após o pagamento.
        </p>
      </LegalSection>
      <LegalSection heading="O que não pode">
        <p>
          Compartilhar conta, copiar ou scrapar o banco de questões, ou usar o
          app para redistribuir o conteúdo.
        </p>
      </LegalSection>
      <LegalSection heading="Foro">
        <p>Fica eleito o foro de Pinhais/PR, Brasil.</p>
      </LegalSection>
    </LegalDoc>
  );
}
