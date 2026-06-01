import { useState, useRef, useEffect, useCallback } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri";
import ChatMessageContent from "./ChatMessageContent";
import { GetChatbotCatalogService } from "../../services/ProductService";
import "./SizeConsultant.css";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "openrouter/free",
];

async function completeChat(apiMessages) {
  let lastError = null;

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Fashion Store Size Consultant",
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      if (!res.ok || data?.error) {
        const apiMsg =
          data?.error?.message || data?.message || `HTTP ${res.status}`;
        throw new Error(apiMsg);
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Empty response");
      }

      return content;
    } catch (err) {
      lastError = err;
      console.warn(`[SizeConsultant] ${model} failed:`, err?.message);
    }
  }

  throw lastError ?? new Error("All models unavailable");
}

const SYSTEM_PROMPT = `You are Fashion Store's friendly fashion assistant. You help with (1) size recommendations and (2) outfit ideas for different occasions.

Store categories (suggest browsing these on the site when relevant):
- Men's tops (ao-nam): shirts, polos, tees
- Men's pants (quan-nam): chinos, trousers, jeans
- Dresses (vay): dresses for events and casual wear
- Women's fashion (thoi-trang-nu): tops, skirts, coordinated looks
- Shoes & bags (giay-tui): sneakers, heels, bags — shoe sizes 35–44
- Accessories (phu-kien): belts, scarves, jewelry

Size chart (clothing):
- S: Height 150-158cm, Weight 42-50kg | M: 158-165cm, 50-58kg | L: 163-170cm, 58-66kg | XL: 168-175cm, 65-75kg | XXL: 173-180cm, 74-85kg

Outfit suggestions — when the customer asks what to wear or is shopping for a purpose, give 2–4 concrete ideas. Examples:
- Office / work: tailored shirt or blouse, neutral trousers or pencil skirt, closed-toe shoes, minimal accessories
- Going out / casual hangout: relaxed tee or knit top, jeans or wide-leg pants, sneakers or loafers
- Date / evening: dress or smart separates, one statement piece, comfortable heels or clean sneakers
- Party / event: dress or coordinated set, bolder color or print, heels or dress shoes
- Weekend / travel: layers, comfortable fabrics, versatile shoes
Ask gender and vibe (formal vs relaxed) if unclear, then suggest items from the categories above.

Size help:
1. Ask height, weight, and measurements if needed
2. Recommend size from the chart; between sizes: slim/bodycon → size up, loose fit → regular size
3. For shoes, use EU sizes 35–44

Language:
- Always reply in the SAME language the customer uses in their latest message (Vietnamese → Vietnamese, English → English, etc.). If they mix languages, use the language they used most in that message.

Style:
- Short, warm, practical answers
- Use plain text only: do NOT use markdown (**bold**, ##, or * bullets). For lists use lines starting with "- " (dash space)
- When mentioning store sections, use friendly names (e.g. "men's tops", "men's pants") — never raw slugs like ao-nam
- Do not invent products or prices; suggest types of items to browse on Fashion Store
- Stay within fashion, sizing, and styling — politely decline unrelated topics`;

const WELCOME_MSG = {
  role: "assistant",
  content:
    "Hi! I'm Fashion Store's AI assistant 👗\n\nI can help you pick the right size, or suggest outfits — office wear, casual hangouts, dates, parties, and more.\n\nTell me what you need (in any language you prefer)!",
};

export default function SizeConsultant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await completeChat([
        { role: "system", content: SYSTEM_PROMPT },
        ...nextMessages,
      ]);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const fallback =
        err?.message?.includes("rate") || err?.message?.includes("429")
          ? "The assistant is busy. Please wait a moment and try again."
          : "Sorry, something went wrong. Please try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallback,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {open && (
        <div className="sc-window">
          <div className="sc-header">
            <div className="sc-header-info">
              <div className="sc-avatar">
                <RiRobot2Line />
              </div>
              <div>
                <p className="sc-title">ChatBot Support Helper</p>
                <span className="sc-status">Online</span>
              </div>
            </div>
            <button
              className="sc-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          <div className="sc-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`sc-bubble-wrap ${msg.role === "user" ? "sc-user" : "sc-bot"}`}
              >
                <div className="sc-bubble">
                  <ChatMessageContent content={msg.content} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="sc-bubble-wrap sc-bot">
                <div className="sc-bubble sc-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="sc-input-row">
            <textarea
              ref={inputRef}
              className="sc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter your height, weight..."
              rows={1}
            />
            <button
              className="sc-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      <button
        className="sc-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Chatbot"
        title="ChatBot Suppoer Helper"
      >
        {open ? <FaTimes /> : <RiRobot2Line />}
      </button>
    </>
  );
}
