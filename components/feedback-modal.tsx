"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function FeedbackModal() {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setIsSubmitting(true)

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message, email }),
            })

            if (!response.ok) {
                throw new Error("Failed to send feedback")
            }

            setSuccess(true)
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                setMessage("")
                setEmail("")
            }, 2000)
        } catch (error) {
            console.error("Error sending feedback:", error)
            alert("Failed to send feedback. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="fixed bottom-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg">
                    <span>🐞</span> Report Bug / Feedback
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Send Feedback</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Found a bug or have a suggestion? Let me know!
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-lg font-medium text-green-400">Feedback Sent!</p>
                        <p className="text-sm text-white/60 mt-2">Thank you for your help.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-white">
                                Email (optional)
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message" className="text-white">
                                Message
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Describe the issue or suggestion..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[120px] focus:border-primary"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSubmitting ? "Sending..." : "Send Feedback"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
