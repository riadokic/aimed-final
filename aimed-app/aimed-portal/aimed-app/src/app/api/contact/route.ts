import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is missing');
    return NextResponse.json(
      { error: 'Email service configuration missing' },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { name, email, phone, organization, message } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and Email are required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'AiMED Kontakt <onboarding@resend.dev>',
      to: ['riadokic@gmail.com'],
      subject: `Novi upit: ${name} (${organization || 'Nema ustanove'})`,
      replyTo: email,
      html: `
        <h2>Novi upit sa AiMED landing stranice</h2>
        <p><strong>Ime i prezime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone || 'Nije navedeno'}</p>
        <p><strong>Ustanova:</strong> ${organization || 'Nije navedeno'}</p>
        <br/>
        <p><strong>Poruka:</strong></p>
        <p>${message || 'Nema poruke'}</p>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
