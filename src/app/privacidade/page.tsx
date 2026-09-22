import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { CONTACT_EMAIL, CONTACT_MAILTO, SITE_ORIGIN } from "@/types/question";

export const metadata: Metadata = {
  title: "Privacidade — CCNA Forge",
  description: "Aviso de privacidade (LGPD) do CCNA Forge.",
  alternates: { canonical: `${SITE_ORIGIN}/privacidade` },
};

export default function PrivacidadePage() {
  return (
    <LegalDoc title="Privacidade" prompt="$ cat /privacidade">
      <LegalSection heading="Quem">
        <p>
          CCNA Forge, operação de Daniel Alber Rodrigues Costa. Contato:{" "}
          <a
            href={CONTACT_MAILTO}
            className="text-neon-green underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
      <LegalSection heading="O que coletamos">
        <ul className="list-disc space-y-1 pl-4">
          <li>Conta: e-mail e, se você escolher, login Google via Supabase.</li>
          <li>Progresso de estudo no seu aparelho (localStorage).</li>
          <li>
            Pagamento processado pelo Stripe. Não guardamos número de cartão nem
            chave PIX.
          </li>
        </ul>
      </LegalSection>
      <LegalSection heading="Para quê">
        <p>
          Entrar na conta, trial de 24 horas, liberar o PRO e melhorar o app
          (sessão, progresso, histórico de simulado se você estiver logado).
        </p>
      </LegalSection>
      <LegalSection heading="Base">
        <p>
          Execução de contrato (uso do app e do plano PRO) e consentimento
          (criar conta / aceitar o trial).
        </p>
      </LegalSection>
      <LegalSection heading="Cookies">
        <p>
          Só o essencial de sessão e autenticação. Sem cookies de remarketing ou
          anúncio de terceiros.
        </p>
      </LegalSection>
      <LegalSection heading="Seus direitos (LGPD)">
        <p>
          Acesso, correção e exclusão dos dados da conta. Peça pelo e-mail{" "}
          <a
            href={CONTACT_MAILTO}
            className="text-neon-green underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
      <LegalSection heading="Terceiros">
        <p>
          Vercel (hospedagem), Supabase (login e banco da conta), Stripe
          (pagamento).
        </p>
      </LegalSection>
      <LegalSection heading="Retenção">
        <p>
          Dados da conta enquanto ela existir. localStorage fica no seu
          dispositivo até você limpar o navegador ou desinstalar o PWA.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
