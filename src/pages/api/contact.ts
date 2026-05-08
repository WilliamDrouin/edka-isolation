import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { contactSchema, typeProjetLabels, type ContactInput } from '../../lib/contact-schema';
import { checkRateLimit } from '../../lib/rate-limit';

export const prerender = false;

interface SuccessResponse {
  ok: true;
  demoMode: boolean;
}

interface ErrorResponse {
  ok: false;
  errors?: Record<string, string>;
  message?: string;
}

const json = (data: SuccessResponse | ErrorResponse, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const formatNotificationHtml = (data: ContactInput): string => {
  const escape = (s: string): string =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const rows: Array<[string, string | number | undefined]> = [
    ['Nom', data.nom],
    ['Courriel', data.courriel],
    ['Téléphone', data.telephone || '—'],
    ['Type de projet', typeProjetLabels[data.typeProjet]],
    ['Type de bâtiment', data.typeBatiment || '—'],
    [
      'Superficie',
      typeof data.superficiePiedsCarres === 'number'
        ? `${data.superficiePiedsCarres.toLocaleString('fr-CA')} pi²`
        : '—',
    ],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#475569;">${label}</td><td style="padding:6px 12px;">${escape(String(value ?? '—'))}</td></tr>`,
    )
    .join('');

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;color:#0F172A;">
      <h2 style="color:#0284C7;margin:0 0 12px;">Nouvelle demande de soumission</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:16px;">${tableRows}</table>
      <h3 style="margin:24px 0 8px;color:#0F172A;">Message</h3>
      <div style="white-space:pre-wrap;background:#F1F5F9;padding:16px;border-radius:8px;">${escape(data.message)}</div>
      <p style="color:#64748B;font-size:12px;margin-top:24px;">Envoyé via le formulaire de contact d'isolation-edka.ca</p>
    </div>
  `;
};

const formatConfirmationHtml = (data: ContactInput): string => `
  <div style="font-family:system-ui,sans-serif;max-width:600px;color:#0F172A;">
    <h2 style="color:#0284C7;margin:0 0 12px;">Merci ${data.nom.split(' ')[0]} !</h2>
    <p>Nous avons bien reçu votre demande de soumission. Un membre de notre équipe vous contactera sous 24 à 48 heures ouvrables pour discuter de votre projet.</p>
    <p>D'ici là, n'hésitez pas à parcourir nos <a href="https://isolation-edka.ca/realisations" style="color:#0284C7;">réalisations récentes</a> ou à consulter les <a href="https://isolation-edka.ca/subventions" style="color:#0284C7;">programmes de subventions admissibles</a>.</p>
    <p style="margin-top:24px;color:#64748B;font-size:14px;">— L'équipe Isolation EDKA<br/>Saint-Georges-de-Beauce</p>
  </div>
`;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress ?? 'unknown';
  const rate = checkRateLimit({ key: `contact:${ip}`, limit: 3, windowMs: 15 * 60 * 1000 });
  if (!rate.allowed) {
    return json(
      {
        ok: false,
        message: 'Trop de soumissions récentes. Veuillez réessayer dans quelques minutes.',
      },
      429,
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, message: 'Requête invalide.' }, 400);
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return json({ ok: false, errors: fieldErrors }, 400);
  }

  const data = parsed.data;

  if (data.siteWeb && data.siteWeb.length > 0) {
    return json({ ok: true, demoMode: false });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const emailTo = import.meta.env.CONTACT_EMAIL_TO;
  const emailFrom = import.meta.env.CONTACT_EMAIL_FROM;

  const demoMode = !apiKey || !emailTo || !emailFrom;

  if (demoMode) {
    console.info('[contact] Demo mode — would send the following payload:');
    console.info({
      to: emailTo ?? '(non configuré)',
      from: emailFrom ?? '(non configuré)',
      data,
    });
    return json({ ok: true, demoMode: true });
  }

  try {
    const resend = new Resend(apiKey);

    await Promise.all([
      resend.emails.send({
        from: emailFrom,
        to: emailTo,
        replyTo: data.courriel,
        subject: `Soumission — ${data.nom} (${typeProjetLabels[data.typeProjet]})`,
        html: formatNotificationHtml(data),
      }),
      resend.emails.send({
        from: emailFrom,
        to: data.courriel,
        subject: 'Nous avons bien reçu votre demande — Isolation EDKA',
        html: formatConfirmationHtml(data),
      }),
    ]);

    return json({ ok: true, demoMode: false });
  } catch (error) {
    console.error('[contact] Resend send failed:', error);
    return json(
      {
        ok: false,
        message: "L'envoi a échoué. Veuillez réessayer ou nous appeler directement.",
      },
      502,
    );
  }
};
