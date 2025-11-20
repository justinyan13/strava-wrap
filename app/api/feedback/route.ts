import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
    try {
        const { message, email } = await req.json()

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        // Check if credentials are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email credentials not found in environment variables")
            // In development/demo, we might simulate success or return error
            // For now, let's return an error to prompt configuration
            return NextResponse.json(
                { error: "Server email configuration missing" },
                { status: 500 }
            )
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "justinyan.strava@gmail.com",
            subject: `Strava Wrapped Feedback${email ? ` from ${email}` : ""}`,
            text: `
New feedback received:

Message:
${message}

Sender Email: ${email || "Not provided"}
      `,
            html: `
        <h2>New Feedback Received</h2>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
        <p><strong>Sender Email:</strong> ${email || "Not provided"}</p>
      `,
        }

        await transporter.sendMail(mailOptions)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error sending email:", error)
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        )
    }
}
