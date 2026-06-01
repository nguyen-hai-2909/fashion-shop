import { useState, useRef, useEffect, useCallback } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri";
import ChatMessageContent from "./ChatMessageContent";
import { GetChatbotCatalogService } from "../../services/ProductService";
import "./SizeConsultant.css";

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

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

const BASE_PROMPT = `You are Fashion Store's friendly fashion assistant. You help with (1) size recommendations, (2) outfit ideas, and (3) product availability questions using the live catalog below.

Size chart (clothing):
- S: Height 150-158cm, Weight 42-50kg | M: 158-165cm, 50-58kg | L: 163-170cm, 58-66kg | XL: 168-175cm, 65-75kg | XXL: 173-180cm, 74-85kg
- Shoes: EU sizes 35–44

Outfit suggestions — give 2–4 concrete ideas when asked:
- Office / work: tailored shirt or blouse, neutral trousers or pencil skirt, closed-toe shoes
- Going out / casual: relaxed tee or knit top, jeans or wide-leg pants, sneakers
- Date / evening: dress or smart separates, one statement piece, comfortable heels
- Party / event: dress or coordinated set, bolder color or print, heels or dress shoes
- Weekend / travel: layers, comfortable fabrics, versatile shoes

Size help:
1. Ask height, weight, and measurements if needed
2. Between sizes: slim/bodycon → size up, loose fit → regular size

Language: Always reply in the SAME language the customer writes in.

Style:
- Short, warm, practical answers
- Plain text only — no markdown bold (**), no #. Use "- " for bullet lists
- Use friendly category names (e.g. "men's tops") never raw slugs
- Only reference products from the catalog below; never invent names or prices
- If a size is out of stock (stock 0), say so and suggest alternatives from the catalog
- Stay within fashion, sizing, and styling topics`;

function buildCatalogBlock(catalog) {
  if (!catalog || catalog.length === 0) return "";
  const CATEGORY_NAMES = {
    "ao-nam": "Men's tops",
    "quan-nam": "Men's pants",
    "vay": "Dresses",
    "thoi-trang-nu": "Women's fashion",
    "giay-tui": "Shoes & bags",
    "phu-kien": "Accessories",
  };
  const fmt = new Intl.NumberFormat("vi-VN");
  const lines = catalog.map((p) => {
    const catLabel = CATEGORY_NAMES[p.category] || p.category || "Other";
    const price = p.price ? `${fmt.format(p.price)}đ` : "";
    const variantSummary = (p.variants || [])
      .map((v) => {
        const color = v.color ? v.color : "";
        const size = v.size ? v.size : "";
        const stock = v.stock != null ? v.stock : 0;
        return `${color} ${size}(${stock > 0 ? `in stock: ${stock}` : "out of stock"})`.trim();
      })
      .join(", ");
    return `- ${p.name} | ${catLabel}${price ? ` | ${price}` : ""}${variantSummary ? ` | Variants: ${variantSummary}` : ""}`;
  });
  return `\nLive product catalog (${catalog.length} products):\n${lines.join("\n")}`;
}

function buildSystemPrompt(catalog) {
  return BASE_PROMPT + buildCatalogBlock(catalog);
}

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
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const catalogFetched = useRef(false);

  const fetchCatalog = useCallback(async () => {
    if (catalogFetched.current) return;
    catalogFetched.current = true;
    setCatalogLoading(true);
    try {
      const data = await GetChatbotCatalogService();
      const list = Array.isArray(data) ? data : [];
      setCatalog(list);
    } catch {
      setCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCatalog();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, fetchCatalog]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(catalog);
      const reply = await completeChat([
        { role: "system", content: systemPrompt },
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
        { role: "assistant", content: fallback },
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
                <p className="sc-title">Fashion AI Assistant</p>
                <span className="sc-status">
                  {catalogLoading
                    ? "Loading catalog…"
                    : catalog && catalog.length > 0
                    ? `Online · ${catalog.length} products`
                    : "Online"}
                </span>
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
